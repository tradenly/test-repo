
import { User } from "@supabase/supabase-js";
import { DashboardSection } from "@/pages/Dashboard";
import { DashboardOverview } from "./sections/DashboardOverview";
import { ProfileSection } from "./sections/ProfileSection";
import { WalletsSection } from "./sections/WalletsSection";
import { StakingSection } from "./sections/StakingSection";
import { SocialSection } from "./sections/SocialSection";
import { PortfolioSection } from "./sections/PortfolioSection";
import { RewardsSection } from "./sections/RewardsSection";

interface DashboardContentProps {
  activeSection: DashboardSection;
  user: User;
}

export const DashboardContent = ({ activeSection, user }: DashboardContentProps) => {
  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <DashboardOverview user={user} />;
      case "profile":
        return <ProfileSection user={user} />;
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
    <div className="max-w-6xl mx-auto">
      {renderSection()}
    </div>
  );
};
