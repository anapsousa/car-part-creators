import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const ALLOWED_ORIGINS = [
  'https://dr3amtoreal.com',
  'https://www.dr3amtoreal.com',
  'https://pompousweek.com',
  'http://localhost:5173',
  'http://localhost:8080',
  'https://lovable.dev',
  'https://khdczrzplqssygwoyjte.lovable.app',
  'https://id-preview--1f05c717-5032-4e33-8db0-cd1f4a64f257.lovable.app',
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { designId } = await req.json();

    if (!designId) {
      console.error('create-checkout: Missing designId');
      throw new Error("Missing designId");
    }

    console.log('create-checkout: Processing design', designId);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error('create-checkout: Missing Supabase configuration');
      throw new Error("Missing Supabase configuration");
    }

    if (!stripeKey) {
      console.error('create-checkout: Missing STRIPE_SECRET_KEY');
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Get the user from the JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    console.log("Creating Stripe checkout for design:", designId);

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        design_id: designId,
        amount: 9.99,
        currency: "EUR",
        payment_method: "stripe",
        payment_status: "pending",
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Payment record error:", paymentError);
      throw paymentError;
    }

    // Get origin for redirect URLs with fallback
    const requestOrigin = req.headers.get("origin");
    const baseUrl = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin) 
      ? requestOrigin 
      : ALLOWED_ORIGINS[0]; // Default to dr3amtoreal.com
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "paypal", "multibanco"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "3D Model Generation",
              description: "AI-generated 3D model for 3D printing",
            },
            unit_amount: 999, // €9.99 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
      cancel_url: `${baseUrl}/checkout?design=${designId}`,
      metadata: {
        payment_id: payment.id,
        design_id: designId,
        user_id: user.id,
      },
    });

    console.log('create-checkout: Stripe session created', session.id);

    // Update payment with Stripe session ID
    await supabase
      .from("payments")
      .update({ payment_reference: session.id })
      .eq("id", payment.id);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in create-checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
