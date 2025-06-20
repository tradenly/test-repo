
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

export type DashboardSection = 
  | "overview" 
  | "profile" 
  | "flappy-hippos"
  | "wallets" 
  | "staking" 
  | "social" 
  | "portfolio" 
  | "rewards";

const Dashboard = () => {
  const { user, loading } = useUnifiedAuth();
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");

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
