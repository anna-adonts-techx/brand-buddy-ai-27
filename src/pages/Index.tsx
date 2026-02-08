import AppSidebar from "@/components/AppSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardOverview from "@/components/DashboardOverview";
import BrandSetup from "@/components/BrandSetup";
import ContentPlanner from "@/components/ContentPlanner";
import PostGenerator from "@/components/PostGenerator";
import { useAppStore } from "@/lib/store";

const headerConfig: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Your AI social media command center" },
  brand: { title: "Brand Setup", subtitle: "Define your brand voice and visual identity" },
  planner: { title: "Content Planner", subtitle: "Plan and schedule your social media posts" },
  generate: { title: "AI Generator", subtitle: "Generate on-brand post variations" },
  posts: { title: "Generated Posts", subtitle: "Review and manage your content library" },
  settings: { title: "Settings", subtitle: "Configure your workspace preferences" },
};

const Index = () => {
  const { activeTab, setActiveTab, setCurrentPostPlan } = useAppStore();
  const header = headerConfig[activeTab] || headerConfig.dashboard;

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader title={header.title} subtitle={header.subtitle} />
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === "dashboard" && <DashboardOverview />}
          {activeTab === "brand" && <BrandSetup />}
          {activeTab === "planner" && (
            <ContentPlanner onGenerate={(post) => setCurrentPostPlan(post)} />
          )}
          {activeTab === "generate" && <PostGenerator />}
          {activeTab === "posts" && (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p>Generated posts will appear here after you create content.</p>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p>Settings coming soon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
