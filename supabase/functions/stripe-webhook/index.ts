import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { getSecurityHeaders, logAudit, extractClientIp } from '../_shared/security.ts';

const ALLOWED_ORIGINS = [
  "https://pompousweek.com",
  "http://localhost:5173",
  "https://lovable.dev",
  "https://khdczrzplqssygwoyjte.lovable.app",
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

// Helper function to handle successful PaymentIntent
async function handlePaymentIntentSuccess(
  paymentIntent: Stripe.PaymentIntent,
  session: Stripe.Checkout.Session,
  supabase: any,
  req: Request
) {
  const orderId = session.metadata?.order_id;
  const paymentId = session.metadata?.payment_id;
  const isGuest = session.metadata?.is_guest === 'true';
  const guestEmail = session.metadata?.guest_email;
  const sessionId = session.metadata?.session_id;

  // Handle design payment
  if (paymentId) {
    try {
      const { error } = await supabase
        .from("payments")
        .update({
          payment_status: "completed",
          payment_reference: paymentIntent.id,
          metadata: { 
            stripe_payment_intent_id: paymentIntent.id,
            payment_method: paymentIntent.payment_method_types?.[0] || 'unknown'
          },
        })
        .eq("id", paymentId);

      if (error) {
        console.error("Error updating payment from PaymentIntent:", error);
      } else {
        console.log("Payment record updated from PaymentIntent:", paymentId);
      }
    } catch (error) {
      console.error("Exception during payment update from PaymentIntent:", { paymentId, error });
    }
  }

  // Handle product order
  if (orderId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      console.warn('Invalid orderId format in PaymentIntent:', { orderId });
      return;
    }

        try {
          // Get payment method from PaymentIntent (card, mbway, multibanco, etc.)
          const paymentMethod = paymentIntent.payment_method_types?.[0] || 'unknown';
          
          // Update order with payment confirmation (source of truth)
          const updateData: any = {
            status: 'paid',
            stripe_session_id: session.id,
            stripe_payment_intent_id: paymentIntent.id,
            payment_method: paymentMethod,
            paid_at: new Date().toISOString(), // Timestamp when payment confirmed
          };
          
          const { error } = await supabase
            .from("orders")
            .update(updateData)
            .eq("id", orderId);

      if (error) {
        console.error('Error updating order from PaymentIntent:', { orderId, error });
      } else {
        console.log('Order updated from PaymentIntent:', { orderId, isGuest });

        // Audit logging
        if (isGuest && guestEmail) {
          await logAudit(supabase, orderId, 'paid', guestEmail, req, { 
            stripe_session_id: session.id,
            stripe_payment_intent_id: paymentIntent.id,
            amount: paymentIntent.amount 
          });
        } else if (!isGuest) {
          await logAudit(supabase, orderId, 'paid', session.customer_email || 'unknown', req, { 
            stripe_session_id: session.id,
            stripe_payment_intent_id: paymentIntent.id 
          });
        }

        // Cart cleanup for guest orders
        if (isGuest && sessionId) {
          try {
            await supabase
              .from("cart_items")
              .delete()
              .eq("session_id", sessionId);
            console.log('Anonymous cart cleared from PaymentIntent:', { sessionId, orderId });
          } catch (e) {
            console.error('Exception during cart cleanup from PaymentIntent:', { sessionId, orderId, e });
          }
        }
      }
    } catch (error) {
      console.error("Exception during order update from PaymentIntent:", { orderId, error });
    }
  }
}

// Helper function to handle failed PaymentIntent
async function handlePaymentIntentFailure(
  paymentIntent: Stripe.PaymentIntent,
  session: Stripe.Checkout.Session,
  supabase: any,
  req: Request,
  errorMessage: string
) {
  const orderId = session.metadata?.order_id;
  const paymentId = session.metadata?.payment_id;

  if (paymentId) {
    try {
      await supabase
        .from("payments")
        .update({
          payment_status: "failed",
          payment_reference: paymentIntent.id,
          metadata: { 
            stripe_payment_intent_id: paymentIntent.id,
            error_message: errorMessage
          },
        })
        .eq("id", paymentId);
      console.log('Payment marked as failed:', paymentId);
    } catch (error) {
      console.error('Error updating failed payment:', { paymentId, error });
    }
  }

  if (orderId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(orderId)) {
          try {
            // Update order - stripe_payment_intent_id is optional (column may not exist)
            const updateData: any = { status: 'cancelled' };
            // Only include stripe_payment_intent_id if column exists (will fail silently if not)
            updateData.stripe_payment_intent_id = paymentIntent.id;
            
            await supabase
              .from("orders")
              .update(updateData)
              .eq("id", orderId);
        console.log('Order marked as cancelled due to payment failure:', orderId);
      } catch (error) {
        console.error('Error updating failed order:', { orderId, error });
      }
    }
  }
}

serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...getCorsHeaders(origin), ...getSecurityHeaders() } });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    // SECURITY: Webhook secret is mandatory to prevent forged webhook attacks
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured - webhook rejected for security");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        {
          status: 500,
          headers: { ...getCorsHeaders(origin), ...getSecurityHeaders(), "Content-Type": "application/json" },
        },
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No stripe signature");
    }

    const body = await req.text();
    let event: Stripe.Event;

    // SECURITY: Always verify webhook signature - no fallback to unsigned webhooks
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', { 
        error: err.message, 
        ip: extractClientIp(req) 
      });
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 400,
          headers: { ...getCorsHeaders(origin), ...getSecurityHeaders(), "Content-Type": "application/json" },
        },
      );
    }

    // Rate limiting omitted - Stripe webhooks are already rate-limited and signature-verified
    console.log('Webhook received:', { type: event.type, ip: extractClientIp(req), timestamp: new Date().toISOString() });

    // Handle PaymentIntent events for delayed payment methods (MBWay, Multibanco, etc.)
    // According to Stripe docs: https://docs.stripe.com/payments/payment-intents/verifying-status#webhooks
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      console.log('PaymentIntent succeeded:', { 
        payment_intent_id: paymentIntent.id, 
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status 
      });

      // Get the checkout session from the PaymentIntent metadata or retrieve it
      // PaymentIntents created by Checkout Sessions have metadata
      const checkoutSessionId = paymentIntent.metadata?.checkout_session_id;
      
      if (checkoutSessionId) {
        try {
          // Retrieve the checkout session to get our metadata (order_id, payment_id)
          const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
          await handlePaymentIntentSuccess(paymentIntent, session, supabase, req);
        } catch (error) {
          console.error('Error retrieving checkout session for PaymentIntent:', { 
            payment_intent_id: paymentIntent.id, 
            checkout_session_id: checkoutSessionId, 
            error 
          });
        }
      } else {
        // Try to find checkout session by PaymentIntent ID
        // Checkout sessions have payment_intent in their payment_intent field
        try {
          const sessions = await stripe.checkout.sessions.list({
            payment_intent: paymentIntent.id,
            limit: 1,
          });

          if (sessions.data.length > 0) {
            await handlePaymentIntentSuccess(paymentIntent, sessions.data[0], supabase, req);
          } else {
            console.warn('No checkout session found for PaymentIntent:', paymentIntent.id);
          }
        } catch (error) {
          console.error('Error finding checkout session for PaymentIntent:', { 
            payment_intent_id: paymentIntent.id, 
            error 
          });
        }
      }
    }

    // Handle failed PaymentIntent
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed';
      
      console.log('PaymentIntent failed:', { 
        payment_intent_id: paymentIntent.id,
        error: errorMessage,
        status: paymentIntent.status 
      });

      // Try to find and update related order/payment
      try {
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        if (sessions.data.length > 0) {
          const session = sessions.data[0];
          await handlePaymentIntentFailure(paymentIntent, session, supabase, req, errorMessage);
        }
      } catch (error) {
        console.error('Error handling PaymentIntent failure:', { 
          payment_intent_id: paymentIntent.id, 
          error 
        });
      }
    }

    // Handle processing PaymentIntent (for delayed payment methods)
    if (event.type === "payment_intent.processing") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      console.log('PaymentIntent processing (delayed payment method):', { 
        payment_intent_id: paymentIntent.id,
        payment_method: paymentIntent.payment_method_types?.[0],
        status: paymentIntent.status 
      });

      // Update status to processing - payment is submitted but not yet confirmed
      // This is normal for MBWay, Multibanco, and other delayed payment methods
      try {
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        if (sessions.data.length > 0) {
          const session = sessions.data[0];
          const orderId = session.metadata?.order_id;
          const paymentId = session.metadata?.payment_id;

          if (orderId) {
            // Update order status to processing (for delayed payment methods)
            const paymentMethod = paymentIntent.payment_method_types?.[0] || 'unknown';
            const updateData: any = {
              status: 'processing',
              stripe_payment_intent_id: paymentIntent.id,
              payment_method: paymentMethod, // Store payment method even when processing
            };
            
            await supabase
              .from("orders")
              .update(updateData)
              .eq("id", orderId);
            console.log('Order status updated to processing:', { orderId, paymentMethod });
          }

          if (paymentId) {
            await supabase
              .from("payments")
              .update({
                payment_status: "processing",
                payment_reference: paymentIntent.id,
              })
              .eq("id", paymentId);
            console.log('Payment status updated to processing:', paymentId);
          }
        }
      } catch (error) {
        console.error('Error handling PaymentIntent processing:', { 
          payment_intent_id: paymentIntent.id, 
          error 
        });
      }
    }

    // Handle successful payment (immediate payment methods)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.payment_id;
      const orderId = session.metadata?.order_id;
      const isGuest = session.metadata?.is_guest === 'true';
      const guestEmail = session.metadata?.guest_email;
      const sessionId = session.metadata?.session_id;

      // Handle design payment (existing logic)
      if (paymentId) {
        try {
          console.log("Payment completed:", paymentId);

          // Update payment status
          const { error } = await supabase
            .from("payments")
            .update({
              payment_status: "completed",
              payment_reference: session.id,
            })
            .eq("id", paymentId);

          if (error) {
            console.error("Error updating payment:", error);
          } else {
            console.log("Payment record updated successfully");
          }
        } catch (error) {
          console.error("Exception during payment update:", { paymentId, error });
        }
      }

      // Handle product order (new logic)
      if (orderId) {
        // Validate orderId is a valid UUID to prevent injection
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(orderId)) {
          console.warn('Invalid orderId format:', { orderId, ip: extractClientIp(req) });
          // Return 200 to avoid Stripe retries, but log the issue
          return new Response(
            JSON.stringify({ received: true }),
            {
              headers: { ...getCorsHeaders(origin), ...getSecurityHeaders(), "Content-Type": "application/json" },
            },
          );
        }

        try {
          console.log('Order completed:', { orderId, isGuest, guestEmail });

          // Ensure payment is actually paid before updating order
          if (session.payment_status !== 'paid') {
            console.warn('Payment not completed, skipping order update:', { orderId, payment_status: session.payment_status });
            return new Response(
              JSON.stringify({ received: true }),
              {
                headers: { ...getCorsHeaders(origin), ...getSecurityHeaders(), "Content-Type": "application/json" },
              },
            );
          }

          // Get PaymentIntent to extract payment method (for immediate payments like cards)
          let paymentMethod = 'unknown';
          let paymentIntentId: string | null = null;
          if (session.payment_intent && typeof session.payment_intent === 'string') {
            try {
              paymentIntentId = session.payment_intent;
              const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
              paymentMethod = paymentIntent.payment_method_types?.[0] || 'unknown';
            } catch (error) {
              console.warn('Could not retrieve PaymentIntent for immediate payment:', error);
            }
          }

          // Update order status with payment confirmation (source of truth)
          const updateData: any = {
            status: 'paid',
            stripe_session_id: session.id,
            payment_method: paymentMethod,
            paid_at: new Date().toISOString(), // Timestamp when payment confirmed
          };
          if (paymentIntentId) {
            updateData.stripe_payment_intent_id = paymentIntentId;
          }

          const { error } = await supabase
            .from("orders")
            .update(updateData)
            .eq("id", orderId);

          if (error) {
            console.error('Error updating order:', { orderId, error });
          } else {
            console.log('Order updated successfully:', { orderId, isGuest });

            // Audit logging for compliance - silent fail to not break webhook processing
            if (isGuest && guestEmail) {
              await logAudit(supabase, orderId, 'paid', guestEmail, req, { stripe_session_id: session.id, amount: session.amount_total });
            } else if (!isGuest) {
              await logAudit(supabase, orderId, 'paid', session.customer_email || 'unknown', req, { stripe_session_id: session.id });
            }

            if (isGuest) {
              console.log('Guest order confirmed - email notification pending:', { orderId, guestEmail });
              // TODO: Implement email notification service for guest orders
            }

            // Optional cart cleanup for guest orders
            if (isGuest && sessionId) {
              try {
                const { error: deleteError } = await supabase
                  .from("cart_items")
                  .delete()
                  .eq("session_id", sessionId);

                if (deleteError) {
                  console.error('Error clearing anonymous cart:', { sessionId, orderId, deleteError });
                } else {
                  console.log('Anonymous cart cleared:', { sessionId, orderId });
                }
              } catch (e) {
                console.error('Exception during cart cleanup:', { sessionId, orderId, e });
              }
            }
          }
        } catch (error) {
          console.error("Exception during order update:", { orderId, error });
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...getCorsHeaders(origin), ...getSecurityHeaders(), "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error('Webhook error:', { error: error.message, ip: extractClientIp(req) });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...getCorsHeaders(origin), ...getSecurityHeaders(), "Content-Type": "application/json" },
      },
    );
  }
});
