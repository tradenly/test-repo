
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useStakingData } from "./staking/useStakingData";
import { StakeCreationForm } from "./staking/StakeCreationForm";
import { AvailablePoolsList } from "./staking/AvailablePoolsList";
import { ActiveStakesList } from "./staking/ActiveStakesList";

interface StakingSectionProps {
  user: UnifiedUser;
}

export const StakingSection = ({ user }: StakingSectionProps) => {
  const { pools, userStakes, isLoading, hasError } = useStakingData(user);

  if (hasError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Staking</h1>
          <p className="text-red-400">Failed to load staking data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Staking</h1>
          <p className="text-gray-400">Loading staking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Staking</h1>
        <p className="text-gray-400">Stake your POOPEE tokens and NFTs to earn rewards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StakeCreationForm user={user} pools={pools} />
        <AvailablePoolsList pools={pools} />
      </div>

      <ActiveStakesList userStakes={userStakes} />
    </div>
  );
};
