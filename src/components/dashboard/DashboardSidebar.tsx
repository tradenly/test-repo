
import { Button } from "@/components/ui/button";
import { 
  User, 
  Wallet, 
  PiggyBank, 
  Users, 
  TrendingUp, 
  Gift,
  LayoutDashboard,
  Gamepad2,
  Trophy,
  FileText,
  TreePine
} from "lucide-react";
import { DashboardSection } from "@/pages/Dashboard";
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

interface DashboardSidebarProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

export const DashboardSidebar = ({ activeSection, onSectionChange }: DashboardSidebarProps) => {
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
  
  const menuItems = [
    { id: "overview" as DashboardSection, label: "Overview", icon: LayoutDashboard, isIconComponent: true },
    { id: "profile" as DashboardSection, label: "Profile", icon: User, isIconComponent: true },
    { id: "flappy-hippos" as DashboardSection, label: "Flappy Hippos", icon: Gamepad2, isIconComponent: true },
    { id: "falling-logs" as DashboardSection, label: "Falling Logs", icon: TreePine, isIconComponent: true },
    { id: "poopee-crush" as DashboardSection, label: "POOPEE Crush", icon: "💩", isIconComponent: false },
    { id: "leaderboard" as DashboardSection, label: "Leaderboard", icon: Trophy, isIconComponent: true },
    { id: "documents" as DashboardSection, label: "Documents", icon: FileText, isIconComponent: true },
    { id: "wallets" as DashboardSection, label: "Wallets", icon: Wallet, isIconComponent: true },
    { id: "staking" as DashboardSection, label: "Staking", icon: PiggyBank, isIconComponent: true },
    { id: "social" as DashboardSection, label: "Social", icon: Users, isIconComponent: true },
    { id: "portfolio" as DashboardSection, label: "Portfolio", icon: TrendingUp, isIconComponent: true },
    { id: "rewards" as DashboardSection, label: "Rewards", icon: Gift, isIconComponent: true },
  ];

  const handleMobileMenuClick = (sectionId: DashboardSection) => {
    onSectionChange(sectionId);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  if (isMobile) {
    return (
      <Sidebar className="border-r border-gray-800 bg-gray-900 dark">
        <SidebarHeader className="p-6 bg-gray-900">
          <h2 className="text-xl font-bold text-white">💩 POOPEE Dashboard</h2>
        </SidebarHeader>
        <SidebarContent className="bg-gray-900">
          <SidebarMenu className="px-4">
            {menuItems.map((item) => {
              const IconComponent = item.isIconComponent ? item.icon : null;
              
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleMobileMenuClick(item.id)}
                    isActive={activeSection === item.id}
                    className={`w-full justify-start text-left text-white hover:bg-gray-800 hover:text-white ${
                      activeSection === item.id 
                        ? "bg-gray-700 text-white font-medium" 
                        : ""
                    }`}
                  >
                    {item.isIconComponent && IconComponent ? (
                      <IconComponent className="mr-3 h-4 w-4" />
                    ) : (
                      <span className="mr-3 text-lg">{item.icon as string}</span>
                    )}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Desktop sidebar
  return (
    <aside className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">💩 POOPEE Dashboard</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.isIconComponent ? item.icon : null;
            
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start text-left ${
                  activeSection === item.id 
                    ? "bg-gray-700 text-white" 
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                {item.isIconComponent && IconComponent ? (
                  <IconComponent className="mr-3 h-4 w-4" />
                ) : (
                  <span className="mr-3 text-lg">{item.icon as string}</span>
                )}
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
