
import { useState } from "react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { DocumentationContent } from "./documents/DocumentationContent";
import { DocumentationSidebar } from "./documents/DocumentationSidebar";

export type DocumentationSection = 
  | "overview"
  | "nfts" 
  | "meme-coin"
  | "flappy-hippos-game"
  | "poopee-crush-game"
  | "falling-logs-game"
  | "wallets"
  | "staking"
  | "social"
  | "portfolio";

interface DocumentsSectionProps {
  user: UnifiedUser;
}

export const DocumentsSection = ({ user }: DocumentsSectionProps) => {
  const [activeDocSection, setActiveDocSection] = useState<DocumentationSection>("overview");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">📚 Documentation</h1>
        <p className="text-gray-400">Complete guide to the POOPEE platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <DocumentationSidebar 
            activeSection={activeDocSection}
            onSectionChange={setActiveDocSection}
          />
        </div>
        
        <div className="lg:col-span-3">
          <DocumentationContent 
            activeSection={activeDocSection}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};
