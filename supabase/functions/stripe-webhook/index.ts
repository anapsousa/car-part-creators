import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { getSecurityHeaders, logAudit, extractClientIp } from '../_shared/security.ts';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("CONTACT_FROM_EMAIL") || "noreply@dr3amtoreal.com";
const SITE_URL = Deno.env.get("SITE_URL") || "https://dr3amtoreal.com";

const ALLOWED_ORIGINS = [
  "https://dr3amtoreal.com",
  "https://www.dr3amtoreal.com",
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

// Helper function to format currency
function formatCurrency(amount: number, currency: string = 'eur'): string {
  return new Intl.NumberFormat('pt-PT', { 
    style: 'currency', 
    currency: currency.toUpperCase() 
  }).format(amount / 100);
}

// Helper function to send order confirmation email
async function sendOrderConfirmationEmail(
  email: string,
  customerName: string,
  orderId: string,
  orderItems: Array<{ name: string; quantity: number; price: number }>,
  totalAmount: number,
  shippingAddress: any,
  paymentMethod: string
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured - skipping email notification");
    return false;
  }

  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  const addressHtml = shippingAddress ? `
    <p><strong>Shipping Address:</strong><br>
    ${shippingAddress.name || customerName}<br>
    ${shippingAddress.address || ''}<br>
    ${shippingAddress.postal_code || ''} ${shippingAddress.city || ''}<br>
    ${shippingAddress.country || 'Portugal'}</p>
  ` : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #5D3FD3; margin-bottom: 5px;">Dr3amToReal</h1>
        <p style="color: #666; font-size: 14px;">Custom 3D Design & Printing</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #5D3FD3 0%, #7C3AED 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0;">🎉 Order Confirmed!</h2>
        <p style="margin: 0; opacity: 0.9;">Thank you for your purchase, ${customerName}!</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0;"><strong>Order ID:</strong> ${orderId.substring(0, 8).toUpperCase()}</p>
        <p style="margin: 0 0 10px 0;"><strong>Payment Method:</strong> ${paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod.toUpperCase()}</p>
        <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>
      
      <h3 style="border-bottom: 2px solid #5D3FD3; padding-bottom: 10px;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f0f0f0;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
            <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #5D3FD3;">${formatCurrency(totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
      
      ${addressHtml}
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>📦 What's Next?</strong></p>
        <p style="margin: 10px 0 0 0;">We'll start preparing your order shortly. You'll receive another email when it's shipped!</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">Questions about your order? Reply to this email or contact us at <a href="mailto:dr3amtoreal@gmail.com" style="color: #5D3FD3;">dr3amtoreal@gmail.com</a></p>
        <p style="color: #999; font-size: 12px;">${SITE_URL}</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Order Confirmed - Dr3amToReal

Thank you for your purchase, ${customerName}!

Order ID: ${orderId.substring(0, 8).toUpperCase()}
Payment Method: ${paymentMethod}
Date: ${new Date().toLocaleDateString('pt-PT')}

Order Details:
${orderItems.map(item => `- ${item.name} x${item.quantity}: ${formatCurrency(item.price * item.quantity)}`).join('\n')}

Total: ${formatCurrency(totalAmount)}

What's Next?
We'll start preparing your order shortly. You'll receive another email when it's shipped!

Questions? Contact us at dr3amtoreal@gmail.com

${SITE_URL}
  `.trim();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Dr3amToReal <${FROM_EMAIL}>`,
        to: [email],
        subject: `Order Confirmed #${orderId.substring(0, 8).toUpperCase()} — Dr3amToReal`,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error sending order confirmation:", err);
      return false;
    }

    console.log("Order confirmation email sent:", { email, orderId });
    return true;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
}

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
  const guestName = session.metadata?.guest_name;
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
        paid_at: new Date().toISOString(),
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
        const customerEmail = isGuest ? guestEmail : session.customer_email;
        if (customerEmail) {
          await logAudit(supabase, orderId, 'paid', customerEmail, req, { 
            stripe_session_id: session.id,
            stripe_payment_intent_id: paymentIntent.id,
            amount: paymentIntent.amount 
          });
        }

        // Send order confirmation email
        if (customerEmail) {
          try {
            // Fetch order with items for email
            const { data: orderData } = await supabase
              .from("orders")
              .select("*, order_items(*, products(name, price))")
              .eq("id", orderId)
              .single();

            if (orderData) {
              const orderItems = (orderData.order_items || []).map((item: any) => ({
                name: item.products?.name || 'Product',
                quantity: item.quantity,
                price: item.price_at_purchase * 100, // Convert to cents for formatting
              }));

              await sendOrderConfirmationEmail(
                customerEmail,
                guestName || orderData.guest_name || 'Customer',
                orderId,
                orderItems,
                orderData.total_amount * 100, // Convert to cents
                orderData.shipping_address,
                paymentMethod
              );
            }
          } catch (emailError) {
            console.error('Failed to send order confirmation email (non-critical):', emailError);
          }
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
            const customerEmail = isGuest ? guestEmail : session.customer_email;
            if (customerEmail) {
              await logAudit(supabase, orderId, 'paid', customerEmail, req, { stripe_session_id: session.id, amount: session.amount_total });
            }

            // Send order confirmation email
            if (customerEmail) {
              try {
                // Fetch order with items for email
                const { data: orderData } = await supabase
                  .from("orders")
                  .select("*, order_items(*, products(name, price))")
                  .eq("id", orderId)
                  .single();

                if (orderData) {
                  const guestName = session.metadata?.guest_name;
                  const orderItems = (orderData.order_items || []).map((item: any) => ({
                    name: item.products?.name || 'Product',
                    quantity: item.quantity,
                    price: item.price_at_purchase * 100, // Convert to cents for formatting
                  }));

                  await sendOrderConfirmationEmail(
                    customerEmail,
                    guestName || orderData.guest_name || 'Customer',
                    orderId,
                    orderItems,
                    orderData.total_amount * 100, // Convert to cents
                    orderData.shipping_address,
                    paymentMethod
                  );
                }
              } catch (emailError) {
                console.error('Failed to send order confirmation email (non-critical):', emailError);
              }
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
