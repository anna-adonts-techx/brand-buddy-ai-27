import { supabase } from "@/integrations/supabase/client";

export interface BrandProfile {
  companyName: string;
  website: string;
  description: string;
  voice: {
    tone: string;
    emojiUsage: string;
    ctaStyle: string;
    languagePatterns: string[];
  };
  visualIdentity: {
    colors: string[];
    layoutStyle: string;
    typographyStyle: string;
  };
  messagingPatterns: {
    themes: string[];
    valueProps: string[];
    targetAudience: string;
  };
  summary: string;
}

export interface PlannedPost {
  id: string;
  intent: "announcement" | "event" | "partnership" | "achievement";
  platform: "linkedin" | "instagram" | "both";
  title: string;
  details: string;
  date: string;
  tone?: string;
  additionalElements?: string;
}

export interface PostVariation {
  id: string;
  caption: string;
  platform: "linkedin" | "instagram";
  imageDescription: string;
  textOverlay: string;
  hashtags: string[];
  qualityScore: number;
  strengths: string[];
  improvements: string[];
  imageUrl?: string;
}

export interface FeedbackResult {
  evaluations: {
    criterion: string;
    score: number;
    feedback: string;
    suggestion: string | null;
  }[];
  overallScore: number;
  needsImprovement: boolean;
  improvedCaption?: string;
  improvedTextOverlay?: string;
  summary: string;
}

export async function analyzeBrand(
  companyName: string,
  website: string,
  description: string,
  existingPosts?: string[]
): Promise<BrandProfile> {
  const { data, error } = await supabase.functions.invoke("analyze-brand", {
    body: { companyName, website, description, existingPosts },
  });

  if (error) {
    console.error("Brand analysis error:", error);
    throw new Error("Unable to analyze brand. Please try again.");
  }
  
  return {
    companyName,
    website,
    description,
    ...data,
  };
}

export async function generatePosts(
  postPlan: PlannedPost,
  brandProfile: BrandProfile | null,
  platform: "linkedin" | "instagram",
  feedbackHistory?: string[]
): Promise<{ variations: PostVariation[] }> {
  const { data, error } = await supabase.functions.invoke("generate-posts", {
    body: { postPlan, brandProfile, platform, feedbackHistory },
  });

  if (error) {
    console.error("Post generation error:", error);
    throw new Error("Unable to generate posts. Please try again.");
  }
  
  // Add platform to each variation
  return {
    variations: data.variations.map((v: PostVariation) => ({
      ...v,
      platform,
    })),
  };
}

export async function runFeedbackLoop(
  variation: PostVariation,
  brandProfile: BrandProfile | null
): Promise<FeedbackResult> {
  const { data, error } = await supabase.functions.invoke("feedback-loop", {
    body: { variation, brandProfile },
  });

  if (error) {
    console.error("Feedback loop error:", error);
    throw new Error("Unable to run quality checks. Please try again.");
  }
  return data;
}

export async function generatePostImage(
  prompt: string,
  textOverlay: string,
  brandColors: string[],
  aspectRatio: "square" | "story" = "square"
): Promise<{ imageUrl: string; textOverlay: string }> {
  const { data, error } = await supabase.functions.invoke("generate-image", {
    body: { prompt, textOverlay, brandColors, aspectRatio },
  });

  if (error) {
    console.error("Image generation error:", error);
    throw new Error("Unable to generate image. Please try again.");
  }
  return data;
}

export async function iteratePost(
  variationId: string,
  caption: string,
  feedbackType: "tone" | "wording" | "cta" | "shorter" | "longer" | "custom",
  userFeedback: string,
  brandProfile: BrandProfile | null
): Promise<{ improvedCaption: string; improvedTextOverlay: string; changes: string[]; qualityScore: number }> {
  const { data, error } = await supabase.functions.invoke("iterate-post", {
    body: { variationId, caption, userFeedback, brandProfile, feedbackType },
  });

  if (error) {
    console.error("Post iteration error:", error);
    throw new Error("Unable to iterate post. Please try again.");
  }
  return data;
}
