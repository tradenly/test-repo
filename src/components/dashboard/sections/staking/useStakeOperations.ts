
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

export const useStakeOperations = (user: UnifiedUser) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createStakeMutation = useMutation({
    mutationFn: async ({ poolId, amount }: { poolId: string; amount: string }) => {
      const { error } = await supabase
        .from("user_stakes")
        .insert({
          user_id: user.id,
          pool_id: poolId,
          amount: parseFloat(amount),
          status: "active",
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStakes", user.id] });
      toast({
        title: "Stake created",
        description: "Your tokens have been successfully staked.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create stake. Please try again.",
        variant: "destructive",
      });
      console.error("Stake creation error:", error);
    },
  });

  return {
    createStakeMutation
  };
};
