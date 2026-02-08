import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, textOverlay, brandColors, aspectRatio } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating post image with prompt:", prompt?.substring(0, 50));

    // Build the image prompt with brand colors and text overlay
    const colorGuide = brandColors?.length 
      ? `Use these brand colors prominently: ${brandColors.join(", ")}. ` 
      : "";
    
    const overlayGuide = textOverlay 
      ? `The image should have space for overlaying the text: "${textOverlay}". Leave clean area for text placement. ` 
      : "";

    const fullPrompt = `Create a professional social media post image. ${colorGuide}${overlayGuide}${prompt}. 
Style: Modern, clean, professional. High contrast for text readability. ${aspectRatio === "story" ? "Vertical format 9:16" : "Square format 1:1"}.
Do NOT include any text in the image - leave space for text overlay.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: fullPrompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Image generation error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      console.error("No image URL in response:", JSON.stringify(data));
      throw new Error("No image generated");
    }

    console.log("Image generated successfully");

    return new Response(
      JSON.stringify({ 
        imageUrl, 
        textOverlay,
        description: textResponse || prompt 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-image error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
