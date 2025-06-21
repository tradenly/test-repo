
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

  // If no user at all, redirect to auth
  if (!user && !isLoading) {
    console.log('🚫 AdminPanel: No user and not loading, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Show loading while we're checking authentication OR admin status
  if (isLoading || !user) {
    console.log('⏳ AdminPanel: Loading state - isLoading:', isLoading, 'user exists:', !!user);
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Checking admin access...</div>
      </div>
    );
  }

  // Only redirect if we have a user AND we're NOT loading AND they're NOT an admin
  if (user && !isLoading && !isAdmin) {
    console.log('🚫 AdminPanel: User confirmed NOT admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // If we get here, render the admin panel
  console.log('✅ AdminPanel: Rendering admin panel for admin user');

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
