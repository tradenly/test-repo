
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

  console.log('AdminPanel: Render - isAdmin:', isAdmin, 'isLoading:', isLoading, 'user exists:', !!user);

  // Show loading screen while checking authentication
  if (isLoading) {
    console.log('AdminPanel: Still loading admin status');
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Checking admin access...</div>
      </div>
    );
  }

  // Only redirect if we're certain the user is not an admin AND not loading
  if (!user) {
    console.log('AdminPanel: No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    console.log('AdminPanel: User is not an admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('AdminPanel: User is admin, rendering admin panel');
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
