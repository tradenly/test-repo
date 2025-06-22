
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useDashboardData } from "./overview/useDashboardData";
import { DashboardStats } from "./overview/DashboardStats";
import { DashboardActivity } from "./overview/DashboardActivity";
import { DashboardQuickActions } from "./overview/DashboardQuickActions";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardOverviewProps {
  user: UnifiedUser;
}

export const DashboardOverview = ({ user }: DashboardOverviewProps) => {
  const { stakes, rewards, wallets, totalStaked, totalRewards } = useDashboardData(user);
  const isMobile = useIsMobile();

  return (
    <div className={`space-y-6 md:space-y-8 ${isMobile ? "bg-black text-white" : ""}`}>
      <div>
        <h1 className={`font-bold text-white mb-2 ${
          isMobile ? "text-2xl" : "text-3xl"
        }`}>
          Welcome back! 💩
        </h1>
        <p className="text-gray-400">
          Here's your POOPEE dashboard overview
        </p>
      </div>

      <DashboardStats
        totalStaked={totalStaked}
        totalRewards={totalRewards}
        stakesCount={stakes?.length || 0}
        rewardsCount={rewards?.length || 0}
        walletsCount={wallets?.length || 0}
      />

      <div className={`grid gap-6 ${
        isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
      }`}>
        <DashboardActivity user={user} stakes={stakes} />
        <DashboardQuickActions totalRewards={totalRewards} />
      </div>
    </div>
  );
};
