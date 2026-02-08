import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  CalendarDays,
  Linkedin,
  Instagram,
  Megaphone,
  PartyPopper,
  Handshake,
  Trophy,
  Trash2,
  Sparkles,
  Edit3,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { PlannedPost } from "@/lib/ai-service";

type PostIntent = "announcement" | "event" | "partnership" | "achievement";
type Platform = "linkedin" | "instagram" | "both";

const intentConfig: Record<PostIntent, { icon: React.ElementType; label: string; color: string }> = {
  announcement: { icon: Megaphone, label: "Announcement", color: "text-primary" },
  event: { icon: PartyPopper, label: "Event", color: "text-accent" },
  partnership: { icon: Handshake, label: "Partnership", color: "text-emerald-400" },
  achievement: { icon: Trophy, label: "Achievement", color: "text-amber-400" },
};

interface ContentPlannerProps {
  onGenerate: (post: PlannedPost) => void;
}

const ContentPlanner = ({ onGenerate }: ContentPlannerProps) => {
  const { plannedPosts, addPlannedPost, removePlannedPost, updatePlannedPost, setCurrentPostPlan, setActiveTab } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<PlannedPost | null>(null);
  const [newPost, setNewPost] = useState<Partial<PlannedPost>>({
    intent: "announcement",
    platform: "both",
  });

  const handleAddPost = () => {
    if (!newPost.title) {
      toast.error("Please add a title");
      return;
    }
    const post: PlannedPost = {
      id: Date.now().toString(),
      intent: newPost.intent || "announcement",
      platform: newPost.platform || "both",
      title: newPost.title || "",
      details: newPost.details || "",
      date: newPost.date || new Date().toISOString().split("T")[0],
      tone: newPost.tone,
      additionalElements: newPost.additionalElements,
    };
    addPlannedPost(post);
    setNewPost({ intent: "announcement", platform: "both" });
    setShowForm(false);
    toast.success("Post added to plan!");
  };

  const handleGenerate = (post: PlannedPost) => {
    setCurrentPostPlan(post);
    setActiveTab("generate");
    onGenerate(post);
  };

  const handleEditPost = (post: PlannedPost) => {
    setEditingPost(post);
    setNewPost(post);
    setShowForm(true);
  };

  const handleSaveEdit = () => {
    if (!editingPost) return;
    if (!newPost.title) {
      toast.error("Please add a title");
      return;
    }
    updatePlannedPost(editingPost.id, {
      intent: newPost.intent || "announcement",
      platform: newPost.platform || "both",
      title: newPost.title || "",
      details: newPost.details || "",
      date: newPost.date || new Date().toISOString().split("T")[0],
      tone: newPost.tone,
      additionalElements: newPost.additionalElements,
    });
    setEditingPost(null);
    setNewPost({ intent: "announcement", platform: "both" });
    setShowForm(false);
    toast.success("Post updated!");
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setNewPost({ intent: "announcement", platform: "both" });
    setShowForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Content Plan</h2>
            <p className="text-sm text-muted-foreground">{plannedPosts.length} posts planned</p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-primary text-primary-foreground hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Post
        </Button>
      </div>

      {/* New Post Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-foreground">
                  {editingPost ? "Edit Post" : "New Post"}
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Post Title *</label>
                  <Input
                    placeholder="e.g. Product Launch Announcement"
                    value={newPost.title || ""}
                    onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Date</label>
                  <Input
                    type="date"
                    value={newPost.date || ""}
                    onChange={(e) => setNewPost((p) => ({ ...p, date: e.target.value }))}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Intent</label>
                <div className="flex gap-2">
                  {(Object.keys(intentConfig) as PostIntent[]).map((intent) => {
                    const config = intentConfig[intent];
                    const Icon = config.icon;
                    return (
                      <button
                        key={intent}
                        onClick={() => setNewPost((p) => ({ ...p, intent }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          newPost.intent === intent
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : "bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Platform</label>
                <div className="flex gap-2">
                  {([
                    { id: "linkedin" as Platform, icon: Linkedin, label: "LinkedIn" },
                    { id: "instagram" as Platform, icon: Instagram, label: "Instagram" },
                    { id: "both" as Platform, icon: null, label: "Both" },
                  ]).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setNewPost((prev) => ({ ...prev, platform: p.id }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        newPost.platform === p.id
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "bg-secondary text-muted-foreground hover:text-foreground border border-transparent"
                      }`}
                    >
                      {p.icon && <p.icon className="w-4 h-4" />}
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Details & Context</label>
                <Textarea
                  placeholder="What should this post communicate? Any specific elements to include?"
                  value={newPost.details || ""}
                  onChange={(e) => setNewPost((p) => ({ ...p, details: e.target.value }))}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Tone (optional)</label>
                  <Input
                    placeholder="e.g. Professional, Playful, Urgent"
                    value={newPost.tone || ""}
                    onChange={(e) => setNewPost((p) => ({ ...p, tone: e.target.value }))}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Additional Elements (RAG)</label>
                  <Input
                    placeholder="Speaker names, prizes, images to include..."
                    value={newPost.additionalElements || ""}
                    onChange={(e) => setNewPost((p) => ({ ...p, additionalElements: e.target.value }))}
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancelEdit} className="border-border text-foreground hover:bg-secondary">
                  Cancel
                </Button>
                <Button 
                  onClick={editingPost ? handleSaveEdit : handleAddPost} 
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                >
                  {editingPost ? "Save Changes" : "Add to Plan"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts List */}
      <motion.div layout className="space-y-3">
        {plannedPosts.map((post, index) => {
          const config = intentConfig[post.intent];
          const Icon = config.icon;
          return (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-xl p-5 group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-display font-semibold text-foreground truncate">{post.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground shrink-0">
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.details}</p>
                  {post.additionalElements && (
                    <p className="text-xs text-primary/70 line-clamp-1">
                      📎 {post.additionalElements}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {(post.platform === "linkedin" || post.platform === "both") && <Linkedin className="w-3.5 h-3.5" />}
                    {(post.platform === "instagram" || post.platform === "both") && <Instagram className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{post.date}</span>
                  <button
                    onClick={() => handleEditPost(post)}
                    className="p-1.5 rounded-lg hover:bg-primary/15 text-muted-foreground hover:text-primary transition-all"
                    title="Edit post"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <Button
                    size="sm"
                    onClick={() => handleGenerate(post)}
                    className="bg-gradient-primary text-primary-foreground hover:opacity-90 text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Generate
                  </Button>
                  <button
                    onClick={() => removePlannedPost(post.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {plannedPosts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No posts planned yet. Add your first post above!</p>
        </div>
      )}
    </div>
  );
};

export default ContentPlanner;
