import { useState, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";

export type DashboardSection = 
  | "overview" 
  | "profile" 
  | "flappy-hippos"
  | "falling-logs"
  | "poopee-crush"
  | "miss-poopee-man"
  | "space-invaders"
  | "leaderboard"
  | "documents"
  | "wallets" 
  | "staking" 
  | "social" 
  | "portfolio" 
  | "rewards"
  | "free-tools"
  | "news-updates"
  | "tokenomics"
  | "contact";

const Dashboard = () => {
  const { user, loading } = useUnifiedAuth();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Handle section navigation from URL parameters
  useEffect(() => {
    const section = searchParams.get('section');
    const validSections: DashboardSection[] = [
      "overview", "profile", "flappy-hippos", "falling-logs", "poopee-crush",
      "miss-poopee-man", "space-invaders", "leaderboard", "documents", "wallets", "staking", "social", "portfolio",
      "rewards", "free-tools", "news-updates", "tokenomics", "contact"
    ];
    
    if (section && validSections.includes(section as DashboardSection)) {
      setActiveSection(section as DashboardSection);
    }
  }, [searchParams]);

  const handleSectionChange = (section: DashboardSection) => {
    if (section === "contact") {
      // Redirect to the dedicated contact page
      window.location.href = "/contact";
      return;
    }
    setActiveSection(section);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect to auth if not logged in with either method
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-black w-full">
        <Navigation />
        <div className="pt-20 p-4 bg-black min-h-screen">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="border border-blue-600 bg-blue-600 text-white hover:bg-blue-400 hover:text-black h-10 w-10 p-0 flex items-center justify-center rounded"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-xl font-semibold text-white capitalize">
              {activeSection.replace('-', ' ')}
            </h1>
          </div>
          <div className="bg-black">
            <DashboardContent activeSection={activeSection} user={user} onSectionChange={handleSectionChange} />
          </div>
        </div>
        
        <DashboardSidebar 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="pt-20 flex">
        <DashboardSidebar 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange} 
        />
        <main className="flex-1 p-8">
          <DashboardContent activeSection={activeSection} user={user} onSectionChange={handleSectionChange} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
