
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useRewardsData } from "./rewards/useRewardsData";
import { RewardsStatsCards } from "./rewards/RewardsStatsCards";
import { UnclaimedRewardsList } from "./rewards/UnclaimedRewardsList";
import { RewardsHistory } from "./rewards/RewardsHistory";

interface RewardsSectionProps {
  user: UnifiedUser;
}

export const RewardsSection = ({ user }: RewardsSectionProps) => {
  const {
    rewards,
    isLoading,
    error,
    unclaimedRewards,
    claimedRewards,
    totalUnclaimed,
    totalClaimed,
    claimRewardMutation,
    claimAllRewards,
  } = useRewardsData(user);

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Rewards</h1>
          <p className="text-red-400">Failed to load rewards data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (isLoading && user.authType === 'supabase') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Rewards</h1>
          <p className="text-gray-400">Loading rewards data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Rewards</h1>
          <p className="text-gray-400">
            {user.authType === 'supabase' 
              ? "Track and claim your staking rewards" 
              : "Rewards tracking is currently available for email users only"
            }
          </p>
        </div>
        {user.authType === 'supabase' && unclaimedRewards.length > 0 && (
          <Button
            onClick={claimAllRewards}
            disabled={claimRewardMutation.isPending}
            className="bg-green-700 hover:bg-green-600"
          >
            <Gift className="mr-2 h-4 w-4" />
            Claim All ({unclaimedRewards.length})
          </Button>
        )}
      </div>

      <RewardsStatsCards
        totalUnclaimed={totalUnclaimed}
        totalClaimed={totalClaimed}
        unclaimedCount={unclaimedRewards.length}
        claimedCount={claimedRewards.length}
      />

      {user.authType === 'supabase' && (
        <UnclaimedRewardsList
          unclaimedRewards={unclaimedRewards}
          onClaimReward={(rewardId) => claimRewardMutation.mutate(rewardId)}
          isClaimPending={claimRewardMutation.isPending}
        />
      )}

      <RewardsHistory rewards={rewards} user={user} />
    </div>
  );
};
