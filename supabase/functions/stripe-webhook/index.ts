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

    // Handle successful payment
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

          // Update order status
          const { error } = await supabase
            .from("orders")
            .update({
              status: 'paid',
              stripe_session_id: session.id,
            })
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
