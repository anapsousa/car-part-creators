import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, designId } = await req.json();

    if (!prompt || !designId) {
      throw new Error("Missing required parameters");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!replicateApiKey) {
      throw new Error("REPLICATE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

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
      
      if (imageResponse.status === 429) {
        await supabase.from("designs").update({ status: "failed" }).eq("id", designId);
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      
      if (imageResponse.status === 402) {
        await supabase.from("designs").update({ status: "failed" }).eq("id", designId);
        throw new Error("AI credits exhausted. Please add credits to continue.");
      }
      
      await supabase.from("designs").update({ status: "failed" }).eq("id", designId);
      throw new Error("Image generation failed");
    }

    const imageData = await imageResponse.json();
    const generatedImageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      await supabase.from("designs").update({ status: "failed" }).eq("id", designId);
      throw new Error("No image generated from AI");
    }

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
      
      // Return appropriate status code based on Replicate error
      if (replicateResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Insufficient Replicate credits. Please add credits to your Replicate account at https://replicate.com/account/billing",
            code: "REPLICATE_INSUFFICIENT_CREDITS"
          }),
          { 
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      throw new Error(`Replicate API error: ${errorText}`);
    }

    const prediction = await replicateResponse.json();
    const predictionId = prediction.id;
    console.log("Replicate prediction created:", predictionId);

    // Step 3: Poll for completion (max 5 minutes)
    let attempts = 0;
    const maxAttempts = 60;
    let modelUrl = null;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in generate-model function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
