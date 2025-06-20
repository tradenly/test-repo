
import { Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useHybridAuth } from "@/hooks/useHybridAuth";
import { useState } from "react";

export type DashboardSection = 
  | "overview" 
  | "profile" 
  | "wallets" 
  | "staking" 
  | "social" 
  | "portfolio" 
  | "rewards";

const Dashboard = () => {
  const { user, isLoading, isAuthenticated } = useHybridAuth();
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
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
