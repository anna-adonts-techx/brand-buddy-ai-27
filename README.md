# Brand Buddy AI 🎨

An AI-powered social media content management platform that helps businesses create on-brand posts for LinkedIn and Instagram.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase)

## ✨ Features

### 🎯 Brand Analysis
- Analyze your company's brand voice and visual identity
- AI-powered extraction of tone, messaging patterns, and value propositions
- Automatic detection of language patterns and CTA styles

### 📅 Content Planner
- Plan and schedule social media posts
- Support for announcements, events, partnerships, and achievements
- Dual-platform support (LinkedIn & Instagram)

### 🤖 AI Post Generator
- Generate multiple post variations based on your brand profile
- Platform-optimized content for LinkedIn and Instagram
- Automatic hashtag suggestions and image descriptions
- Quality scoring with strengths and improvement suggestions

### 🔄 Feedback Loop
- AI-powered quality evaluation of generated content
- Iterative improvement based on tone, wording, and CTA feedback
- Automatic caption refinement and text overlay optimization

### 🖼️ Image Generation
- AI-generated images tailored to your brand colors
- Support for square and story aspect ratios
- Text overlay integration

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand
- **Backend**: Supabase Edge Functions
- **AI**: Lovable AI Gateway (Gemini/GPT models)
- **Authentication**: Supabase Auth

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (or use Lovable Cloud)

### Installation

1. Clone the repository:
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env file with your Supabase credentials
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── AppSidebar.tsx  # Navigation sidebar
│   ├── BrandSetup.tsx  # Brand analysis form
│   ├── ContentPlanner.tsx # Post planning interface
│   └── PostGenerator.tsx  # AI generation interface
├── hooks/              # Custom React hooks
├── lib/                # Utilities and services
│   ├── ai-service.ts   # AI API integration
│   ├── store.ts        # Zustand state management
│   └── utils.ts        # Helper functions
├── pages/              # Page components
└── integrations/       # External service integrations

supabase/
└── functions/          # Edge Functions
    ├── analyze-brand/  # Brand analysis endpoint
    ├── generate-posts/ # Post generation endpoint
    ├── feedback-loop/  # Quality evaluation endpoint
    ├── generate-image/ # Image generation endpoint
    └── iterate-post/   # Post refinement endpoint
```

## 🔐 Security

- JWT authentication on all Edge Functions
- CORS protection with origin validation
- Sanitized error responses (no information leakage)
- Rate limiting ready

## 📖 Usage

1. **Set Up Your Brand**: Navigate to Brand Setup and enter your company details. The AI will analyze your brand voice and visual identity.

2. **Plan Content**: Use the Content Planner to schedule posts with specific intents (announcements, events, achievements).

3. **Generate Posts**: Select a planned post and generate AI-powered variations optimized for your brand.

4. **Refine & Publish**: Use the feedback loop to iterate on content until it meets your quality standards.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- [Live Demo](https://brand-buddy-ai-27.lovable.app)
- [Lovable Platform](https://lovable.dev)

---

Built with ❤️ using [Lovable](https://lovable.dev)
