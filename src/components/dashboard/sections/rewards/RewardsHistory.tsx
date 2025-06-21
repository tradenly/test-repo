
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, CheckCircle, Clock } from "lucide-react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface RewardsHistoryProps {
  rewards: any[] | undefined;
  user: UnifiedUser;
}

export const RewardsHistory = ({ rewards, user }: RewardsHistoryProps) => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Reward History</CardTitle>
      </CardHeader>
      <CardContent>
        {rewards && rewards.length > 0 ? (
          <div className="space-y-4">
            {rewards.slice(0, 10).map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${reward.claimed ? 'bg-green-600/20' : 'bg-orange-600/20'}`}>
                    {reward.claimed ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      {reward.reward_amount ? parseFloat(reward.reward_amount.toString()).toFixed(4) : "0.0000"} POOPEE
                    </h3>
                    <p className="text-sm text-gray-400">
                      {reward.user_stakes?.staking_pools?.name || "Unknown Pool"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {reward.reward_date ? new Date(reward.reward_date).toLocaleDateString() : "Unknown date"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${reward.claimed ? 'text-green-400' : 'text-orange-400'}`}>
                    {reward.claimed ? 'Claimed' : 'Pending'}
                  </div>
                  {reward.claimed && reward.claim_date && (
                    <div className="text-xs text-gray-500">
                      {new Date(reward.claim_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {rewards.length > 10 && (
              <p className="text-sm text-gray-400 text-center">
                +{rewards.length - 10} more rewards in history
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">
              {user.authType === 'supabase' 
                ? "No rewards yet" 
                : "Rewards available for email users"
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {user.authType === 'supabase'
                ? "Start staking to earn rewards"
                : "Sign up with email to track rewards"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
