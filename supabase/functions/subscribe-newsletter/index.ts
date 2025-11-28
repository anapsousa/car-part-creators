import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, language, consent_given } = await req.json();

    // Validate inputs
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    if (!language || !['en', 'pt'].includes(language)) {
      return new Response(
        JSON.stringify({ error: "Invalid language. Must be 'en' or 'pt'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    if (consent_given !== true) {
      return new Response(
        JSON.stringify({ error: "Consent must be given" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendAudienceId = Deno.env.get("RESEND_AUDIENCE_ID");

    if (!supabaseUrl || !supabaseKey || !resendApiKey || !resendAudienceId) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    // Check for existing subscription
    const { data: existing, error: queryError } = await supabase
      .from("newsletter_subscriptions")
      .select("*")
      .eq("email", email)
      .single();

    if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error("Database query error:", queryError);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let resendContactId = null;
    let isUpdate = false;

    if (existing) {
      if (!existing.unsubscribed_at) {
        return new Response(
          JSON.stringify({ error: "Already subscribed" }),
          {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        // Re-subscribe: update the record
        isUpdate = true;
      }
    }

    // Add contact to Resend audience
    try {
      const resendResponse = await resend.contacts.create({
        email,
        audienceId: resendAudienceId,
        unsubscribed: false,
      });
      resendContactId = resendResponse.data?.id || null;
    } catch (resendError) {
      console.error("Resend API error:", resendError);
      // Continue without failing the request
    }

    // Store subscription in database
    let subscription;
    if (isUpdate) {
      const { data, error } = await supabase
        .from("newsletter_subscriptions")
        .update({
          unsubscribed_at: null,
          subscribed_at: new Date().toISOString(),
          language,
          consent_given,
          resend_contact_id: resendContactId,
        })
        .eq("email", email)
        .select()
        .single();

      if (error) {
        console.error("Database update error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update subscription" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      subscription = data;
    } else {
      const { data, error } = await supabase
        .from("newsletter_subscriptions")
        .insert({
          email,
          language,
          consent_given,
          resend_contact_id: resendContactId,
        })
        .select()
        .single();

      if (error) {
        console.error("Database insert error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to create subscription" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      subscription = data;
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: "Successfully subscribed to newsletter" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("General error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});