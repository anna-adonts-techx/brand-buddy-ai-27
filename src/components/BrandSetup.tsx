import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Upload, Sparkles, CheckCircle2, Loader2, Palette, MessageSquare, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { analyzeBrand, BrandProfile } from "@/lib/ai-service";

interface BrandInputs {
  companyName: string;
  website: string;
  description: string;
  existingPosts: string[];
}

const BrandSetup = () => {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<BrandInputs>({
    companyName: "",
    website: "",
    description: "",
    existingPosts: [],
  });
  const [newPost, setNewPost] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  
  const { brandProfile, setBrandProfile } = useAppStore();

  const handleAnalyze = async () => {
    if (!inputs.companyName) {
      toast.error("Please enter a company name");
      return;
    }
    
    setAnalyzing(true);
    try {
      const profile = await analyzeBrand(
        inputs.companyName,
        inputs.website,
        inputs.description,
        inputs.existingPosts
      );
      setBrandProfile(profile);
      setStep(1);
      toast.success("Brand profile analyzed!");
    } catch (error) {
      console.error("Brand analysis failed:", error);
      toast.error("Unable to analyze brand. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const addExistingPost = () => {
    if (newPost.trim()) {
      setInputs((prev) => ({
        ...prev,
        existingPosts: [...prev.existingPosts, newPost.trim()],
      }));
      setNewPost("");
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step indicators */}
      <div className="flex items-center gap-3">
        {["Company Info", "Brand Voice", "Visual Identity"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i <= step
                  ? "bg-gradient-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
              {label}
            </span>
            {i < 2 && <div className={`w-12 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Company Info */}
      {step === 0 && (
        <motion.div variants={staggerChildren} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={fadeUp} className="glass rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Company Information</h3>
                <p className="text-sm text-muted-foreground">Tell us about your brand</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Company Name *</label>
                <Input
                  placeholder="e.g. Hack-Nation"
                  value={inputs.companyName}
                  onChange={(e) => setInputs((p) => ({ ...p, companyName: e.target.value }))}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Website URL</label>
                <Input
                  placeholder="https://hacknation.com"
                  value={inputs.website}
                  onChange={(e) => setInputs((p) => ({ ...p, website: e.target.value }))}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Brand Description</label>
                <Textarea
                  placeholder="What does your company do? Who is your audience? What's your mission?"
                  value={inputs.description}
                  onChange={(e) => setInputs((p) => ({ ...p, description: e.target.value }))}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
                />
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                <Upload className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Existing Posts (Optional)</h3>
                <p className="text-sm text-muted-foreground">Paste existing LinkedIn/Instagram posts for voice analysis</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Paste an existing post here to help AI understand your brand voice..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addExistingPost}
                disabled={!newPost.trim()}
                className="border-border text-foreground hover:bg-secondary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Post
              </Button>
              
              {inputs.existingPosts.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs text-muted-foreground">{inputs.existingPosts.length} post(s) added:</p>
                  {inputs.existingPosts.map((post, i) => (
                    <div key={i} className="p-3 bg-secondary rounded-lg text-sm text-foreground/80 line-clamp-2">
                      {post}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity h-12 font-semibold text-base"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Brand with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Brand Profile
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Step 1: Brand Voice */}
      {step === 1 && brandProfile && (
        <motion.div variants={staggerChildren} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={fadeUp} className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Brand Voice</h3>
                <p className="text-sm text-muted-foreground">AI-inferred tone and messaging style</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Tone</p>
                <p className="text-sm font-medium text-foreground">{brandProfile.voice?.tone || "Professional"}</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Emoji Usage</p>
                <p className="text-sm font-medium text-foreground capitalize">{brandProfile.voice?.emojiUsage || "Moderate"}</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">CTA Style</p>
                <p className="text-sm font-medium text-foreground">{brandProfile.voice?.ctaStyle || "Action-oriented"}</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Target Audience</p>
                <p className="text-sm font-medium text-foreground">{brandProfile.messagingPatterns?.targetAudience || "Professionals"}</p>
              </div>
            </div>
            
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Language Patterns</p>
              <div className="flex flex-wrap gap-2">
                {(brandProfile.voice?.languagePatterns || ["Innovation", "Community"]).map((pattern, i) => (
                  <span key={i} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(0)} className="border-border text-foreground hover:bg-secondary">
              Back
            </Button>
            <Button
              onClick={() => {
                setStep(2);
                toast.success("Brand voice confirmed!");
              }}
              className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              Continue to Visual Identity
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Step 2: Visual Identity */}
      {step === 2 && brandProfile && (
        <motion.div variants={staggerChildren} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={fadeUp} className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                <Palette className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Brand Colors</h3>
                <p className="text-sm text-muted-foreground">AI-suggested color palette</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              {(brandProfile.visualIdentity?.colors || ["#3B82F6", "#F97316", "#1E1B4B", "#F8FAFC"]).map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className="w-16 h-16 rounded-xl shadow-card border border-border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-muted-foreground font-mono">{color}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Visual Style</h3>
                <p className="text-sm text-muted-foreground">Layout and design preferences</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Layout Style</p>
                <p className="text-sm font-medium text-foreground">{brandProfile.visualIdentity?.layoutStyle || "Modern, clean"}</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Typography</p>
                <p className="text-sm font-medium text-foreground">{brandProfile.visualIdentity?.typographyStyle || "Bold headers, clean body"}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass rounded-xl p-4">
            <p className="text-sm text-foreground/80">{brandProfile.summary}</p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="border-border text-foreground hover:bg-secondary">
              Back
            </Button>
            <Button
              onClick={() => toast.success("Brand profile saved! Head to Content Plan to create posts.")}
              className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Save Brand Profile
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BrandSetup;
