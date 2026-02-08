import { useState, useEffect } from "react";
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
  ChevronRight,
  AlertCircle,
  Zap,
  Eye,
  MessageSquare,
  Target,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PostVariation {
  id: string;
  caption: string;
  platform: "linkedin" | "instagram";
  imagePrompt: string;
  score: number;
}

interface FeedbackStep {
  criteria: string;
  icon: React.ElementType;
  status: "pending" | "checking" | "passed" | "improved";
  note: string;
}

const sampleVariations: PostVariation[] = [
  {
    id: "v1",
    caption: "🏈 It's game time — but we're not talking touchdowns.\n\nHack-Nation is BACK for 2026, and this year's hackathon is bringing the same intensity as the Super Bowl.\n\n💡 48 hours. Unlimited creativity. Epic prizes.\n\nWhether you're building AI-powered tools, Web3 solutions, or something nobody's ever seen — this is YOUR arena.\n\n🗓️ Feb 15–17 | Register now → [link]\n\n#HackNation2026 #Hackathon #SuperBowl #Innovation",
    platform: "linkedin",
    imagePrompt: "Super Bowl themed hackathon announcement",
    score: 92,
  },
  {
    id: "v2",
    caption: "The biggest game of the year deserves the biggest hackathon of the year. 🏟️\n\nHack-Nation 2026 is here.\n\nJoin 500+ developers, designers, and dreamers for a weekend of building, shipping, and winning.\n\n→ AI Track\n→ Web3 Track\n→ Social Impact Track\n\nRegister before Feb 10 for early-bird perks.\n\n#HackNation #TechInnovation #BuildTheFuture",
    platform: "linkedin",
    imagePrompt: "Professional hackathon event banner",
    score: 88,
  },
  {
    id: "v3",
    caption: "🔥 HACK-NATION 2026 🔥\n\nSuper Bowl weekend. Hackathon energy.\nAre you ready to compete? 🏆\n\n48h. Code. Ship. Win.\nLink in bio 👆\n\n#HackNation #Hackathon #SuperBowl #Tech #Coding",
    platform: "instagram",
    imagePrompt: "Bold Instagram hackathon post with stadium imagery",
    score: 85,
  },
];

const PostGenerator = () => {
  const [generating, setGenerating] = useState(false);
  const [variations, setVariations] = useState<PostVariation[]>([]);
  const [feedbackSteps, setFeedbackSteps] = useState<FeedbackStep[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [showFeedbackLoop, setShowFeedbackLoop] = useState(false);

  const initialFeedback: FeedbackStep[] = [
    { criteria: "Brand Consistency", icon: Eye, status: "pending", note: "" },
    { criteria: "Message Clarity", icon: MessageSquare, status: "pending", note: "" },
    { criteria: "CTA Effectiveness", icon: Target, status: "pending", note: "" },
    { criteria: "Text Readability", icon: Type, status: "pending", note: "" },
  ];

  const runGeneration = () => {
    setGenerating(true);
    setVariations([]);
    setSelectedVariation(null);
    setShowFeedbackLoop(true);
    setFeedbackSteps(initialFeedback);

    // Simulate feedback loop
    const feedbackNotes = [
      "Voice matches brand profile — professional yet energetic ✓",
      "Key info (dates, tracks, CTA) present and clear ✓",
      "CTA improved: added urgency with early-bird mention",
      "Caption length optimized for mobile. Emoji density balanced ✓",
    ];

    initialFeedback.forEach((_, i) => {
      setTimeout(() => {
        setFeedbackSteps((prev) =>
          prev.map((s, j) =>
            j === i
              ? { ...s, status: "checking" }
              : j === i - 1
              ? { ...s, status: i === 2 ? "improved" : "passed", note: feedbackNotes[j] }
              : s
          )
        );
      }, 800 + i * 1200);
    });

    // Show final results
    setTimeout(() => {
      setFeedbackSteps((prev) =>
        prev.map((s, i) => ({
          ...s,
          status: i === 2 ? "improved" : "passed",
          note: feedbackNotes[i],
        }))
      );
      setTimeout(() => {
        setVariations(sampleVariations);
        setGenerating(false);
        toast.success("3 post variations generated!");
      }, 600);
    }, 800 + initialFeedback.length * 1200);
  };

  useEffect(() => {
    runGeneration();
  }, []);

  const handleRegenerate = (id: string) => {
    toast("Regenerating variation...");
    setVariations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, score: Math.min(v.score + 3, 98) } : v))
    );
    setTimeout(() => toast.success("Variation improved!"), 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
                <p className="text-sm text-muted-foreground">AI is reviewing and improving outputs</p>
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
                    key={step.criteria}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-lg p-4 border transition-all duration-500 ${
                      step.status === "checking"
                        ? "border-primary/50 bg-primary/5"
                        : step.status === "passed"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : step.status === "improved"
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-border bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${
                        step.status === "checking" ? "text-primary animate-pulse" :
                        step.status === "passed" ? "text-emerald-400" :
                        step.status === "improved" ? "text-amber-400" :
                        "text-muted-foreground"
                      }`} />
                      <span className="text-xs font-medium text-foreground">{step.criteria}</span>
                    </div>
                    {step.status === "checking" && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Checking...</span>
                      </div>
                    )}
                    {(step.status === "passed" || step.status === "improved") && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.note}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Variations */}
      <AnimatePresence>
        {variations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-foreground">Post Variations</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={runGeneration}
                className="border-border text-foreground hover:bg-secondary"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                Regenerate All
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {variations.map((variation, index) => (
                <motion.div
                  key={variation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedVariation === variation.id
                      ? "ring-2 ring-primary shadow-glow"
                      : "hover:border-primary/30"
                  }`}
                  onClick={() => setSelectedVariation(variation.id)}
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
                      <div className={`w-2 h-2 rounded-full ${
                        variation.score >= 90 ? "bg-emerald-400" : variation.score >= 80 ? "bg-amber-400" : "bg-destructive"
                      }`} />
                      <span className="text-xs font-mono font-bold text-foreground">{variation.score}</span>
                    </div>
                  </div>

                  {/* Mock image */}
                  <div className="aspect-video bg-gradient-to-br from-primary/20 via-secondary to-accent/20 flex items-center justify-center relative">
                    <div className="text-center px-6">
                      <p className="font-display text-xl font-bold text-foreground mb-1">HACK-NATION</p>
                      <p className="text-sm text-primary font-semibold">2026</p>
                      <p className="text-xs text-muted-foreground mt-2">Feb 15-17 • 48 Hours</p>
                    </div>
                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground/50">
                      AI Generated
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="p-5">
                    {editingCaption === variation.id ? (
                      <div className="space-y-3">
                        <Textarea
                          defaultValue={variation.caption}
                          className="bg-secondary border-border text-foreground text-sm min-h-[120px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCaption(null);
                              toast.success("Caption updated!");
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
                  </div>

                  {/* Actions */}
                  <div className="px-5 pb-4 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success("Liked!");
                      }}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-emerald-400 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toast("Feedback noted — will improve next generation");
                      }}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
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
                        toast.success("Post downloaded!");
                      }}
                      className="ml-auto p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Selected variation detail */}
            {selectedVariation && (
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
                    className="border-border text-foreground hover:bg-secondary"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-2" />
                    Request Changes
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-accent text-accent-foreground hover:opacity-90"
                  >
                    <Download className="w-3.5 h-3.5 mr-2" />
                    Export Post
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostGenerator;
