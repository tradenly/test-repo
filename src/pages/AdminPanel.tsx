
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminContent } from "@/components/admin/AdminContent";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export type AdminSection = 
  | "overview" 
  | "users" 
  | "credits"
  | "activity" 
  | "payouts" 
  | "analytics";

const AdminPanel = () => {
  const { isAdmin, isLoading, user } = useAdminAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");

  console.log('AdminPanel: Current state - isAdmin:', isAdmin, 'isLoading:', isLoading, 'user:', !!user);

  if (isLoading) {
    console.log('AdminPanel: Still loading, showing loading screen');
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Only redirect after loading is complete and we're sure the user is not an admin
  if (!user || (!isLoading && !isAdmin)) {
    console.log('AdminPanel: Redirecting to dashboard - user:', !!user, 'isAdmin:', isAdmin, 'isLoading:', isLoading);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('AdminPanel: Rendering admin panel');
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="pt-20 flex">
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="flex-1 p-8">
          <AdminContent activeSection={activeSection} />
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
