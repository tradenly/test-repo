
import { DashboardStats } from "./overview/DashboardStats";
import { DashboardActivity } from "./overview/DashboardActivity";
import { DashboardQuickActions } from "./overview/DashboardQuickActions";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useDashboardData } from "./overview/useDashboardData";
import { SkeletonStats, SkeletonCard } from "@/components/ui/enhanced-skeleton";

interface DashboardOverviewProps {
  user: UnifiedUser;
}

export const DashboardOverview = ({ user }: DashboardOverviewProps) => {
  const { totalStaked, totalRewards, stakes, rewards, wallets, isLoading } = useDashboardData(user);
  
  // Get user display name from different possible sources
  const getUserDisplayName = () => {
    if (user.supabaseUser?.user_metadata?.full_name) {
      return user.supabaseUser.user_metadata.full_name;
    }
    if (user.supabaseUser?.user_metadata?.name) {
      return user.supabaseUser.user_metadata.name;
    }
    if (user.email) {
      return user.email;
    }
    return "User";
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {getUserDisplayName()}!
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your account today.
          </p>
        </div>
        
        <SkeletonStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {getUserDisplayName()}!
        </h1>
        <p className="text-gray-400">
          Here's what's happening with your account today.
        </p>
      </div>
      
      <DashboardStats 
        totalStaked={totalStaked}
        totalRewards={totalRewards}
        stakesCount={stakes?.length || 0}
        rewardsCount={rewards?.length || 0}
        walletsCount={wallets?.length || 0}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardActivity user={user} />
        <DashboardQuickActions totalRewards={totalRewards} />
      </div>
    </div>
  );
};
