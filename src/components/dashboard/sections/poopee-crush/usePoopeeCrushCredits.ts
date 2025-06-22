
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePoopeeCrushCredits = (userId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const spendCredits = useMutation({
    mutationFn: async ({ amount, description, gameSessionId }: { 
      amount: number; 
      description: string; 
      gameSessionId?: string;
    }) => {
      console.log(`💰 [POOPEE Crush] Spending ${amount} credits for: ${description}`);
      
      // Check current balance first
      const { data: currentCredits, error: fetchError } = await (supabase as any)
        .from("user_credits")
        .select("balance")
        .eq("user_id", userId)
        .single();
      
      if (fetchError) {
        console.error("❌ [POOPEE Crush] Failed to fetch current credits:", fetchError);
        throw new Error("Failed to check credit balance");
      }
      
      if (currentCredits.balance < amount) {
        const shortfall = amount - currentCredits.balance;
        throw new Error(`Insufficient credits! You need ${amount} credits but only have ${currentCredits.balance.toFixed(2)}. You're ${shortfall.toFixed(2)} credits short.`);
      }
      
      const newBalance = currentCredits.balance - amount;
      
      // Create transaction record first
      const { data: transaction, error: transactionError } = await (supabase as any)
        .from("credit_transactions")
        .insert({
          user_id: userId,
          transaction_type: 'spent',
          amount: -amount,
          status: 'completed',
          description: description,
          reference_id: gameSessionId,
          completed_at: new Date().toISOString(),
          metadata: {
            game_type: 'poopee_crush',
            action: description
          }
        })
        .select()
        .single();
      
      if (transactionError) {
        console.error("❌ [POOPEE Crush] Failed to create transaction:", transactionError);
        throw new Error("Failed to record transaction");
      }
      
      // Update user balance
      const { data: updatedCredits, error: updateError } = await (supabase as any)
        .from("user_credits")
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .select()
        .single();
      
      if (updateError) {
        console.error("❌ [POOPEE Crush] Failed to update credits:", updateError);
        throw new Error("Failed to update credit balance");
      }
      
      console.log(`✅ [POOPEE Crush] Successfully spent ${amount} credits. New balance: ${updatedCredits.balance}`);
      return { 
        newBalance: updatedCredits.balance, 
        transaction,
        amountSpent: amount,
        description 
      };
    },
    onMutate: async (variables) => {
      // Optimistically update the UI for immediate feedback
      const queryKey = ["user-credits", userId];
      await queryClient.cancelQueries({ queryKey });
      
      const previousCredits = queryClient.getQueryData(queryKey);
      
      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (old) {
          return { ...old, balance: old.balance - variables.amount };
        }
        return old;
      });
      
      return { previousCredits };
    },
    onSuccess: (data, variables, context) => {
      // Update cache with actual server response
      queryClient.setQueryData(["user-credits", userId], (old: any) => {
        if (old) {
          return { ...old, balance: data.newBalance };
        }
        return old;
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["credit-transactions", userId] });
      
      console.log(`💰 [POOPEE Crush] Credits spent successfully: ${data.description}`);
      
      toast({
        title: "Credits Used",
        description: `${data.description} - ${data.amountSpent} credits spent`,
      });
    },
    onError: (error: any, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousCredits) {
        queryClient.setQueryData(["user-credits", userId], context.previousCredits);
      }
      
      console.error("💥 [POOPEE Crush] Failed to spend credits:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to spend credits",
        variant: "destructive",
      });
    }
  });

  const checkCanAfford = async (amount: number): Promise<boolean> => {
    try {
      const { data: credits, error } = await (supabase as any)
        .from("user_credits")
        .select("balance")
        .eq("user_id", userId)
        .single();
      
      if (error) {
        console.error("❌ [POOPEE Crush] Failed to check credits:", error);
        return false;
      }
      
      const canAfford = credits.balance >= amount;
      console.log(`💰 [POOPEE Crush] Can afford ${amount} credits: ${canAfford} (current: ${credits.balance})`);
      return canAfford;
    } catch (error) {
      console.error("❌ [POOPEE Crush] Error checking credit balance:", error);
      return false;
    }
  };

  return {
    spendCredits,
    checkCanAfford,
    isSpending: spendCredits.isPending
  };
};
