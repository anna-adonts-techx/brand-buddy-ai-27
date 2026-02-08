const TechReport = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 p-8 print:p-4">
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>
      
      {/* Print Button - Hidden when printing */}
      <button 
        onClick={() => window.print()} 
        className="no-print fixed top-4 right-4 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
      >
        Save as PDF (Ctrl+P)
      </button>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="border-b-2 border-violet-600 pb-4">
          <h1 className="text-3xl font-bold text-violet-600">Brand Buddy AI</h1>
          <p className="text-lg text-gray-600">Technical Architecture Report</p>
          <p className="text-sm text-gray-500">February 2026 | Hackathon Submission</p>
        </header>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          {/* Left Column */}
          <div className="space-y-4">
            <section>
              <h2 className="text-lg font-semibold text-violet-600 border-b border-gray-200 pb-1 mb-2">
                Overview
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Brand Buddy AI is an agentic social media content platform that learns your brand's 
                unique voice and generates platform-optimized posts for LinkedIn and Instagram. 
                Unlike generic AI tools, it extracts "Brand DNA" and uses self-improving feedback 
                loops to ensure authentic, on-brand content.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-violet-600 border-b border-gray-200 pb-1 mb-2">
                Tech Stack
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">Frontend:</span> React 18, TypeScript
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">Styling:</span> Tailwind CSS, shadcn/ui
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">State:</span> Zustand
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">Backend:</span> Supabase Edge Functions
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">AI:</span> Lovable AI Gateway
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="font-medium">Auth:</span> Supabase Auth + JWT
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-violet-600 border-b border-gray-200 pb-1 mb-2">
                Security Implementation
              </h2>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>✓ JWT authentication on all Edge Functions</li>
                <li>✓ Zod schema validation for all inputs</li>
                <li>✓ Environment-based CORS whitelisting</li>
                <li>✓ Sanitized error responses (no info leakage)</li>
                <li>✓ Protected routes with auth guards</li>
              </ul>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <section>
              <h2 className="text-lg font-semibold text-violet-600 border-b border-gray-200 pb-1 mb-2">
                Agentic Architecture
              </h2>
              <div className="bg-gray-50 p-3 rounded text-xs font-mono space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded">1</span>
                  <span>analyze-brand → Extract Brand DNA</span>
                </div>
                <div className="text-gray-400 pl-6">↓</div>
                <div className="flex items-center gap-2">
                  <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded">2</span>
                  <span>generate-posts → Create variations</span>
                </div>
                <div className="text-gray-400 pl-6">↓</div>
                <div className="flex items-center gap-2">
                  <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded">3</span>
                  <span>feedback-loop → Self-evaluate (1-10)</span>
                </div>
                <div className="text-gray-400 pl-6">↓</div>
                <div className="flex items-center gap-2">
                  <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded">4</span>
                  <span>iterate-post → Auto-improve content</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                The AI performs 2-3 internal iterations before presenting content to users, 
                scoring across tone, clarity, CTA effectiveness, and readability.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-violet-600 border-b border-gray-200 pb-1 mb-2">
                Key Innovations
              </h2>
              <ul className="text-gray-700 space-y-2 text-xs">
                <li>
                  <strong>Brand DNA Extraction:</strong> Analyzes tone, emoji patterns, 
                  CTA styles, and visual identity from company data.
                </li>
                <li>
                  <strong>Self-Improving Loop:</strong> Structured JSON schemas enable 
                  reliable AI-to-AI feedback chaining.
                </li>
                <li>
                  <strong>Platform Optimization:</strong> Content automatically adapts 
                  to LinkedIn vs Instagram conventions.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-violet-600 border-b border-gray-200 pb-1 mb-2">
                Limitations & Roadmap
              </h2>
              <ul className="text-gray-700 space-y-1 text-xs">
                <li>⚠ In-memory state (database persistence planned)</li>
                <li>⚠ Single-user (multi-tenant RLS coming)</li>
                <li>⚠ No direct asset uploads (prompt-based images)</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-3 flex justify-between items-center text-xs text-gray-500">
          <span>Live Demo: brand-buddy-ai-27.lovable.app</span>
          <span>Built with Lovable × Supabase × AI Gateway</span>
        </footer>
      </div>
    </div>
  );
};

export default TechReport;
