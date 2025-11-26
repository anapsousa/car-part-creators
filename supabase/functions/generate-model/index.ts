import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Estimated costs per service
const COSTS = {
  LOVABLE_AI_IMAGE: 0.02, // ~$0.02 per image
  REPLICATE_3D: 0.10, // ~$0.10 per 3D model
};

serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(origin) });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { prompt, designId } = await req.json();

    if (!prompt || !designId) {
      throw new Error("Missing required parameters");
    }

    // Get user from design
    const { data: design, error: designError } = await supabase
      .from("designs")
      .select("user_id")
      .eq("id", designId)
      .single();

    if (designError || !design) throw new Error("Design not found");

    const userId = design.user_id;

    // Check user credits
    const { data: userCredits, error: creditsError } = await supabase
      .from("user_credits")
      .select("credits_remaining")
      .eq("user_id", userId)
      .single();

    const STARTING_FREE_CREDITS = 5;
    let currentCredits = userCredits?.credits_remaining ?? null;

    if (creditsError || !userCredits) {
      // Initialize credits if not exists and capture actual stored value
      const { data: insertedCredits, error: insertError } = await supabase
        .from("user_credits")
        .insert({
          user_id: userId,
          credits_remaining: STARTING_FREE_CREDITS,
          credits_purchased: 0,
        })
        .select("credits_remaining")
        .single();

      if (insertError || !insertedCredits) {
        throw new Error("Failed to initialize user credits");
      }

      currentCredits = insertedCredits.credits_remaining;
    } else {
      currentCredits = userCredits.credits_remaining;
    }

    if (currentCredits < 1) {
      await supabase.from("designs").update({ status: "failed" }).eq("id", designId);
      return new Response(
        JSON.stringify({
          error: "Insufficient credits. Please purchase more credits to continue.",
          code: "INSUFFICIENT_CREDITS",
        }),
        {
          status: 402,
          headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
        },
      );
    }

    // Deduct one credit based on the actual current value
    const updatedCreditsRemaining = currentCredits - 1;

    await supabase
      .from("user_credits")
      .update({ credits_remaining: updatedCreditsRemaining })
      .eq("user_id", userId);

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");

    if (!lovableApiKey || !replicateApiKey) {
      throw new Error("API keys not configured");
    }

    console.log("Starting 3D model generation for design:", designId);

    // Update status to processing
    await supabase
      .from("designs")
      .update({ status: "processing" })
      .eq("id", designId);

    // Step 1: Generate an image from the text prompt using Lovable AI
    console.log("Generating image from prompt...");
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: `Generate a high-quality product visualization image for 3D modeling: ${prompt}. Make it suitable for 3D model generation with clear shapes and details.`
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error("Image generation error:", imageResponse.status, errorText);
      
      await supabase.from("designs").update({ status: "failed" }).eq("id", designId);
      
      // Refund credit on API failure
      const { data: currentCredits } = await supabase
        .from("user_credits")
        .select("credits_remaining")
        .eq("user_id", userId)
        .single();
      
      if (currentCredits) {
        await supabase
          .from("user_credits")
          .update({ credits_remaining: currentCredits.credits_remaining + 1 })
          .eq("user_id", userId);
      }

      if (imageResponse.status === 429 || imageResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Service temporarily unavailable. Your credit has been refunded.",
            code: "SERVICE_UNAVAILABLE"
          }),
          { status: 503, headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Image generation failed");
    }

    const imageData = await imageResponse.json();
    const generatedImageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      await supabase.from("designs").update({ status: "failed" }).eq("id", designId);
      throw new Error("No image generated from AI");
    }

    // Track AI cost
    await supabase.from("generation_costs").insert({
      design_id: designId,
      user_id: userId,
      cost_usd: COSTS.LOVABLE_AI_IMAGE,
      service: "lovable_ai",
      status: "completed"
    });

    console.log("Image generated successfully");

    // Step 2: Use Replicate's TRELLIS to convert image to 3D model
    console.log("Converting image to 3D model with TRELLIS...");
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${replicateApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "45606f9ae85f52cce622be1c47aa753c5079fc3463ec1b43f60a624962f81321",
        input: {
          image: generatedImageUrl,
          seed: 0,
          randomize_seed: true
        }
      }),
    });

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      console.error("Replicate API error:", replicateResponse.status, errorText);
      await supabase.from("designs").update({ status: "failed" }).eq("id", designId);
      
      // Track failed cost for admin
      await supabase.from("generation_costs").insert({
        design_id: designId,
        user_id: userId,
        cost_usd: 0,
        service: "replicate",
        status: "failed"
      });

      // Refund credit on Replicate failure
      const { data: currentCredits } = await supabase
        .from("user_credits")
        .select("credits_remaining")
        .eq("user_id", userId)
        .single();
      
      if (currentCredits) {
        await supabase
          .from("user_credits")
          .update({ credits_remaining: currentCredits.credits_remaining + 1 })
          .eq("user_id", userId);
      }

      if (replicateResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Service temporarily unavailable. Your credit has been refunded.",
            code: "SERVICE_UNAVAILABLE"
          }),
          { status: 503, headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Replicate API error: ${errorText}`);
    }

    const prediction = await replicateResponse.json();
    const predictionId = prediction.id;
    console.log("Replicate prediction created:", predictionId);

    // Step 3: Poll for completion with a stricter global timeout
    let attempts = 0;
    const maxAttempts = 11; // ~55 seconds at 5s per attempt
    const pollIntervalMs = 5000;
    const maxDurationMs = 55_000;
    const startTime = Date.now();
    let modelUrl = null;

    while (attempts < maxAttempts && Date.now() - startTime < maxDurationMs) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs)); // Wait 5 seconds

      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          Authorization: `Bearer ${replicateApiKey}`,
        },
      });

      if (!statusResponse.ok) {
        console.error("Failed to check prediction status");
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      console.log(`Prediction status (attempt ${attempts + 1}):`, statusData.status);

      if (statusData.status === "succeeded") {
        // TRELLIS returns GLB and other formats
        modelUrl = statusData.output?.glb || statusData.output;
        console.log("3D model generation succeeded! URL:", modelUrl);

        // Track Replicate cost
        await supabase.from("generation_costs").insert({
          design_id: designId,
          user_id: userId,
          cost_usd: COSTS.REPLICATE_3D,
          service: "replicate",
          status: "completed",
        });

        break;
      } else if (statusData.status === "failed" || statusData.status === "canceled") {
        await supabase.from("designs").update({ status: "failed" }).eq("id", designId);
        throw new Error(`Replicate prediction ${statusData.status}`);
      }

      attempts++;
    }

    if (!modelUrl) {
      await supabase.from("designs").update({ status: "failed" }).eq("id", designId);
      throw new Error("Model generation timed out");
    }

    // Step 4: Download the generated model
    console.log("Downloading generated model...");
    const modelResponse = await fetch(modelUrl);
    if (!modelResponse.ok) {
      throw new Error("Failed to download generated model");
    }

    const modelBlob = await modelResponse.blob();
    const modelBuffer = await modelBlob.arrayBuffer();

    // Step 5: Upload to Supabase Storage
    console.log("Uploading to storage...");
    const fileName = `${designId}.glb`;
    const { error: uploadError } = await supabase.storage
      .from("design-files")
      .upload(fileName, modelBuffer, {
        contentType: "model/gltf-binary",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      await supabase.from("designs").update({ status: "failed" }).eq("id", designId);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("design-files")
      .getPublicUrl(fileName);

    console.log("Model uploaded successfully:", urlData.publicUrl);

    // Step 6: Update design record with model URL
    const { error: updateError } = await supabase
      .from("designs")
      .update({
        status: "completed",
        stl_file_url: urlData.publicUrl,
      })
      .eq("id", designId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    console.log("Design record updated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        designId,
        modelUrl: urlData.publicUrl,
      }),
      {
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
      },
    );

  } catch (error) {
    console.error("Error in generate-model function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
      },
    );
  }
});
