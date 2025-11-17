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

    // Note: In a real implementation, you would integrate with a 3D model generation API
    // For now, we'll simulate the process and return mock URLs
    // In v2, this could integrate with services like:
    // - OpenAI's 3D generation APIs (when available)
    // - Meshy.ai
    // - Kaedim
    // - Point-E or Shap-E

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock file URLs (in production, these would be actual generated files)
    const mockStlUrl = `https://example.com/models/${designId}.stl`;
    const mockBlendUrl = `https://example.com/models/${designId}.blend`;

    // Update design with completed status and file URLs
    const { error: updateError } = await supabase
      .from("designs")
      .update({
        status: "completed",
        stl_file_url: mockStlUrl,
        blend_file_url: mockBlendUrl,
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
        stlUrl: mockStlUrl,
        blendUrl: mockBlendUrl,
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
