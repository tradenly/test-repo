
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

  console.log('🏛️ AdminPanel: Render - isAdmin:', isAdmin, 'isLoading:', isLoading, 'user exists:', !!user);

  // Show loading while checking auth
  if (isLoading) {
    console.log('⏳ AdminPanel: Loading admin status');
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Checking admin access...</div>
      </div>
    );
  }

  // Redirect if no user
  if (!user) {
    console.log('🚫 AdminPanel: No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Redirect if not admin
  if (!isAdmin) {
    console.log('🚫 AdminPanel: Not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Render admin panel
  console.log('✅ AdminPanel: Rendering admin panel');
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
