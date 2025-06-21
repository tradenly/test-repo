
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

export const useDashboardData = (user: UnifiedUser) => {
  const { data: stakes } = useQuery({
    queryKey: ["userStakes", user.id],
    queryFn: async () => {
      if (user.authType !== 'supabase') {
        return [];
      }
      
      const { data, error } = await supabase
        .from("user_stakes")
        .select(`
          *,
          staking_pools(name, apy_percentage)
        `)
        .eq("user_id", user.id)
        .eq("status", "active");
      
      if (error) throw error;
      return data || [];
    },
    enabled: user.authType === 'supabase',
  });

  const { data: rewards } = useQuery({
    queryKey: ["userRewards", user.id],
    queryFn: async () => {
      if (user.authType !== 'supabase') {
        return [];
      }
      
      const { data, error } = await supabase
        .from("staking_rewards")
        .select("*")
        .eq("user_id", user.id)
        .eq("claimed", false);
      
      if (error) throw error;
      return data || [];
    },
    enabled: user.authType === 'supabase',
  });

  const { data: wallets } = useQuery({
    queryKey: ["userWallets", user.id],
    queryFn: async () => {
      if (user.authType !== 'supabase') {
        return [];
      }
      
      const { data, error } = await supabase
        .from("user_wallets")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: user.authType === 'supabase',
  });

  const totalStaked = stakes?.reduce((sum, stake) => sum + parseFloat(stake.amount.toString()), 0) || 0;
  const totalRewards = rewards?.reduce((sum, reward) => sum + parseFloat(reward.reward_amount.toString()), 0) || 0;

  return {
    stakes,
    rewards,
    wallets,
    totalStaked,
    totalRewards,
  };
};
