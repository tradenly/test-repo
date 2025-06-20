
import { DashboardSection } from "@/pages/Dashboard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardOverview } from "./sections/DashboardOverview";
import { ProfileSection } from "./sections/ProfileSection";
import { WalletsSection } from "./sections/WalletsSection";
import { StakingSection } from "./sections/StakingSection";
import { SocialSection } from "./sections/SocialSection";
import { PortfolioSection } from "./sections/PortfolioSection";
import { RewardsSection } from "./sections/RewardsSection";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface DashboardContentProps {
  activeSection: DashboardSection;
  user: UnifiedUser;
}

export const DashboardContent = ({ activeSection, user }: DashboardContentProps) => {
  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <ErrorBoundary>
            <DashboardOverview user={user} />
          </ErrorBoundary>
        );
      case "profile":
        return (
          <ErrorBoundary>
            <ProfileSection user={user} />
          </ErrorBoundary>
        );
      case "wallets":
        return (
          <ErrorBoundary>
            <WalletsSection user={user} />
          </ErrorBoundary>
        );
      case "staking":
        return (
          <ErrorBoundary>
            <StakingSection user={user} />
          </ErrorBoundary>
        );
      case "social":
        return (
          <ErrorBoundary>
            <SocialSection user={user} />
          </ErrorBoundary>
        );
      case "portfolio":
        return (
          <ErrorBoundary>
            <PortfolioSection user={user} />
          </ErrorBoundary>
        );
      case "rewards":
        return (
          <ErrorBoundary>
            <RewardsSection user={user} />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <DashboardOverview user={user} />
          </ErrorBoundary>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {renderSection()}
    </div>
  );
};
