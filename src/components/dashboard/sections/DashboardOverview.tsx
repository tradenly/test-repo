
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useDashboardData } from "./overview/useDashboardData";
import { DashboardStats } from "./overview/DashboardStats";
import { DashboardActivity } from "./overview/DashboardActivity";
import { DashboardQuickActions } from "./overview/DashboardQuickActions";

interface DashboardOverviewProps {
  user: UnifiedUser;
}

export const DashboardOverview = ({ user }: DashboardOverviewProps) => {
  const { stakes, rewards, wallets, totalStaked, totalRewards } = useDashboardData(user);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardActivity user={user} stakes={stakes} />
        <DashboardQuickActions totalRewards={totalRewards} />
      </div>
    </div>
  );
};
