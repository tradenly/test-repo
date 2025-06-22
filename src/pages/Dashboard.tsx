import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export type DashboardSection = 
  | "overview" 
  | "profile" 
  | "flappy-hippos"
  | "falling-logs"
  | "leaderboard"
  | "documents"
  | "wallets" 
  | "staking" 
  | "social" 
  | "portfolio" 
  | "rewards";

const Dashboard = () => {
  const { user, loading } = useUnifiedAuth();
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");
  const isMobile = useIsMobile();

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
        <SidebarProvider>
          <div className="flex w-full min-h-screen">
            <DashboardSidebar 
              activeSection={activeSection} 
              onSectionChange={setActiveSection} 
            />
            <SidebarInset>
              <div className="pt-20 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <SidebarTrigger className="md:hidden border border-gray-600 bg-gray-800 text-white hover:bg-gray-700 h-10 w-10 p-0 flex items-center justify-center">
                    <Menu className="h-4 w-4" />
                  </SidebarTrigger>
                  <h1 className="text-xl font-semibold text-white capitalize">
                    {activeSection.replace('-', ' ')}
                  </h1>
                </div>
                <DashboardContent activeSection={activeSection} user={user} />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
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
          onSectionChange={setActiveSection} 
        />
        <main className="flex-1 p-8">
          <DashboardContent activeSection={activeSection} user={user} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
