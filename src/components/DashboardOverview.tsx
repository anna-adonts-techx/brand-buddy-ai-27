import { motion } from "framer-motion";
import {
  Sparkles,
  FileImage,
  TrendingUp,
  Calendar,
  ArrowRight,
  Linkedin,
  Instagram,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void;
}

const stats = [
  { label: "Posts Generated", value: "0", icon: FileImage, change: "Ready to start" },
  { label: "Brand Profiles", value: "0", icon: Sparkles, change: "Set up your brand" },
  { label: "Avg. Quality Score", value: "—", icon: TrendingUp, change: "Generate to see" },
  { label: "Scheduled Posts", value: "3", icon: Calendar, change: "In content plan" },
];

const quickActions = [
  {
    title: "Set Up Brand",
    description: "Analyze your brand voice and visual identity",
    icon: Sparkles,
    tab: "brand",
    gradient: "bg-gradient-primary",
  },
  {
    title: "Plan Content",
    description: "Create your posting schedule and intents",
    icon: Calendar,
    tab: "planner",
    gradient: "bg-gradient-accent",
  },
  {
    title: "Generate Posts",
    description: "AI-powered post creation with feedback loops",
    icon: Zap,
    tab: "generate",
    gradient: "bg-gradient-primary",
  },
];

const DashboardOverview = ({ onNavigate }: DashboardOverviewProps) => {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden"
      >
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="relative px-8 py-12">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs font-medium text-primary uppercase tracking-wider">AI-Powered</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-3 max-w-lg">
            Social Media on <span className="text-gradient-primary">Autopilot</span>
          </h1>
          <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
            Create on-brand LinkedIn & Instagram posts in minutes. AI generates, critiques, and refines — you pick the winner.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => onNavigate("brand")}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 h-11"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("planner")}
              className="border-border text-foreground hover:bg-secondary h-11"
            >
              View Content Plan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-xs text-muted-foreground">{stat.change}</span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display text-lg font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                onClick={() => onNavigate(action.tab)}
                className="glass rounded-xl p-6 text-left group hover:border-primary/30 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-lg ${action.gradient} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Platform badges */}
      <div className="flex items-center justify-center gap-6 pt-4 pb-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Linkedin className="w-5 h-5" />
          <span className="text-sm">LinkedIn</span>
        </div>
        <div className="w-px h-5 bg-border" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <Instagram className="w-5 h-5" />
          <span className="text-sm">Instagram</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
