import { create } from "zustand";
import { BrandProfile, PlannedPost, PostVariation } from "@/lib/ai-service";

interface AppState {
  // Brand
  brandProfile: BrandProfile | null;
  setBrandProfile: (profile: BrandProfile | null) => void;

  // Content Plan
  plannedPosts: PlannedPost[];
  addPlannedPost: (post: PlannedPost) => void;
  removePlannedPost: (id: string) => void;
  updatePlannedPost: (id: string, updates: Partial<PlannedPost>) => void;

  // Generation
  currentPostPlan: PlannedPost | null;
  setCurrentPostPlan: (post: PlannedPost | null) => void;
  generatedVariations: PostVariation[];
  setGeneratedVariations: (variations: PostVariation[]) => void;
  updateVariation: (id: string, updates: Partial<PostVariation>) => void;
  selectedVariationId: string | null;
  setSelectedVariationId: (id: string | null) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const samplePosts: PlannedPost[] = [
  {
    id: "1",
    intent: "event",
    platform: "both",
    title: "Hack-Nation Hackathon Launch",
    details: "Announce the upcoming Hack-Nation hackathon with Super Bowl themed branding. Highlight prizes, dates, and registration link.",
    date: "2026-02-15",
    tone: "Exciting, energetic",
    additionalElements: "Include $50K prize pool, 48-hour format, AI/Web3/Social Impact tracks",
  },
  {
    id: "2",
    intent: "announcement",
    platform: "linkedin",
    title: "Speaker Lineup Reveal",
    details: "Reveal keynote speakers for the hackathon. Include headshots and bios. Reference Olympic spirit of competition.",
    date: "2026-02-18",
    tone: "Professional, inspiring",
    additionalElements: "Speakers: Jane Smith (Google AI), Mark Chen (OpenAI), Sarah Johnson (YC)",
  },
  {
    id: "3",
    intent: "achievement",
    platform: "instagram",
    title: "Winner Announcement",
    details: "Celebrate hackathon winners with trophy imagery and project screenshots. Include quotes from winning teams.",
    date: "2026-02-22",
    tone: "Celebratory, proud",
    additionalElements: "1st: Team Alpha - AI-powered sustainability tracker, 2nd: Team Beta - Decentralized voting platform",
  },
];

export const useAppStore = create<AppState>((set) => ({
  brandProfile: null,
  setBrandProfile: (profile) => set({ brandProfile: profile }),

  plannedPosts: samplePosts,
  addPlannedPost: (post) =>
    set((state) => ({ plannedPosts: [...state.plannedPosts, post] })),
  removePlannedPost: (id) =>
    set((state) => ({ plannedPosts: state.plannedPosts.filter((p) => p.id !== id) })),
  updatePlannedPost: (id, updates) =>
    set((state) => ({
      plannedPosts: state.plannedPosts.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  currentPostPlan: null,
  setCurrentPostPlan: (post) => set({ currentPostPlan: post }),
  generatedVariations: [],
  setGeneratedVariations: (variations) => set({ generatedVariations: variations }),
  updateVariation: (id, updates) =>
    set((state) => ({
      generatedVariations: state.generatedVariations.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    })),
  selectedVariationId: null,
  setSelectedVariationId: (id) => set({ selectedVariationId: id }),

  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
