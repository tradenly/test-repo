
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
  TreePine,
  X,
  Wrench,
  Newspaper,
  PieChart,
  MessageSquare,
  Rocket,
  Zap,
  Ghost
} from "lucide-react";
import { DashboardSection } from "@/pages/Dashboard";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardSidebarProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const DashboardSidebar = ({ 
  activeSection, 
  onSectionChange, 
  isOpen = false, 
  onClose 
}: DashboardSidebarProps) => {
  const isMobile = useIsMobile();
  
  const menuItems = [
    { id: "overview" as DashboardSection, label: "Overview", icon: LayoutDashboard },
    { id: "profile" as DashboardSection, label: "Profile", icon: User },
    { id: "flappy-hippos" as DashboardSection, label: "Flappy Hippos", icon: Gamepad2 },
    { id: "falling-logs" as DashboardSection, label: "Falling Logs", icon: TreePine },
    { id: "poopee-crush" as DashboardSection, label: "POOPEE Crush", icon: Zap },
    { id: "miss-poopee-man" as DashboardSection, label: "Miss POOPEE-Man", icon: Ghost },
    { id: "space-invaders" as DashboardSection, label: "Space Invaders", icon: Rocket },
    { id: "leaderboard" as DashboardSection, label: "Leaderboard", icon: Trophy },
    { id: "documents" as DashboardSection, label: "Documents", icon: FileText },
    { id: "wallets" as DashboardSection, label: "Wallets", icon: Wallet },
    { id: "staking" as DashboardSection, label: "Staking", icon: PiggyBank },
    { id: "tokenomics" as DashboardSection, label: "Tokenomics", icon: PieChart },
    { id: "social" as DashboardSection, label: "Social", icon: Users },
    { id: "portfolio" as DashboardSection, label: "Portfolio", icon: TrendingUp },
    { id: "rewards" as DashboardSection, label: "Rewards", icon: Gift },
    { id: "free-tools" as DashboardSection, label: "Free Tools", icon: Wrench },
    { id: "news-updates" as DashboardSection, label: "News & Updates", icon: Newspaper },
    { id: "contact" as DashboardSection, label: "Contact Us", icon: MessageSquare },
  ];

  const handleMenuClick = (sectionId: DashboardSection) => {
    console.log('Menu item clicked:', sectionId);
    onSectionChange(sectionId);
    if (isMobile && onClose) {
      console.log('Closing mobile menu');
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Backdrop clicked, closing menu');
    if (onClose) {
      onClose();
    }
  };

  const handleMenuClick_Stop = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleBackdropClick}
          />
        )}
        
        {/* Mobile Menu */}
        <div 
          className={`fixed left-0 top-0 h-full w-64 max-w-[75vw] bg-gray-900 z-50 transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={handleMenuClick_Stop}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">💩 POOPEE Dashboard</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                      activeSection === item.id 
                        ? "bg-gray-700 text-white font-medium" 
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">💩 POOPEE Dashboard</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            
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
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mr-3">
                  <IconComponent className="h-5 w-5" />
                </div>
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
