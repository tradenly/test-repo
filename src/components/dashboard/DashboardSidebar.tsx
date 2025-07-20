
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
  PieChart
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
    { id: "overview" as DashboardSection, label: "Overview", icon: LayoutDashboard, isIconComponent: true },
    { id: "profile" as DashboardSection, label: "Profile", icon: User, isIconComponent: true },
    { id: "flappy-hippos" as DashboardSection, label: "Flappy Hippos", icon: Gamepad2, isIconComponent: true },
    { id: "falling-logs" as DashboardSection, label: "Falling Logs", icon: TreePine, isIconComponent: true },
    { id: "poopee-crush" as DashboardSection, label: "POOPEE Crush", icon: "💩", isIconComponent: false },
    { id: "miss-poopee-man" as DashboardSection, label: "Miss POOPEE-Man", icon: "👻", isIconComponent: false },
    { id: "leaderboard" as DashboardSection, label: "Leaderboard", icon: Trophy, isIconComponent: true },
    { id: "documents" as DashboardSection, label: "Documents", icon: FileText, isIconComponent: true },
    { id: "wallets" as DashboardSection, label: "Wallets", icon: Wallet, isIconComponent: true },
    { id: "staking" as DashboardSection, label: "Staking", icon: PiggyBank, isIconComponent: true },
    { id: "tokenomics" as DashboardSection, label: "Tokenomics", icon: PieChart, isIconComponent: true },
    { id: "social" as DashboardSection, label: "Social", icon: Users, isIconComponent: true },
    { id: "portfolio" as DashboardSection, label: "Portfolio", icon: TrendingUp, isIconComponent: true },
    { id: "rewards" as DashboardSection, label: "Rewards", icon: Gift, isIconComponent: true },
    { id: "free-tools" as DashboardSection, label: "Free Tools", icon: Wrench, isIconComponent: true },
    { id: "news-updates" as DashboardSection, label: "News & Updates", icon: Newspaper, isIconComponent: true },
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
        
        {/* Mobile Menu - Reduced width for better UX */}
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
                const IconComponent = item.isIconComponent ? item.icon : null;
                
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
                    {item.isIconComponent && IconComponent ? (
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <span className="text-base flex-shrink-0">{item.icon as string}</span>
                    )}
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
