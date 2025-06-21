
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

export const useRewardsData = (user: UnifiedUser) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rewards, isLoading, error } = useQuery({
    queryKey: ["stakingRewards", user.id],
    queryFn: async () => {
      // Only fetch rewards if user has Supabase auth
      if (user.authType !== 'supabase') {
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from("staking_rewards")
          .select(`
            *,
            user_stakes(
              staking_pools(name, token_symbol)
            )
          `)
          .eq("user_id", user.id)
          .order("reward_date", { ascending: false });
        
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
        .from("staking_rewards")
        .update({
          claimed: true,
          claim_date: new Date().toISOString(),
        })
        .eq("id", rewardId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakingRewards", user.id] });
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

  const claimAllRewards = async () => {
    try {
      const claimPromises = unclaimedRewards.map(reward => 
        claimRewardMutation.mutateAsync(reward.id)
      );
      await Promise.all(claimPromises);
    } catch (error) {
      console.error("Error claiming all rewards:", error);
    }
  };

  return {
    rewards,
    isLoading,
    error,
    unclaimedRewards,
    claimedRewards,
    totalUnclaimed,
    totalClaimed,
    claimRewardMutation,
    claimAllRewards,
  };
};
