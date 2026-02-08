import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// CORS configuration with origin validation
const getAllowedOrigins = () => {
  const origins = [
    "https://lovable.dev",
    "https://id-preview--f5372d37-5445-4fed-ab0f-8a45ff025d26.lovable.app",
  ];
  
  const frontendUrl = Deno.env.get("FRONTEND_URL");
  if (frontendUrl) origins.push(frontendUrl);
  
  return origins;
};

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigins = getAllowedOrigins();
  const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed) || origin.includes(".lovable.app"));
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Credentials": "true",
  };
};

// Input validation schema
const iteratePostSchema = z.object({
  variationId: z.string().min(1, "Variation ID is required").max(100),
  caption: z.string().min(1, "Caption is required").max(5000, "Caption too long"),
  userFeedback: z.string().max(2000, "Feedback too long").optional(),
  brandProfile: z.record(z.unknown()).optional(),
  feedbackType: z.enum(["tone", "wording", "cta", "shorter", "longer", "custom"]),
});

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authData?.user) {
      console.error("Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", authData.user.id);

    // Parse and validate input
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = iteratePostSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
      return new Response(
        JSON.stringify({ error: `Invalid input: ${errors}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { variationId, caption, userFeedback, brandProfile, feedbackType } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      console.error("AI gateway error:", response.status);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "An error occurred processing your request. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let result;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse iteration result");
      return new Response(
        JSON.stringify({ error: "Failed to process feedback. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Iteration complete, changes:", result.changes?.length || 0);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("iterate-post error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
