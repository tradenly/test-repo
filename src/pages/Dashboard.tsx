
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

  console.log('Dashboard render:', { isLoading, isAuthenticated, hasUser: !!user });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💩 🦛</div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('Dashboard access granted');

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
