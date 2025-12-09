// Rate limiting: 10 requests per IP per hour for checkout endpoint
// Input sanitization: Applied to guest info to prevent XSS and injection
// Audit logging: Best-effort logging for compliance, does not block checkout
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getSecurityHeaders, sanitizeGuestInfo, checkRateLimit, logAudit, extractClientIp, sanitizeString } from '../_shared/security.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const clientIp = extractClientIp(req);
  const isAllowed = await checkRateLimit(supabaseClient, clientIp, '/create-product-checkout', 10);
  if (!isAllowed) {
    console.warn('Rate limit exceeded:', { ip: clientIp, endpoint: '/create-product-checkout' });
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
      headers: { ...corsHeaders, ...getSecurityHeaders(), "Content-Type": "application/json" },
      status: 429,
    });
  }

  let user = null;
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
    }
    console.log('Checkout initiated by:', user ? 'authenticated user' : 'guest');

    const { cartItems, shippingInfo, guestInfo } = await req.json();

    const sanitizedGuestInfo = guestInfo ? { ...sanitizeGuestInfo(guestInfo), sessionId: guestInfo.sessionId ? sanitizeString(guestInfo.sessionId) : undefined } : null;

    if (!user && !sanitizedGuestInfo?.email) {
      throw new Error("Email is required for guest checkout");
    }

    if (sanitizedGuestInfo) {
      if (/^\d+$/.test(sanitizedGuestInfo.name)) {
        throw new Error("Name cannot contain only numbers");
      }
      if (sanitizedGuestInfo.address.length < 10) {
        throw new Error("Address must be at least 10 characters");
      }
    }

    console.log('Guest email validated:', sanitizedGuestInfo?.email);

    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user?.email || sanitizedGuestInfo?.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create line items from cart
    const lineItems = [];
    let totalAmount = 0;

    for (const item of cartItems) {
      const { data: product } = await supabaseClient
        .from("products")
        .select("*")
        .eq("id", item.product_id)
        .single();

      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }

      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
            description: product.description,
            images: product.images && product.images.length > 0 ? [product.images[0]] : [],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      });

      totalAmount += product.price * item.quantity;
    }

    // Create order in database
    const orderData: any = {
      total_amount: totalAmount,
      status: "pending",
      shipping_address: shippingInfo,
    };
    if (user) {
      orderData.user_id = user.id;
      orderData.is_guest_order = false;
    } else if (sanitizedGuestInfo) {
      orderData.is_guest_order = true;
      orderData.guest_email = sanitizedGuestInfo.email;
      orderData.guest_name = sanitizedGuestInfo.name;
    }
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;
    console.log('Creating order:', { is_guest: !user, order_id: order.id });

    await logAudit(supabaseClient, order.id, 'created', sanitizedGuestInfo?.email || user?.email || 'unknown', req, { total_amount: totalAmount, item_count: cartItems.length });

    // Create order items
    for (const item of cartItems) {
      const { data: product } = await supabaseClient
        .from("products")
        .select("price")
        .eq("id", item.product_id)
        .single();

      if (!product) continue;

      await supabaseClient.from("order_items").insert({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: product.price,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : (user?.email || sanitizedGuestInfo?.email),
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout/success?order_id=${order.id}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      metadata: {
        order_id: order.id,
        is_guest: (!user).toString(),
        guest_email: sanitizedGuestInfo?.email || '',
        session_id: sanitizedGuestInfo?.sessionId || '',
      },
    });
    console.log('Stripe session created:', { session_id: session.id, is_guest: !user });

    // Update order with stripe session id
    await supabaseClient
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, ...getSecurityHeaders(), "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error('Checkout error:', { error: errorMessage, ip: clientIp, is_guest: !user, timestamp: new Date().toISOString() });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, ...getSecurityHeaders(), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
