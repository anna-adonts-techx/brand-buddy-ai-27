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
    const { postPlan, brandProfile, platform, feedbackHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating posts for:", postPlan.title, "on", platform);

    const systemPrompt = `You are an expert social media content creator. Generate multiple post variations based on the brand profile and post requirements.

Brand Profile:
- Voice: ${JSON.stringify(brandProfile?.voice || { tone: "Professional" })}
- Visual Style: ${JSON.stringify(brandProfile?.visualIdentity || {})}
- Themes: ${JSON.stringify(brandProfile?.messagingPatterns?.themes || [])}

Platform: ${platform}
${platform === "linkedin" ? "LinkedIn posts should be professional, can be longer (up to 3000 chars), use hashtags sparingly, focus on value and thought leadership." : ""}
${platform === "instagram" ? "Instagram posts should be punchy, engaging, use more emojis, include relevant hashtags (5-10), be mobile-optimized." : ""}

${feedbackHistory ? `Previous feedback to incorporate: ${JSON.stringify(feedbackHistory)}` : ""}

Generate 3 distinct variations. For each, provide:
1. Caption (the full post text)
2. Image description (for AI image generation)
3. Text overlay (short, punchy text to overlay on the image - max 6 words)
4. Quality score estimate (0-100)

Respond in JSON:
{
  "variations": [
    {
      "id": "v1",
      "caption": "full post text here",
      "imageDescription": "detailed description for image generation",
      "textOverlay": "BOLD SHORT TEXT",
      "hashtags": ["tag1", "tag2"],
      "qualityScore": 85,
      "strengths": ["strength1", "strength2"],
      "improvements": ["potential improvement"]
    }
  ]
}`;

    const userPrompt = `Create 3 post variations for:
Title: ${postPlan.title}
Intent: ${postPlan.intent}
Details: ${postPlan.details || "No additional details"}
Tone: ${postPlan.tone || "Match brand voice"}
Date: ${postPlan.date || "Flexible"}
Additional Elements: ${postPlan.additionalElements || "None specified"}

Make each variation distinct in approach while maintaining brand consistency.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let result;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse post variations:", parseError);
      throw new Error("Failed to parse AI response");
    }

    console.log("Generated", result.variations?.length || 0, "variations");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-posts error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
