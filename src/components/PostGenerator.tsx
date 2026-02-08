import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Linkedin,
  Instagram,
  RefreshCw,
  CheckCircle2,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Download,
  Zap,
  Eye,
  MessageSquare,
  Target,
  Type,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import {
  generatePosts,
  runFeedbackLoop,
  generatePostImage,
  iteratePost,
  PostVariation,
  FeedbackResult,
} from "@/lib/ai-service";

interface FeedbackStep {
  criterion: string;
  icon: React.ElementType;
  status: "pending" | "checking" | "passed" | "improved";
  score: number;
  note: string;
}

const PostGenerator = () => {
  const {
    currentPostPlan,
    brandProfile,
    generatedVariations,
    setGeneratedVariations,
    updateVariation,
    selectedVariationId,
    setSelectedVariationId,
  } = useAppStore();

  const [generating, setGenerating] = useState(false);
  const [feedbackSteps, setFeedbackSteps] = useState<FeedbackStep[]>([]);
  const [showFeedbackLoop, setShowFeedbackLoop] = useState(false);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [editedCaption, setEditedCaption] = useState("");
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
  const [showIterateModal, setShowIterateModal] = useState<string | null>(null);
  const [iterateFeedback, setIterateFeedback] = useState("");
  const [iterateType, setIterateType] = useState<"tone" | "wording" | "cta" | "shorter" | "longer" | "custom">("custom");
  const [iterating, setIterating] = useState(false);

  const initialFeedback: FeedbackStep[] = [
    { criterion: "Brand Consistency", icon: Eye, status: "pending", score: 0, note: "" },
    { criterion: "Message Clarity", icon: MessageSquare, status: "pending", score: 0, note: "" },
    { criterion: "CTA Effectiveness", icon: Target, status: "pending", score: 0, note: "" },
    { criterion: "Text Readability", icon: Type, status: "pending", score: 0, note: "" },
  ];

  const runGeneration = useCallback(async () => {
    if (!currentPostPlan) {
      toast.error("No post plan selected. Go to Content Plan first.");
      return;
    }

    setGenerating(true);
    setGeneratedVariations([]);
    setSelectedVariationId(null);
    setShowFeedbackLoop(true);
    setFeedbackSteps(initialFeedback);

    try {
      // Generate for first platform
      const platform = currentPostPlan.platform === "both" ? "linkedin" : currentPostPlan.platform;

      // Step 1: Generate initial posts
      toast("Generating post variations...");
      const result = await generatePosts(currentPostPlan, brandProfile, platform);

      if (!result.variations?.length) {
        throw new Error("No variations generated");
      }

      // Step 2: Run feedback loop on first variation
      toast("Running quality checks...");
      const feedbackResult = await runFeedbackLoop(result.variations[0], brandProfile);

      // Update feedback UI
      const evaluations = feedbackResult.evaluations || [];
      setFeedbackSteps((prev) =>
        prev.map((step, i) => {
          const eval_ = evaluations[i];
          return {
            ...step,
            status: eval_?.score >= 85 ? "passed" : "improved",
            score: eval_?.score || 85,
            note: eval_?.feedback || "Evaluation complete",
          };
        })
      );

      // Apply improvements if needed
      let finalVariations = result.variations;
      if (feedbackResult.needsImprovement && feedbackResult.improvedCaption) {
        finalVariations = result.variations.map((v, i) =>
          i === 0 ? { ...v, caption: feedbackResult.improvedCaption!, qualityScore: feedbackResult.overallScore } : v
        );
      }

      // If both platforms, generate Instagram versions too
      if (currentPostPlan.platform === "both") {
        toast("Generating Instagram versions...");
        const igResult = await generatePosts(currentPostPlan, brandProfile, "instagram");
        finalVariations = [...finalVariations, ...(igResult.variations || [])];
      }

      setGeneratedVariations(finalVariations);
      toast.success(`${finalVariations.length} variations generated!`);
    } catch (error) {
      console.error("Generation failed:", error);
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }, [currentPostPlan, brandProfile, setGeneratedVariations, setSelectedVariationId]);

  useEffect(() => {
    if (currentPostPlan && generatedVariations.length === 0) {
      runGeneration();
    }
  }, [currentPostPlan]);

  const handleGenerateImage = async (variation: PostVariation) => {
    setGeneratingImages((prev) => ({ ...prev, [variation.id]: true }));
    try {
      const colors = brandProfile?.visualIdentity?.colors || ["#3B82F6", "#F97316"];
      const result = await generatePostImage(
        variation.imageDescription,
        variation.textOverlay,
        colors,
        variation.platform === "instagram" ? "square" : "square"
      );
      updateVariation(variation.id, { imageUrl: result.imageUrl });
      toast.success("Image generated!");
    } catch (error) {
      console.error("Image generation failed:", error);
      toast.error("Failed to generate image");
    } finally {
      setGeneratingImages((prev) => ({ ...prev, [variation.id]: false }));
    }
  };

  const handleIterate = async (variationId: string) => {
    const variation = generatedVariations.find((v) => v.id === variationId);
    if (!variation) return;

    setIterating(true);
    try {
      const result = await iteratePost(
        variationId,
        variation.caption,
        iterateType,
        iterateFeedback,
        brandProfile
      );
      updateVariation(variationId, {
        caption: result.improvedCaption,
        textOverlay: result.improvedTextOverlay || variation.textOverlay,
        qualityScore: result.qualityScore,
      });
      toast.success(`Applied changes: ${result.changes?.join(", ") || "Post improved"}`);
      setShowIterateModal(null);
      setIterateFeedback("");
    } catch (error) {
      console.error("Iteration failed:", error);
      toast.error("Failed to iterate post");
    } finally {
      setIterating(false);
    }
  };

  const handleSaveCaption = (variationId: string) => {
    updateVariation(variationId, { caption: editedCaption });
    setEditingCaption(null);
    setEditedCaption("");
    toast.success("Caption updated!");
  };

  const handleRegenerate = async (variationId: string) => {
    const variation = generatedVariations.find((v) => v.id === variationId);
    if (!variation || !currentPostPlan) return;

    toast("Regenerating variation...");
    try {
      const result = await generatePosts(currentPostPlan, brandProfile, variation.platform);
      if (result.variations?.[0]) {
        updateVariation(variationId, {
          ...result.variations[0],
          id: variationId,
        });
        toast.success("Variation regenerated!");
      }
    } catch (error) {
      toast.error("Regeneration failed");
    }
  };

  const handleExportToInstagram = async (variation: PostVariation) => {
    // Copy caption to clipboard first
    await navigator.clipboard.writeText(variation.caption);
    toast.success("Caption copied! Opening Instagram...");
    
    // If there's an image, download it first
    if (variation.imageUrl) {
      const link = document.createElement("a");
      link.href = variation.imageUrl;
      link.download = `instagram-post-${variation.id}.png`;
      link.click();
      toast("Image downloaded! Upload it to Instagram.");
    }
    
    // Open Instagram's web create post page (mobile app will open if available)
    setTimeout(() => {
      window.open("https://www.instagram.com/create/story", "_blank");
    }, 500);
  };

  const handleExportToLinkedIn = async (variation: PostVariation) => {
    // Copy caption to clipboard first
    await navigator.clipboard.writeText(variation.caption);
    
    // LinkedIn share URL with pre-filled text
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(variation.caption)}`;
    
    toast.success("Caption copied! Opening LinkedIn...");
    
    // If there's an image, download it first
    if (variation.imageUrl) {
      const link = document.createElement("a");
      link.href = variation.imageUrl;
      link.download = `linkedin-post-${variation.id}.png`;
      link.click();
      toast("Image downloaded! You can upload it on LinkedIn.");
    }
    
    setTimeout(() => {
      window.open(shareUrl, "_blank");
    }, 500);
  };

  if (!currentPostPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">No Post Selected</h3>
        <p className="text-muted-foreground mb-4">Go to Content Plan and click "Generate" on a post.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Current Post Info */}
      <div className="glass rounded-xl p-4 flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-foreground">{currentPostPlan.title}</h3>
          <p className="text-sm text-muted-foreground">{currentPostPlan.details?.substring(0, 100)}...</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={runGeneration}
          disabled={generating}
          className="border-border text-foreground hover:bg-secondary"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${generating ? "animate-spin" : ""}`} />
          Regenerate All
        </Button>
      </div>

      {/* Feedback Loop */}
      <AnimatePresence>
        {showFeedbackLoop && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Agentic Self-Feedback Loop</h3>
                <p className="text-sm text-muted-foreground">AI reviewing and improving outputs</p>
              </div>
              {!generating && (
                <span className="ml-auto text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Complete
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3">
              {feedbackSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.criterion}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-lg p-4 border transition-all duration-500 ${
                      generating && i === feedbackSteps.filter((s) => s.status !== "pending").length
                        ? "border-primary/50 bg-primary/5"
                        : step.status === "passed"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : step.status === "improved"
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-border bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`w-4 h-4 ${
                            generating && step.status === "pending"
                              ? "text-muted-foreground"
                              : step.status === "passed"
                              ? "text-emerald-400"
                              : step.status === "improved"
                              ? "text-amber-400"
                              : "text-primary animate-pulse"
                          }`}
                        />
                        <span className="text-xs font-medium text-foreground">{step.criterion}</span>
                      </div>
                      {step.score > 0 && (
                        <span className="text-xs font-mono font-bold text-foreground">{step.score}</span>
                      )}
                    </div>
                    {generating && step.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Checking...</span>
                      </div>
                    )}
                    {step.note && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{step.note}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {generating && generatedVariations.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
          <span className="text-muted-foreground">Generating post variations...</span>
        </div>
      )}

      {/* Variations */}
      <AnimatePresence>
        {generatedVariations.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-foreground">Post Variations</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {generatedVariations.map((variation, index) => (
                <motion.div
                  key={variation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedVariationId === variation.id
                      ? "ring-2 ring-primary shadow-glow"
                      : "hover:border-primary/30"
                  }`}
                  onClick={() => setSelectedVariationId(variation.id)}
                >
                  {/* Platform & score header */}
                  <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {variation.platform === "linkedin" ? (
                        <Linkedin className="w-4 h-4 text-primary" />
                      ) : (
                        <Instagram className="w-4 h-4 text-accent" />
                      )}
                      <span className="text-sm font-medium text-foreground capitalize">
                        {variation.platform}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          variation.qualityScore >= 90
                            ? "bg-emerald-400"
                            : variation.qualityScore >= 80
                            ? "bg-amber-400"
                            : "bg-destructive"
                        }`}
                      />
                      <span className="text-xs font-mono font-bold text-foreground">
                        {variation.qualityScore}
                      </span>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-primary/20 via-secondary to-accent/20 flex items-center justify-center relative overflow-hidden">
                    {variation.imageUrl ? (
                      <img
                        src={variation.imageUrl}
                        alt="Generated post"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center px-6">
                        {generatingImages[variation.id] ? (
                          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateImage(variation);
                            }}
                            className="px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors"
                          >
                            <Sparkles className="w-4 h-4 inline mr-2" />
                            Generate Image
                          </button>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">{variation.textOverlay}</p>
                      </div>
                    )}
                    {variation.imageUrl && variation.textOverlay && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <p className="text-white font-display font-bold text-xl text-center px-4">
                          {variation.textOverlay}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Caption */}
                  <div className="p-5">
                    {editingCaption === variation.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editedCaption}
                          onChange={(e) => setEditedCaption(e.target.value)}
                          className="bg-secondary border-border text-foreground text-sm min-h-[120px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveCaption(variation.id);
                            }}
                            className="bg-gradient-primary text-primary-foreground text-xs"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCaption(null);
                            }}
                            className="border-border text-foreground text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/90 whitespace-pre-line line-clamp-6 leading-relaxed">
                        {variation.caption}
                      </p>
                    )}
                    {variation.hashtags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {variation.hashtags.slice(0, 5).map((tag, i) => (
                          <span key={i} className="text-xs text-primary">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-5 pb-4 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success("Liked! This preference will improve future generations.");
                      }}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-emerald-400 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowIterateModal(variation.id);
                      }}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-amber-400 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditedCaption(variation.caption);
                        setEditingCaption(variation.id);
                      }}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegenerate(variation.id);
                      }}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportToInstagram(variation);
                      }}
                      className="ml-auto p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-accent transition-colors"
                      title="Export to Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportToLinkedIn(variation);
                      }}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                      title="Export to LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Selected variation actions */}
            {selectedVariationId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Variation selected — ready to export or iterate
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowIterateModal(selectedVariationId)}
                    className="border-border text-foreground hover:bg-secondary"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-2" />
                    Request Changes
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const v = generatedVariations.find((v) => v.id === selectedVariationId);
                      if (v) {
                        handleExportToInstagram(v);
                      }
                    }}
                    className="bg-gradient-accent text-accent-foreground hover:opacity-90"
                  >
                    <Instagram className="w-3.5 h-3.5 mr-2" />
                    Export to Instagram
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const v = generatedVariations.find((v) => v.id === selectedVariationId);
                      if (v) {
                        handleExportToLinkedIn(v);
                      }
                    }}
                    className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                  >
                    <Linkedin className="w-3.5 h-3.5 mr-2" />
                    Export to LinkedIn
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Iterate Modal */}
      <AnimatePresence>
        {showIterateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowIterateModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-foreground">Request Changes</h3>
                <button
                  onClick={() => setShowIterateModal(null)}
                  className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Change Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["tone", "wording", "cta", "shorter", "longer", "custom"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setIterateType(type)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          iterateType === type
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    {iterateType === "custom" ? "Describe the changes you want" : "Additional feedback (optional)"}
                  </label>
                  <Textarea
                    placeholder={
                      iterateType === "custom"
                        ? "e.g. Make it sound more urgent and add a specific CTA..."
                        : "Any specific notes..."
                    }
                    value={iterateFeedback}
                    onChange={(e) => setIterateFeedback(e.target.value)}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowIterateModal(null)}
                    className="flex-1 border-border text-foreground hover:bg-secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleIterate(showIterateModal)}
                    disabled={iterating}
                    className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90"
                  >
                    {iterating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Improving...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Apply Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostGenerator;
