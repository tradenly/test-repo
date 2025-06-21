
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

export const useStakingData = (user: UnifiedUser) => {
  const { data: pools, isLoading: poolsLoading, error: poolsError } = useQuery({
    queryKey: ["stakingPools"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("staking_pools")
          .select("*")
          .eq("is_active", true)
          .order("apy_percentage", { ascending: false });
        
        if (error) {
          console.error("Pools fetch error:", error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Failed to fetch staking pools:", error);
        throw error;
      }
    },
  });

  const { data: userStakes, isLoading: stakesLoading, error: stakesError } = useQuery({
    queryKey: ["userStakes", user.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("user_stakes")
          .select(`
            *,
            staking_pools(name, apy_percentage, token_symbol)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Stakes fetch error:", error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error("Failed to fetch user stakes:", error);
        throw error;
      }
    },
  });

  return {
    pools,
    userStakes,
    isLoading: poolsLoading || stakesLoading,
    hasError: poolsError || stakesError
  };
};
