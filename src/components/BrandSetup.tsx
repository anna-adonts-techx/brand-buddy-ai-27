import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Upload, Sparkles, CheckCircle2, Loader2, Palette, MessageSquare, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface BrandProfile {
  companyName: string;
  website: string;
  description: string;
  voice: string;
  colors: string[];
  style: string;
}

const defaultProfile: BrandProfile = {
  companyName: "",
  website: "",
  description: "",
  voice: "",
  colors: [],
  style: "",
};

const BrandSetup = () => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<BrandProfile>(defaultProfile);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalyze = () => {
    if (!profile.companyName) {
      toast.error("Please enter a company name");
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      setProfile((p) => ({
        ...p,
        voice: "Professional yet approachable. Uses action-oriented language with occasional emojis. Focuses on innovation and community building.",
        colors: ["#3B82F6", "#F97316", "#1E1B4B", "#F8FAFC"],
        style: "Modern, clean layouts with bold typography. Prefers gradient accents and dynamic imagery. Uses short, punchy captions with clear CTAs.",
      }));
      setAnalyzing(false);
      setAnalyzed(true);
      setStep(1);
      toast.success("Brand profile analyzed!");
    }, 2500);
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
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
                <label className="text-sm font-medium text-foreground mb-1.5 block">Company Name</label>
                <Input
                  placeholder="e.g. Hack-Nation"
                  value={profile.companyName}
                  onChange={(e) => setProfile((p) => ({ ...p, companyName: e.target.value }))}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Website URL</label>
                <Input
                  placeholder="https://hacknation.com"
                  value={profile.website}
                  onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Brand Description</label>
                <Textarea
                  placeholder="What does your company do? Who is your audience?"
                  value={profile.description}
                  onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
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
                <h3 className="font-display font-semibold text-foreground">Existing Content</h3>
                <p className="text-sm text-muted-foreground">Upload existing posts or brand guidelines</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Drag & drop files here, or <span className="text-primary cursor-pointer">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDFs, images, or text files</p>
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
                  Analyzing Brand...
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
      {step === 1 && analyzed && (
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
            <Textarea
              value={profile.voice}
              onChange={(e) => setProfile((p) => ({ ...p, voice: e.target.value }))}
              className="bg-secondary border-border text-foreground min-h-[120px]"
            />
          </motion.div>

          <motion.div variants={fadeUp} className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(0)} className="border-border text-foreground hover:bg-secondary">
              Back
            </Button>
            <Button
              onClick={() => {
                setStep(2);
                toast.success("Brand voice saved!");
              }}
              className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              Continue to Visual Identity
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Step 2: Visual Identity */}
      {step === 2 && (
        <motion.div variants={staggerChildren} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={fadeUp} className="glass rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                <Palette className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Brand Colors</h3>
                <p className="text-sm text-muted-foreground">Detected from your brand assets</p>
              </div>
            </div>
            <div className="flex gap-3">
              {profile.colors.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className="w-16 h-16 rounded-xl shadow-card border border-border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-muted-foreground font-mono">{color}</span>
                </div>
              ))}
              <button className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary/50 transition-colors">
                +
              </button>
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
            <Textarea
              value={profile.style}
              onChange={(e) => setProfile((p) => ({ ...p, style: e.target.value }))}
              className="bg-secondary border-border text-foreground min-h-[100px]"
            />
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
