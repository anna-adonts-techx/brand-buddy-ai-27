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

// Input validation schemas
const postPlanSchema = z.object({
  id: z.string().max(100).optional(),
  title: z.string().min(1, "Title is required").max(500, "Title too long"),
  intent: z.enum(["announcement", "event", "partnership", "achievement"]),
  details: z.string().max(5000, "Details too long").optional(),
  tone: z.string().max(200).optional(),
  date: z.string().max(50).optional(),
  additionalElements: z.string().max(2000).optional(),
});

const brandProfileSchema = z.object({
  voice: z.object({
    tone: z.string().max(500).optional(),
    emojiUsage: z.string().max(50).optional(),
    ctaStyle: z.string().max(500).optional(),
    languagePatterns: z.array(z.string().max(200)).max(20).optional(),
  }).optional(),
  visualIdentity: z.object({
    colors: z.array(z.string().max(20)).max(10).optional(),
    layoutStyle: z.string().max(500).optional(),
    typographyStyle: z.string().max(500).optional(),
  }).optional(),
  messagingPatterns: z.object({
    themes: z.array(z.string().max(200)).max(20).optional(),
    valueProps: z.array(z.string().max(200)).max(20).optional(),
    targetAudience: z.string().max(500).optional(),
  }).optional(),
}).optional();

const generatePostsSchema = z.object({
  postPlan: postPlanSchema,
  brandProfile: brandProfileSchema,
  platform: z.enum(["linkedin", "instagram", "both"]),
  feedbackHistory: z.array(z.string().max(2000)).max(10).optional(),
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

    const validation = generatePostsSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
      return new Response(
        JSON.stringify({ error: `Invalid input: ${errors}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { postPlan, brandProfile, platform, feedbackHistory } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      console.error("Failed to parse post variations");
      return new Response(
        JSON.stringify({ error: "Failed to generate posts. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generated", result.variations?.length || 0, "variations");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-posts error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
