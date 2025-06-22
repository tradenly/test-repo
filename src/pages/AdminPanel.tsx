import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminContent } from "@/components/admin/AdminContent";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

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
  const isMobile = useIsMobile();

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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-black w-full">
        <Navigation />
        <SidebarProvider>
          <div className="flex w-full min-h-screen">
            <AdminSidebar 
              activeSection={activeSection} 
              onSectionChange={setActiveSection} 
            />
            <SidebarInset>
              <div className="pt-20 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <SidebarTrigger className="md:hidden border border-yellow-600 bg-yellow-600 text-black hover:bg-yellow-500 h-10 w-10 p-0 flex items-center justify-center">
                    <Menu className="h-4 w-4" />
                  </SidebarTrigger>
                  <h1 className="text-xl font-semibold text-white capitalize">
                    Admin {activeSection.replace('-', ' ')}
                  </h1>
                </div>
                <AdminContent activeSection={activeSection} />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    );
  }

  // Desktop layout (unchanged)
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
