import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Loader2, Zap, Target, TrendingUp } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Animated logo component
const AnimatedLogo = () => (
  <motion.div 
    className="relative w-20 h-20"
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
  >
    {/* Outer ring */}
    <motion.div 
      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
    {/* Inner container */}
    <div className="absolute inset-1 rounded-xl bg-background flex items-center justify-center overflow-hidden">
      {/* Animated bars representing social posts */}
      <div className="flex gap-1 items-end h-10">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 rounded-full bg-gradient-to-t from-primary to-accent"
            initial={{ height: 10 }}
            animate={{ height: [10, 24 + i * 8, 10] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
    {/* Glow effect */}
    <div className="absolute -inset-2 rounded-3xl bg-primary/20 blur-xl -z-10" />
  </motion.div>
);

// Floating feature cards
const FeatureCard = ({ icon: Icon, title, delay }: { icon: React.ElementType; title: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
  >
    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <span className="text-sm text-muted-foreground">{title}</span>
  </motion.div>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message.includes("Invalid login credentials") 
            ? "Invalid email or password" 
            : error.message);
        } else {
          toast.success("Welcome back!");
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.message.includes("already registered") 
            ? "This email is already registered. Please sign in." 
            : error.message);
        } else {
          toast.success("Account created! Please check your email to verify.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        
        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/20 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/20 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} 
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AnimatedLogo />
            
            <h1 className="mt-8 font-display text-5xl font-bold leading-tight">
              <span className="text-foreground">Create</span>
              <br />
              <span className="text-gradient-primary">On-Brand</span>
              <br />
              <span className="text-foreground">Content</span>
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground max-w-md">
              AI-powered social media automation that understands your brand voice and generates scroll-stopping posts.
            </p>

            <div className="mt-10 space-y-3">
              <FeatureCard icon={Zap} title="Generate posts in seconds" delay={0.3} />
              <FeatureCard icon={Target} title="Brand-consistent messaging" delay={0.4} />
              <FeatureCard icon={TrendingUp} title="Optimized for engagement" delay={0.5} />
            </div>
          </motion.div>
        </div>

        {/* Corner accent */}
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-accent/10 to-transparent" />
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <AnimatedLogo />
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground">
              {isLogin ? "Welcome back" : "Get started"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isLogin 
                ? "Sign in to your account to continue" 
                : "Create your account and start creating"}
            </p>
          </div>

          <div className="glass rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground text-sm font-medium">
                  Email address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus:bg-secondary transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground text-sm font-medium">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground focus:bg-secondary transition-colors"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-primary text-primary-foreground hover:opacity-90 font-semibold text-base"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? "Sign in" : "Create account"}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "New to the platform?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1.5 text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  {isLogin ? "Create account" : "Sign in"}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            By continuing, you agree to our{" "}
            <span className="text-foreground/70 hover:text-foreground cursor-pointer">Terms</span>
            {" "}and{" "}
            <span className="text-foreground/70 hover:text-foreground cursor-pointer">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
