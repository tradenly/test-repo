
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gift, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface RewardsSectionProps {
  user: UnifiedUser;
}

export const RewardsSection = ({ user }: RewardsSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rewards, isLoading, error } = useQuery({
    queryKey: ["votingRewards", user.id],
    queryFn: async () => {
      if (user.authType !== 'supabase') {
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from("voting_rewards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Rewards fetch error:", error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Failed to fetch rewards:", error);
        throw error;
      }
    },
    enabled: user.authType === 'supabase',
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const { error } = await supabase
        .from("voting_rewards")
        .update({
          claimed: true,
          claimed_at: new Date().toISOString(),
        })
        .eq("id", rewardId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["votingRewards", user.id] });
      toast({
        title: "Reward claimed",
        description: "Your reward has been successfully claimed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to claim reward. Please try again.",
        variant: "destructive",
      });
      console.error("Claim reward error:", error);
    },
  });

  const unclaimedRewards = rewards?.filter(reward => !reward.claimed) || [];
  const claimedRewards = rewards?.filter(reward => reward.claimed) || [];
  const totalUnclaimed = unclaimedRewards.reduce((sum, reward) => {
    const amount = reward.reward_amount ? parseFloat(reward.reward_amount.toString()) : 0;
    return sum + amount;
  }, 0);
  const totalClaimed = claimedRewards.reduce((sum, reward) => {
    const amount = reward.reward_amount ? parseFloat(reward.reward_amount.toString()) : 0;
    return sum + amount;
  }, 0);

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
              ? "Track and claim your voting rewards" 
              : "Rewards tracking is currently available for email users only"
            }
          </p>
        </div>
        {user.authType === 'supabase' && unclaimedRewards.length > 0 && (
          <Button
            onClick={() => {
              unclaimedRewards.forEach(reward => 
                claimRewardMutation.mutate(reward.id)
              );
            }}
            disabled={claimRewardMutation.isPending}
            className="bg-green-700 hover:bg-green-600"
          >
            <Gift className="mr-2 h-4 w-4" />
            Claim All ({unclaimedRewards.length})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Unclaimed Rewards
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalUnclaimed.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              {unclaimedRewards.length} pending rewards
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Claimed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalClaimed.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              {claimedRewards.length} claimed rewards
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Earned
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(totalUnclaimed + totalClaimed).toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              All time earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {user.authType === 'supabase' && unclaimedRewards.length > 0 && (
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
                      {reward.reward_amount ? parseFloat(reward.reward_amount.toString()).toFixed(4) : "0.0000"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Voting reward
                    </p>
                    <p className="text-xs text-gray-500">
                      Earned: {reward.created_at ? new Date(reward.created_at).toLocaleDateString() : "Unknown"}
                    </p>
                  </div>
                  <Button
                    onClick={() => claimRewardMutation.mutate(reward.id)}
                    disabled={claimRewardMutation.isPending}
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
      )}

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
                        {reward.reward_amount ? parseFloat(reward.reward_amount.toString()).toFixed(4) : "0.0000"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Voting reward
                      </p>
                      <p className="text-xs text-gray-500">
                        {reward.created_at ? new Date(reward.created_at).toLocaleDateString() : "Unknown date"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${reward.claimed ? 'text-green-400' : 'text-orange-400'}`}>
                      {reward.claimed ? 'Claimed' : 'Pending'}
                    </div>
                    {reward.claimed && reward.claimed_at && (
                      <div className="text-xs text-gray-500">
                        {new Date(reward.claimed_at).toLocaleDateString()}
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
                  ? "Start participating in voting to earn rewards"
                  : "Sign up with email to track rewards"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
