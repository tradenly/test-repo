
import { cn } from "@/lib/utils";
import { AdminSection } from "@/pages/AdminPanel";
import { 
  Users, 
  Coins, 
  Activity, 
  CreditCard, 
  BarChart3, 
  Settings 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const adminSections = [
  { id: "overview" as AdminSection, label: "Overview", icon: BarChart3 },
  { id: "users" as AdminSection, label: "User Management", icon: Users },
  { id: "credits" as AdminSection, label: "Credit Management", icon: Coins },
  { id: "activity" as AdminSection, label: "Activity Monitor", icon: Activity },
  { id: "payouts" as AdminSection, label: "Payout Management", icon: CreditCard },
  { id: "analytics" as AdminSection, label: "Analytics", icon: BarChart3 },
];

export const AdminSidebar = ({ activeSection, onSectionChange }: AdminSidebarProps) => {
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();

  const handleMobileMenuClick = (sectionId: AdminSection) => {
    onSectionChange(sectionId);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  if (isMobile) {
    return (
      <Sidebar className="border-r border-gray-800 bg-gray-900 dark">
        <SidebarHeader className="p-6 bg-gray-900">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          </div>
        </SidebarHeader>
        <SidebarContent className="bg-gray-900">
          <SidebarMenu className="px-4">
            {adminSections.map((section) => {
              const Icon = section.icon;
              return (
                <SidebarMenuItem key={section.id}>
                  <SidebarMenuButton
                    onClick={() => handleMobileMenuClick(section.id)}
                    isActive={activeSection === section.id}
                    className={`w-full justify-start text-left text-white hover:bg-gray-800 hover:text-white ${
                      activeSection === section.id
                        ? "bg-yellow-600 text-black font-medium"
                        : ""
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span>{section.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Desktop sidebar (unchanged)
  return (
    <aside className="w-64 bg-gray-900/50 border-r border-gray-800 min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Settings className="h-6 w-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        </div>
        
        <nav className="space-y-2">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                  activeSection === section.id
                    ? "bg-yellow-600 text-black font-medium"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
