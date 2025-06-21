
import { DocumentationSection } from "../DocumentsSection";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { PlatformOverviewDoc } from "./sections/PlatformOverviewDoc";
import { NFTCollectionDoc } from "./sections/NFTCollectionDoc";
import { MemeCoinDoc } from "./sections/MemeCoinDoc";
import { FlappyHipposGameDoc } from "./sections/FlappyHipposGameDoc";
import { WalletsDoc } from "./sections/WalletsDoc";
import { StakingDoc } from "./sections/StakingDoc";
import { SocialDoc } from "./sections/SocialDoc";
import { PortfolioDoc } from "./sections/PortfolioDoc";

interface DocumentationContentProps {
  activeSection: DocumentationSection;
  user: UnifiedUser;
}

export const DocumentationContent = ({ activeSection, user }: DocumentationContentProps) => {
  const renderDocumentation = () => {
    switch (activeSection) {
      case "overview":
        return <PlatformOverviewDoc />;
      case "nfts":
        return <NFTCollectionDoc />;
      case "meme-coin":
        return <MemeCoinDoc />;
      case "flappy-hippos-game":
        return <FlappyHipposGameDoc />;
      case "wallets":
        return <WalletsDoc />;
      case "staking":
        return <StakingDoc />;
      case "social":
        return <SocialDoc />;
      case "portfolio":
        return <PortfolioDoc />;
      default:
        return <PlatformOverviewDoc />;
    }
  };

  return (
    <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
      {renderDocumentation()}
    </div>
  );
};
