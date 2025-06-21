
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

interface UnclaimedRewardsListProps {
  unclaimedRewards: any[];
  onClaimReward: (rewardId: string) => void;
  isClaimPending: boolean;
}

export const UnclaimedRewardsList = ({
  unclaimedRewards,
  onClaimReward,
  isClaimPending,
}: UnclaimedRewardsListProps) => {
  if (unclaimedRewards.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Gift className="h-5 w-5 text-orange-400" />
          Unclaimed Rewards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {unclaimedRewards.map((reward) => (
            <div key={reward.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <div>
                <h3 className="font-medium text-white">
                  {reward.reward_amount ? parseFloat(reward.reward_amount.toString()).toFixed(4) : "0.0000"} POOPEE
                </h3>
                <p className="text-sm text-gray-400">
                  From: {reward.user_stakes?.staking_pools?.name || "Unknown Pool"}
                </p>
                <p className="text-xs text-gray-500">
                  Earned: {reward.reward_date ? new Date(reward.reward_date).toLocaleDateString() : "Unknown"}
                </p>
              </div>
              <Button
                onClick={() => onClaimReward(reward.id)}
                disabled={isClaimPending}
                size="sm"
                className="bg-green-700 hover:bg-green-600"
              >
                Claim
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
