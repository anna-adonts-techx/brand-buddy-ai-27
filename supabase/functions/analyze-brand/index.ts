import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// CORS configuration with origin validation
const getAllowedOrigins = () => {
  const origins = [
    "https://lovable.dev",
    "https://id-preview--f5372d37-5445-4fed-ab0f-8a45ff025d26.lovable.app",
  ];
  
  // Add any custom frontend URL from environment
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
const analyzeBrandSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200, "Company name too long"),
  website: z.string().url("Invalid URL format").optional().or(z.literal("")),
  description: z.string().max(5000, "Description too long").optional(),
  existingPosts: z.array(z.string().max(3000)).max(10, "Maximum 10 posts allowed").optional(),
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

    const validation = analyzeBrandSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(", ");
      return new Response(
        JSON.stringify({ error: `Invalid input: ${errors}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { companyName, website, description, existingPosts } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing brand for:", companyName);

    const systemPrompt = `You are a brand analyst AI. Analyze the provided company information and infer:
1. Brand Voice: Tone (formal/casual/playful), emoji usage tendency, CTA style, language patterns
2. Visual Identity: Suggested color palette (provide 4 hex colors), layout preferences, typography style
3. Messaging Patterns: Key themes, value propositions, audience targeting

Respond in JSON format:
{
  "voice": {
    "tone": "string describing tone",
    "emojiUsage": "none|minimal|moderate|heavy",
    "ctaStyle": "string describing CTA approach",
    "languagePatterns": ["array of patterns"]
  },
  "visualIdentity": {
    "colors": ["#hex1", "#hex2", "#hex3", "#hex4"],
    "layoutStyle": "string",
    "typographyStyle": "string"
  },
  "messagingPatterns": {
    "themes": ["array of themes"],
    "valueProps": ["array of value propositions"],
    "targetAudience": "string"
  },
  "summary": "2-3 sentence summary of the brand profile"
}`;

    const userPrompt = `Analyze this brand:
Company Name: ${companyName}
Website: ${website || "Not provided"}
Description: ${description || "Not provided"}
Existing Posts: ${existingPosts ? JSON.stringify(existingPosts) : "None provided"}

Infer the brand voice, visual identity, and messaging patterns based on the information provided.`;

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

    // Parse the JSON response
    let brandProfile;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      brandProfile = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse brand profile JSON");
      brandProfile = {
        voice: {
          tone: "Professional yet approachable",
          emojiUsage: "moderate",
          ctaStyle: "Action-oriented with urgency",
          languagePatterns: ["Innovation-focused", "Community-driven"],
        },
        visualIdentity: {
          colors: ["#3B82F6", "#F97316", "#1E1B4B", "#F8FAFC"],
          layoutStyle: "Modern, clean with bold accents",
          typographyStyle: "Sans-serif, bold headers",
        },
        messagingPatterns: {
          themes: ["Innovation", "Community", "Growth"],
          valueProps: ["Speed", "Quality", "Impact"],
          targetAudience: "Tech-savvy professionals",
        },
        summary: "Brand profile generated with default settings.",
      };
    }

    console.log("Brand analysis complete");

    return new Response(JSON.stringify(brandProfile), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-brand error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
