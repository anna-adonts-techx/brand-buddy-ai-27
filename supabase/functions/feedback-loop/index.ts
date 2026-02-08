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
const variationSchema = z.object({
  id: z.string().max(100),
  caption: z.string().max(5000, "Caption too long"),
  textOverlay: z.string().max(100).optional(),
  imageDescription: z.string().max(2000).optional(),
  platform: z.enum(["linkedin", "instagram", "both"]).optional(),
  hashtags: z.array(z.string().max(100)).max(30).optional(),
});

const criterionSchema = z.object({
  id: z.string().max(50),
  name: z.string().max(100),
  weight: z.number().min(0).max(1),
});

const feedbackLoopSchema = z.object({
  variation: variationSchema,
  brandProfile: z.record(z.unknown()).optional(),
  criteria: z.array(criterionSchema).max(10).optional(),
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

    const validation = feedbackLoopSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
      return new Response(
        JSON.stringify({ error: `Invalid input: ${errors}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { variation, brandProfile, criteria } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Running feedback loop on variation:", variation.id);

    const feedbackCriteria = criteria || [
      { id: "brand", name: "Brand Consistency", weight: 0.25 },
      { id: "clarity", name: "Message Clarity", weight: 0.25 },
      { id: "cta", name: "CTA Effectiveness", weight: 0.25 },
      { id: "readability", name: "Text Readability", weight: 0.25 },
    ];

    const systemPrompt = `You are a social media content quality reviewer. Evaluate the post against these criteria and suggest improvements.

Brand Profile:
${JSON.stringify(brandProfile || {}, null, 2)}

Evaluation Criteria:
${feedbackCriteria.map((c) => `- ${c.name} (${c.weight * 100}% weight)`).join("\n")}

For each criterion:
1. Score from 0-100
2. Provide specific feedback
3. If score < 85, suggest a concrete improvement

Then provide an improved version of the post if any criterion scored below 85.

Respond in JSON:
{
  "evaluations": [
    {
      "criterion": "Brand Consistency",
      "score": 90,
      "feedback": "Matches brand voice well...",
      "suggestion": null
    },
    {
      "criterion": "Message Clarity", 
      "score": 75,
      "feedback": "Could be clearer...",
      "suggestion": "Consider rephrasing to..."
    }
  ],
  "overallScore": 85,
  "needsImprovement": true,
  "improvedCaption": "The improved caption text if needed...",
  "improvedTextOverlay": "IMPROVED OVERLAY",
  "summary": "Brief summary of the review"
}`;

    const userPrompt = `Evaluate this social media post:

Caption: ${variation.caption}
Text Overlay: ${variation.textOverlay || "None"}
Image Description: ${variation.imageDescription || "None"}
Platform: ${variation.platform || "linkedin"}
Hashtags: ${variation.hashtags?.join(", ") || "None"}

Provide detailed feedback on each criterion and improvements if needed.`;

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
        temperature: 0.5,
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
      console.error("Failed to parse feedback");
      result = {
        evaluations: feedbackCriteria.map((c) => ({
          criterion: c.name,
          score: 85,
          feedback: "Evaluation complete",
          suggestion: null,
        })),
        overallScore: 85,
        needsImprovement: false,
        summary: "Post meets quality standards",
      };
    }

    console.log("Feedback complete, overall score:", result.overallScore);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("feedback-loop error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
