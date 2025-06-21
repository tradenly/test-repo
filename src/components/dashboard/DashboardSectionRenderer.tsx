
import { DashboardSection } from "@/pages/Dashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardOverview } from "./sections/DashboardOverview";
import { ProfileSection } from "./sections/ProfileSection";
import { FlappyHipposSection } from "./sections/FlappyHipposSection";
import { LeaderboardSection } from "./sections/LeaderboardSection";
import { WalletsSection } from "./sections/WalletsSection";
import { StakingSection } from "./sections/StakingSection";
import { SocialSection } from "./sections/SocialSection";
import { PortfolioSection } from "./sections/PortfolioSection";
import { RewardsSection } from "./sections/RewardsSection";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface DashboardSectionRendererProps {
  activeSection: DashboardSection;
  user: UnifiedUser;
}

export const DashboardSectionRenderer = ({ activeSection, user }: DashboardSectionRendererProps) => {
  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <DashboardOverview user={user} />;
      case "profile":
        return <ProfileSection user={user} />;
      case "flappy-hippos":
        return <FlappyHipposSection user={user} />;
      case "leaderboard":
        return <LeaderboardSection user={user} />;
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
      default:
        return <DashboardOverview user={user} />;
    }
  };

  return (
    <ErrorBoundary>
      {renderSection()}
    </ErrorBoundary>
  );
};
