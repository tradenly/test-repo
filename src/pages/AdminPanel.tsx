
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminContent } from "@/components/admin/AdminContent";
import { useSecurityGuard } from "@/hooks/useSecurityGuard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";

export type AdminSection = 
  | "overview" 
  | "users" 
  | "credits"
  | "activity" 
  | "payouts" 
  | "analytics"
  | "traffic"
  | "requests"
  | "games"
  | "ai-agent"
  | "contact";

const AdminPanel = () => {
  const { isLoading, hasAccess } = useSecurityGuard(true);
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Checking admin access...</div>
      </div>
    );
  }

  // If security check failed, component will be redirected
  if (!hasAccess) {
    return null;
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
              Admin {activeSection.replace('-', ' ')}
            </h1>
          </div>
          <div className="bg-black">
            <AdminContent activeSection={activeSection} />
          </div>
        </div>
        
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>
    );
  }

  // Desktop layout
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
