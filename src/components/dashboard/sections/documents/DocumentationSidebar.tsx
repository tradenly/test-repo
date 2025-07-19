
import { Button } from "@/components/ui/button";
import { 
  Book, 
  Gamepad2,
  Wallet,
  PiggyBank,
  Users,
  TrendingUp,
  Coins,
  Image,
  Puzzle,
  Grid3X3,
  Ghost
} from "lucide-react";
import { DocumentationSection } from "../DocumentsSection";

interface DocumentationSidebarProps {
  activeSection: DocumentationSection;
  onSectionChange: (section: DocumentationSection) => void;
}

export const DocumentationSidebar = ({ activeSection, onSectionChange }: DocumentationSidebarProps) => {
  const docSections = [
    { id: "overview" as DocumentationSection, label: "Platform Overview", icon: Book },
    { id: "nfts" as DocumentationSection, label: "NFT Collection", icon: Image },
    { id: "meme-coin" as DocumentationSection, label: "Meme Coin", icon: Coins },
    { id: "flappy-hippos-game" as DocumentationSection, label: "Flappy Hippos Game", icon: Gamepad2 },
    { id: "poopee-crush-game" as DocumentationSection, label: "POOPEE Crush Game", icon: Grid3X3 },
    { id: "falling-logs-game" as DocumentationSection, label: "Falling Logs Game", icon: Puzzle },
    { id: "miss-poopee-man" as DocumentationSection, label: "Miss POOPEE-Man", icon: Ghost },
    { id: "wallets" as DocumentationSection, label: "Wallets & Credits", icon: Wallet },
    { id: "staking" as DocumentationSection, label: "Staking", icon: PiggyBank },
    { id: "social" as DocumentationSection, label: "Social Features", icon: Users },
    { id: "portfolio" as DocumentationSection, label: "Portfolio", icon: TrendingUp },
  ];

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-bold text-white mb-4">Documentation Sections</h3>
      <nav className="space-y-2">
        {docSections.map((section) => {
          const Icon = section.icon;
          return (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "secondary" : "ghost"}
              className={`w-full justify-start text-left text-sm ${
                activeSection === section.id 
                  ? "bg-gray-700 text-white" 
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}
              onClick={() => onSectionChange(section.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {section.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};
