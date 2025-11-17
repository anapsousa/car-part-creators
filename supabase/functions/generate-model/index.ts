import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting 3D model generation for design:", designId);

    // Call Lovable AI to analyze the prompt and extract specifications
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a 3D modeling assistant. Analyze user prompts for creating 3D printable models and extract key specifications.",
          },
          {
            role: "user",
            content: `Analyze this 3D model request: "${prompt}". Provide detailed specifications for 3D modeling including dimensions, features, mounting points, and printability considerations.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_model_specs",
              description: "Extract 3D model specifications from user prompt",
              parameters: {
                type: "object",
                properties: {
                  dimensions: {
                    type: "object",
                    properties: {
                      length: { type: "number" },
                      width: { type: "number" },
                      height: { type: "number" },
                      unit: { type: "string", enum: ["mm", "cm", "in"] }
                    }
                  },
                  features: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key features and design elements"
                  },
                  printability: {
                    type: "object",
                    properties: {
                      supports_needed: { type: "boolean" },
                      recommended_orientation: { type: "string" },
                      estimated_print_time: { type: "string" }
                    }
                  },
                  material_recommendations: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["features"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_model_specs" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      // Handle rate limiting and payment errors
      if (aiResponse.status === 429) {
        await supabase
          .from("designs")
          .update({ status: "failed" })
          .eq("id", designId);
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      
      if (aiResponse.status === 402) {
        await supabase
          .from("designs")
          .update({ status: "failed" })
          .eq("id", designId);
        throw new Error("AI credits exhausted. Please add credits to continue.");
      }
      
      await supabase
        .from("designs")
        .update({ status: "failed" })
        .eq("id", designId);

      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    const specifications = toolCall ? JSON.parse(toolCall.function.arguments) : {};
    const analysis = JSON.stringify(specifications, null, 2);

    console.log("AI Analysis:", analysis);

    // Get Meshy API key
    const meshyApiKey = Deno.env.get("MESHY_API_KEY");
    if (!meshyApiKey) {
      console.error("MESHY_API_KEY not configured");
      await supabase.from("designs").update({ status: "failed" }).eq("id", designId);
      throw new Error("MESHY_API_KEY is not configured");
    }

    // Create Meshy text-to-3D task
    console.log("Creating Meshy.ai generation task...");
    const meshyCreateResponse = await fetch("https://api.meshy.ai/v2/text-to-3d", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${meshyApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "preview",
        prompt: prompt,
        art_style: "realistic",
        negative_prompt: "low quality, low resolution, low poly, ugly"
      }),
    });

    if (!meshyCreateResponse.ok) {
      const errorText = await meshyCreateResponse.text();
      console.error("Meshy.ai task creation failed:", meshyCreateResponse.status, errorText);
      await supabase.from("designs").update({ status: "failed" }).eq("id", designId);
      throw new Error(`Meshy.ai error: ${errorText}`);
    }

    const meshyTask = await meshyCreateResponse.json();
    const taskId = meshyTask.result;
    console.log("Meshy task created:", taskId);

    // Poll for completion (max 5 minutes)
    let attempts = 0;
    const maxAttempts = 60;
    let modelUrl = null;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.meshy.ai/v2/text-to-3d/${taskId}`, {
        headers: {
          "Authorization": `Bearer ${meshyApiKey}`,
        },
      });

      if (!statusResponse.ok) {
        console.error("Failed to check task status");
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      console.log(`Task status (attempt ${attempts + 1}):`, statusData.status);

      if (statusData.status === "SUCCEEDED") {
        modelUrl = statusData.model_urls?.glb || statusData.model_urls?.fbx;
        console.log("Model generation succeeded! URL:", modelUrl);
        break;
      } else if (statusData.status === "FAILED") {
        await supabase.from("designs").update({ status: "failed" }).eq("id", designId);
        throw new Error("Meshy.ai generation failed");
      }

      attempts++;
    }

    if (!modelUrl) {
      await supabase.from("designs").update({ status: "failed" }).eq("id", designId);
      throw new Error("Model generation timed out");
    }

    // Download the generated model
    console.log("Downloading generated model...");
    const modelResponse = await fetch(modelUrl);
    if (!modelResponse.ok) {
      throw new Error("Failed to download generated model");
    }

    const modelBlob = await modelResponse.blob();
    const modelBuffer = await modelBlob.arrayBuffer();

    // Upload to Supabase Storage
    console.log("Uploading to storage...");
    const fileName = `${designId}.glb`;
    const { error: uploadError } = await supabase.storage
      .from("design-files")
      .upload(fileName, modelBuffer, {
        contentType: "model/gltf-binary",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("design-files")
      .getPublicUrl(fileName);

    const fileUrl = urlData.publicUrl;
    console.log("Model uploaded to:", fileUrl);

    // Update design with completed status
    const { error: updateError } = await supabase
      .from("designs")
      .update({
        status: "completed",
        stl_file_url: fileUrl,
        blend_file_url: fileUrl, // GLB format for both
      })
      .eq("id", designId);

    if (updateError) {
      console.error("Error updating design:", updateError);
      throw updateError;
    }

    console.log("Generation completed for design:", designId);

    return new Response(
      JSON.stringify({
        success: true,
        designId,
        analysis,
        stlUrl: fileUrl,
        blendUrl: fileUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-model function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Generation failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
