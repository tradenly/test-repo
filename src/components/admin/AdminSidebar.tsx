
import { cn } from "@/lib/utils";
import { AdminSection } from "@/pages/AdminPanel";
import { 
  Users, 
  Coins, 
  Activity, 
  CreditCard, 
  BarChart3, 
  Settings,
  X,
  MessageSquare,
  Gamepad2,
  Bot,
  TrendingUp
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const adminSections = [
  { id: "overview" as AdminSection, label: "Overview", icon: BarChart3 },
  { id: "users" as AdminSection, label: "User Management", icon: Users },
  { id: "credits" as AdminSection, label: "Credit Management", icon: Coins },
  { id: "activity" as AdminSection, label: "Activity Monitor", icon: Activity },
  { id: "payouts" as AdminSection, label: "Payout Management", icon: CreditCard },
  { id: "analytics" as AdminSection, label: "Analytics", icon: BarChart3 },
  { id: "traffic" as AdminSection, label: "Traffic Analytics", icon: TrendingUp },
  { id: "requests" as AdminSection, label: "Requests", icon: MessageSquare },
  { id: "games" as AdminSection, label: "Games", icon: Gamepad2 },
  { id: "ai-agent" as AdminSection, label: "AI Agent", icon: Bot },
  { id: "contact" as AdminSection, label: "Contact Messages", icon: MessageSquare },
];

export const AdminSidebar = ({ 
  activeSection, 
  onSectionChange, 
  isOpen = false, 
  onClose 
}: AdminSidebarProps) => {
  const isMobile = useIsMobile();

  const handleMenuClick = (sectionId: AdminSection) => {
    console.log('Admin menu item clicked:', sectionId);
    onSectionChange(sectionId);
    if (isMobile && onClose) {
      console.log('Closing admin mobile menu');
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Admin backdrop clicked, closing menu');
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
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-white">Admin Panel</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="space-y-1">
              {adminSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleMenuClick(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm",
                      activeSection === section.id
                        ? "bg-yellow-600 text-black font-medium"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </>
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
