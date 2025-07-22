
import { DashboardSection } from "@/pages/Dashboard";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { DashboardOverview } from "./sections/DashboardOverview";
import { ProfileSection } from "./sections/ProfileSection";
import { FlappyHipposSection } from "./sections/FlappyHipposSection";
import { FallingLogsSection } from "./sections/FallingLogsSection";
import { PoopeeCrushSection } from "./sections/PoopeeCrushSection";
import { MissPoopeeManSection } from "./sections/MissPoopeeManSection";
import { SpaceInvadersSection } from "./sections/SpaceInvadersSection";
import { LeaderboardSection } from "./sections/LeaderboardSection";
import { DocumentsSection } from "./sections/DocumentsSection";
import { WalletsSection } from "./sections/WalletsSection";
import { StakingSection } from "./sections/StakingSection";
import { SocialSection } from "./sections/SocialSection";
import { PortfolioSection } from "./sections/PortfolioSection";
import { RewardsSection } from "./sections/RewardsSection";
import { FreeToolsSection } from "./sections/FreeToolsSection";
import { NewsUpdatesSection } from "./sections/NewsUpdatesSection";
import { TokenomicsSection } from "./sections/TokenomicsSection";

interface DashboardSectionRendererProps {
  activeSection: DashboardSection;
  user: UnifiedUser;
  onSectionChange: (section: DashboardSection) => void;
}

export const DashboardSectionRenderer = ({ activeSection, user, onSectionChange }: DashboardSectionRendererProps) => {
  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <DashboardOverview />;
      case "profile":
        return <ProfileSection />;
      case "flappy-hippos":
        return <FlappyHipposSection />;
      case "falling-logs":
        return <FallingLogsSection />;
      case "poopee-crush":
        return <PoopeeCrushSection />;
      case "miss-poopee-man":
        return <MissPoopeeManSection />;
      case "space-invaders":
        return <SpaceInvadersSection />;
      case "leaderboard":
        return <LeaderboardSection />;
      case "documents":
        return <DocumentsSection />;
      case "wallets":
        return <WalletsSection />;
      case "staking":
        return <StakingSection />;
      case "social":
        return <SocialSection />;
      case "portfolio":
        return <PortfolioSection />;
      case "rewards":
        return <RewardsSection />;
      case "free-tools":
        return <FreeToolsSection />;
      case "news-updates":
        return <NewsUpdatesSection />;
      case "tokenomics":
        return <TokenomicsSection />;
      default:
        return <DashboardOverview />;
    }
  };

  return <>{renderSection()}</>;
};
