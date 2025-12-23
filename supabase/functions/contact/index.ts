import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("CONTACT_FROM_EMAIL") || "noreply@dr3amtoreal.com";
const TO_EMAIL = Deno.env.get("CONTACT_TO_EMAIL") || "dr3amtoreal@gmail.com";
const SITE_URL = Deno.env.get("SITE_URL") || "https://dr3amtoreal.com";

// CORS headers - required for frontend to call this function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Validate email format
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY");
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    const body = await req.json();
    const { name, email, subject, message, honeypot } = body;

    // Honeypot spam protection - if filled, silently reject
    if (honeypot && honeypot.trim() !== '') {
      console.log('Spam detected via honeypot');
      // Return success to avoid revealing honeypot
      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, and message are required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Sanitize inputs (basic HTML escaping)
    const sanitize = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    };

    const sanitizedName = sanitize(name.trim());
    const sanitizedEmail = sanitize(email.trim());
    const sanitizedSubject = sanitize((subject || "New message").trim());
    const sanitizedMessage = sanitize(message.trim());

    // Send email to admin
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Dr3amToReal <${FROM_EMAIL}>`,
        to: [TO_EMAIL],
        reply_to: sanitizedEmail,
        subject: `[Dr3amToReal Contact] ${sanitizedSubject}`,
        html: `
          <h2>New contact request</h2>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${sanitizedEmail}</p>
          ${sanitizedSubject ? `<p><strong>Subject:</strong> ${sanitizedSubject}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p>${sanitizedMessage.replace(/\n/g, "<br/>")}</p>
          <hr />
          <small>Sent from ${SITE_URL} at ${new Date().toISOString()}</small>
        `,
        text: `
New contact request

Name: ${sanitizedName}
Email: ${sanitizedEmail}
${sanitizedSubject ? `Subject: ${sanitizedSubject}\n` : ''}
Message:
${sanitizedMessage}

---
Sent from ${SITE_URL} at ${new Date().toISOString()}
        `.trim(),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Optional: Send confirmation email to user
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Dr3amToReal <${FROM_EMAIL}>`,
          to: [sanitizedEmail],
          subject: "We received your message — Dr3amToReal",
          html: `
            <h2>Thank You for Contacting Dr3amToReal</h2>
            <p>Hi ${sanitizedName},</p>
            <p>We've received your message and will get back to you within 24-48 hours.</p>
            <p><strong>Your message:</strong></p>
            <p style="background: #f9f9f9; padding: 15px; border-radius: 3px;">${sanitizedMessage.replace(/\n/g, "<br/>")}</p>
            <p>If you have any urgent questions, feel free to reach out directly.</p>
            <p>Best regards,<br>The Dr3amToReal Team</p>
            <hr />
            <small>Dr3amToReal - Custom 3D Design & Printing Services<br>${SITE_URL}</small>
          `,
          text: `
Thank You for Contacting Dr3amToReal

Hi ${sanitizedName},

We've received your message and will get back to you within 24-48 hours.

Your message:
${sanitizedMessage}

If you have any urgent questions, feel free to reach out directly.

Best regards,
The Dr3amToReal Team

---
Dr3amToReal - Custom 3D Design & Printing Services
${SITE_URL}
          `.trim(),
        }),
      });
    } catch (confirmationError) {
      // Don't fail the request if confirmation email fails
      console.warn("Failed to send confirmation email (non-critical):", confirmationError);
    }

    console.log("Contact form submitted successfully:", { email: sanitizedEmail, subject: sanitizedSubject });

    return new Response(
      JSON.stringify({ success: true, message: "Message sent successfully! We'll get back to you soon." }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

