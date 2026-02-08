# Brand Buddy AI

An AI-powered social media content generation platform that helps brands create consistent, on-brand posts for LinkedIn and Instagram.

## ✨ Features

### 🎨 Brand Setup
- **Brand Analysis**: AI-powered analysis of your company's voice, visual identity, and messaging patterns
- **Voice Profiling**: Automatically detects tone, emoji usage, CTA style, and language patterns
- **Visual Identity**: Captures brand colors, layout preferences, and typography style

### 📅 Content Planner
- Plan posts with different intents: announcements, events, partnerships, achievements
- Schedule content for LinkedIn, Instagram, or both platforms
- Add custom tones and additional elements to each post

### 🤖 AI Post Generator
- **Multi-Variation Generation**: Creates multiple post variations optimized for each platform
- **Agentic Feedback Loop**: Internal AI review system that optimizes brand consistency, message clarity, CTA effectiveness, and text readability
- **Quality Scoring**: Each variation receives a quality score with strengths and improvement suggestions
- **Image Generation**: AI-generated images with text overlays matching your brand colors

### 🔄 Post Iteration
- Refine posts with feedback types: tone, wording, CTA, shorter, longer, or custom
- Real-time improvements while maintaining brand voice

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand
- **Backend**: Supabase Edge Functions
- **AI**: Lovable AI Gateway (Gemini/GPT models)
- **Authentication**: Supabase Auth

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or bun package manager

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── AppSidebar.tsx  # Navigation sidebar
│   ├── BrandSetup.tsx  # Brand configuration
│   ├── ContentPlanner.tsx  # Post planning
│   └── PostGenerator.tsx   # AI generation interface
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Authentication hook
│   └── use-mobile.tsx  # Responsive detection
├── lib/                # Utilities and services
│   ├── ai-service.ts   # AI API integrations
│   ├── store.ts        # Zustand state store
│   └── utils.ts        # Helper functions
├── pages/              # Route pages
│   ├── Index.tsx       # Main dashboard
│   ├── Auth.tsx        # Login/signup
│   └── NotFound.tsx    # 404 page
└── integrations/       # External integrations
    └── supabase/       # Supabase client & types

supabase/
└── functions/          # Edge Functions
    ├── analyze-brand/  # Brand analysis AI
    ├── generate-posts/ # Post generation AI
    ├── feedback-loop/  # Quality review AI
    ├── generate-image/ # Image generation
    └── iterate-post/   # Post refinement AI
```

## 🔐 Security

- JWT authentication on all Edge Functions
- Sanitized error responses (no internal details exposed)
- CORS restricted to allowed origins
- Environment-based configuration

## 📝 Usage

1. **Set Up Your Brand**: Enter your company details and let AI analyze your brand voice
2. **Plan Content**: Create post plans with specific intents and target platforms
3. **Generate Posts**: AI creates multiple variations with images and captions
4. **Refine & Export**: Iterate on posts and export when satisfied

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

---

Built with [Lovable](https://lovable.dev)
