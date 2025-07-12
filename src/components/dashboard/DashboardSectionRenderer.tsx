import { DashboardSection } from "@/pages/Dashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardOverview } from "./sections/DashboardOverview";
import { ProfileSection } from "./sections/ProfileSection";
import { FlappyHipposSection } from "./sections/FlappyHipposSection";
import { FallingLogsSection } from "./sections/FallingLogsSection";
import { PoopeeCrushSection } from "./sections/PoopeeCrushSection";
import { LeaderboardSection } from "./sections/LeaderboardSection";
import { DocumentsSection } from "./sections/DocumentsSection";
import { WalletsSection } from "./sections/WalletsSection";
import { StakingSection } from "./sections/StakingSection";
import { SocialSection } from "./sections/SocialSection";
import { PortfolioSection } from "./sections/PortfolioSection";
import { RewardsSection } from "./sections/RewardsSection";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { FreeToolsSection } from "./sections/FreeToolsSection";
import { NewsUpdatesSection } from "./sections/NewsUpdatesSection";

interface DashboardSectionRendererProps {
  activeSection: DashboardSection;
  user: UnifiedUser;
  onSectionChange: (section: DashboardSection) => void;
}

export const DashboardSectionRenderer = ({ activeSection, user, onSectionChange }: DashboardSectionRendererProps) => {
  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <DashboardOverview user={user} onSectionChange={onSectionChange} />;
      case "profile":
        return <ProfileSection user={user} />;
      case "flappy-hippos":
        return <FlappyHipposSection user={user} />;
      case "falling-logs":
        return <FallingLogsSection user={user} />;
      case "poopee-crush":
        return <PoopeeCrushSection user={user} />;
      case "leaderboard":
        return <LeaderboardSection user={user} />;
      case "documents":
        return <DocumentsSection user={user} />;
      case "wallets":
        return <WalletsSection user={user} />;
      case "staking":
        return <StakingSection user={user} />;
      case "social":
        return <SocialSection user={user} />;
      case "portfolio":
        return <PortfolioSection user={user} />;
      case "rewards":
        return <RewardsSection user={user} />;
      case "free-tools":
        return <FreeToolsSection user={user} />;
      case "news-updates":
        return <NewsUpdatesSection user={user} />;
      default:
        return <DashboardOverview user={user} onSectionChange={onSectionChange} />;
    }
  };

  return (
    <ErrorBoundary>
      {renderSection()}
    </ErrorBoundary>
  );
};
