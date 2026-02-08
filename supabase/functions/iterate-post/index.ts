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
    const { variationId, caption, userFeedback, brandProfile, feedbackType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Iterating on variation:", variationId, "with feedback type:", feedbackType);

    const systemPrompt = `You are a social media content editor. Improve the post based on user feedback while maintaining brand consistency.

Brand Profile:
${JSON.stringify(brandProfile || {}, null, 2)}

Feedback Type: ${feedbackType}
- "tone": Adjust the tone/voice
- "wording": Improve specific wording
- "cta": Strengthen the call-to-action
- "shorter": Make it more concise
- "longer": Add more detail
- "custom": Apply custom feedback

Respond in JSON:
{
  "improvedCaption": "the new caption",
  "improvedTextOverlay": "NEW OVERLAY TEXT",
  "changes": ["list of changes made"],
  "qualityScore": 90
}`;

    const userPrompt = `Improve this post based on the feedback:

Original Caption: ${caption}
Feedback Type: ${feedbackType}
User Feedback: ${userFeedback || "General improvement requested"}

Make targeted improvements based on the feedback type.`;

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
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
      console.error("Failed to parse iteration result:", parseError);
      throw new Error("Failed to parse AI response");
    }

    console.log("Iteration complete, changes:", result.changes?.length || 0);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("iterate-post error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
