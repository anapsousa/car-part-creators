import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const ALLOWED_ORIGINS = [
  "https://pompousweek.com",
  "http://localhost:5173",
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
    return new Response(null, { headers: getCorsHeaders(origin) });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
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

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
      console.warn("Webhook signature verification skipped - configure STRIPE_WEBHOOK_SECRET");
    }

    console.log("Stripe webhook event:", event.type);

    // Handle successful payment
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.payment_id;

      if (paymentId) {
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
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
      },
    );
  }
});
