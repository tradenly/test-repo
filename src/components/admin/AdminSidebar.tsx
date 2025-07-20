import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Activity, 
  DollarSign, 
  BarChart3, 
  Wrench,
  Gamepad2,
  X,
  MessageCircle
} from "lucide-react";
import { AdminSection } from "@/pages/AdminPanel";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar = ({ 
  activeSection, 
  onSectionChange, 
  isOpen = false, 
  onClose 
}: AdminSidebarProps) => {
  const isMobile = useIsMobile();
  
  const menuItems = [
    { id: "overview" as AdminSection, label: "Overview", icon: LayoutDashboard },
    { id: "users" as AdminSection, label: "User Management", icon: Users },
    { id: "credits" as AdminSection, label: "Credit Management", icon: CreditCard },
    { id: "activity" as AdminSection, label: "Activity Monitor", icon: Activity },
    { id: "payouts" as AdminSection, label: "Payout Management", icon: DollarSign },
    { id: "analytics" as AdminSection, label: "Analytics", icon: BarChart3 },
    { id: "requests" as AdminSection, label: "Tool Requests", icon: Wrench },
    { id: "games" as AdminSection, label: "Game Management", icon: Gamepad2 },
    { id: "contact" as AdminSection, label: "Contact Messages", icon: MessageCircle },
  ];

  const handleMenuClick = (sectionId: AdminSection) => {
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
              <h2 className="text-lg font-bold text-white">🏛️ Admin Panel</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item) => {
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
                    <item.icon className="h-4 w-4 flex-shrink-0" />
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
        <h2 className="text-xl font-bold text-white mb-6">🏛️ Admin Panel</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
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
              <item.icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </aside>
  );
};
