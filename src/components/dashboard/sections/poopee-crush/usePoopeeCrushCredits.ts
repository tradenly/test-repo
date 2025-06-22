
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePoopeeCrushCredits = (userId: string) => {
  const queryClient = useQueryClient();

  const spendCredits = useMutation({
    mutationFn: async ({ amount, description, gameSessionId }: { amount: number; description: string; gameSessionId?: string }) => {
      console.log(`💰 Spending ${amount} credits for: ${description}`);
      
      // Check current balance first
      const { data: currentCredits, error: fetchError } = await (supabase as any)
        .from("user_credits")
        .select("balance")
        .eq("user_id", userId)
        .single();
      
      if (fetchError) {
        console.error("Failed to fetch current credits:", fetchError);
        throw new Error("Failed to check credit balance");
      }
      
      if (currentCredits.balance < amount) {
        throw new Error("Insufficient credits");
      }
      
      // Create transaction record
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
        console.error("Failed to create transaction:", transactionError);
        throw new Error("Failed to record transaction");
      }
      
      // Update user balance
      const { data: updatedCredits, error: updateError } = await (supabase as any)
        .from("user_credits")
        .update({ 
          balance: currentCredits.balance - amount,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .select()
        .single();
      
      if (updateError) {
        console.error("Failed to update credits:", updateError);
        throw new Error("Failed to update credit balance");
      }
      
      console.log(`✅ Successfully spent ${amount} credits. New balance: ${updatedCredits.balance}`);
      return { newBalance: updatedCredits.balance, transaction };
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch credit queries
      queryClient.invalidateQueries({ queryKey: ["user-credits", userId] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions", userId] });
      
      console.log(`💰 Credits spent successfully: ${variables.description}`);
    },
    onError: (error: any) => {
      console.error("Failed to spend credits:", error);
      toast.error(error.message || "Failed to spend credits");
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
        console.error("Failed to check credits:", error);
        return false;
      }
      
      return credits.balance >= amount;
    } catch (error) {
      console.error("Error checking credit balance:", error);
      return false;
    }
  };

  return {
    spendCredits,
    checkCanAfford,
    isSpending: spendCredits.isPending
  };
};
