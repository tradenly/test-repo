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
} from "@/components/ui/sidebar";

interface DashboardSidebarProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

export const DashboardSidebar = ({ activeSection, onSectionChange }: DashboardSidebarProps) => {
  const isMobile = useIsMobile();
  
  const menuItems = [
    { id: "overview" as DashboardSection, label: "Overview", icon: LayoutDashboard },
    { id: "profile" as DashboardSection, label: "Profile", icon: User },
    { id: "flappy-hippos" as DashboardSection, label: "Flappy Hippos", icon: Gamepad2 },
    { id: "falling-logs" as DashboardSection, label: "Falling Logs", icon: TreePine },
    { id: "leaderboard" as DashboardSection, label: "Leaderboard", icon: Trophy },
    { id: "documents" as DashboardSection, label: "Documents", icon: FileText },
    { id: "wallets" as DashboardSection, label: "Wallets", icon: Wallet },
    { id: "staking" as DashboardSection, label: "Staking", icon: PiggyBank },
    { id: "social" as DashboardSection, label: "Social", icon: Users },
    { id: "portfolio" as DashboardSection, label: "Portfolio", icon: TrendingUp },
    { id: "rewards" as DashboardSection, label: "Rewards", icon: Gift },
  ];

  if (isMobile) {
    return (
      <Sidebar className="border-r border-gray-800">
        <SidebarHeader className="p-6">
          <h2 className="text-xl font-bold text-white">💩 POOPEE Dashboard</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={activeSection === item.id}
                    className="w-full justify-start text-left"
                  >
                    <Icon className="mr-3 h-4 w-4" />
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

  // Desktop sidebar (unchanged)
  return (
    <aside className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">💩 POOPEE Dashboard</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
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
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
