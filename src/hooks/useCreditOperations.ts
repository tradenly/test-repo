
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSpendCredits = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ userId, amount, description }: {
      userId: string;
      amount: number;
      description: string;
    }) => {
      console.log("💰 Spending credits:", { userId, amount, description });
      
      // Start a transaction
      const { data: currentCredits, error: fetchError } = await (supabase as any)
        .from("user_credits")
        .select("balance")
        .eq("user_id", userId)
        .single();
      
      if (fetchError) {
        console.error("❌ Error fetching current credits:", fetchError);
        throw new Error("Failed to check credit balance");
      }
      
      if (currentCredits.balance < amount) {
        throw new Error(`Insufficient credits. You need ${amount} credits but only have ${currentCredits.balance.toFixed(2)}`);
      }
      
      const newBalance = currentCredits.balance - amount;
      
      // Update balance
      const { error: updateError } = await (supabase as any)
        .from("user_credits")
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);
      
      if (updateError) {
        console.error("❌ Error updating credits:", updateError);
        throw new Error("Failed to update credit balance");
      }
      
      // Record transaction
      const { error: transactionError } = await (supabase as any)
        .from("credit_transactions")
        .insert([{
          user_id: userId,
          transaction_type: "spent",
          amount: -amount,
          description,
          status: "completed",
          completed_at: new Date().toISOString()
        }]);
      
      if (transactionError) {
        console.error("❌ Error recording transaction:", transactionError);
        throw new Error("Failed to record transaction");
      }
      
      console.log("✅ Credits spent successfully. New balance:", newBalance);
      return { newBalance, amountSpent: amount };
    },
    onSuccess: (data, variables) => {
      // Immediately update the cache for real-time feedback
      queryClient.setQueryData(["user-credits", variables.userId], (oldData: any) => {
        if (oldData) {
          return { ...oldData, balance: data.newBalance };
        }
        return oldData;
      });
      
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["user-credits", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions", variables.userId] });
      
      toast({
        title: "Credits Spent",
        description: `${variables.description} - ${data.amountSpent} credits used`,
      });
    },
    onError: (error: any, variables) => {
      console.error("💥 Failed to spend credits:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to spend credits. Please try again.",
        variant: "destructive",
      });
    }
  });
};

export const useEarnCredits = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ userId, amount, description, gameSessionId }: {
      userId: string;
      amount: number;
      description: string;
      gameSessionId?: string;
    }) => {
      console.log("💰 Earning credits:", { userId, amount, description });
      
      if (amount <= 0) {
        console.log("⚠️ Amount is 0 or negative, skipping earn operation");
        return { newBalance: 0 };
      }
      
      // Get current balance or create credits record
      let { data: currentCredits, error: fetchError } = await (supabase as any)
        .from("user_credits")
        .select("balance")
        .eq("user_id", userId)
        .single();
      
      if (fetchError && fetchError.code === 'PGRST116') {
        // Create new credits record
        const { data: newCredits, error: createError } = await (supabase as any)
          .from("user_credits")
          .insert([{ user_id: userId, balance: amount }])
          .select()
          .single();
        
        if (createError) {
          console.error("❌ Error creating credits:", createError);
          throw new Error("Failed to create credit account");
        }
        
        currentCredits = newCredits;
      } else if (fetchError) {
        console.error("❌ Error fetching current credits:", fetchError);
        throw new Error("Failed to check credit balance");
      } else {
        // Update existing balance
        const newBalance = currentCredits.balance + amount;
        
        const { error: updateError } = await (supabase as any)
          .from("user_credits")
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId);
        
        if (updateError) {
          console.error("❌ Error updating credits:", updateError);
          throw new Error("Failed to update credit balance");
        }
        
        currentCredits.balance = newBalance;
      }
      
      // Record transaction
      const { error: transactionError } = await (supabase as any)
        .from("credit_transactions")
        .insert([{
          user_id: userId,
          transaction_type: "earned",
          amount,
          description,
          status: "completed",
          completed_at: new Date().toISOString(),
          game_session_id: gameSessionId
        }]);
      
      if (transactionError) {
        console.error("❌ Error recording transaction:", transactionError);
        throw new Error("Failed to record transaction");
      }
      
      console.log("✅ Credits earned successfully. New balance:", currentCredits.balance);
      return { newBalance: currentCredits.balance, amountEarned: amount };
    },
    onSuccess: (data, variables) => {
      // Immediately update the cache for real-time feedback
      queryClient.setQueryData(["user-credits", variables.userId], (oldData: any) => {
        if (oldData) {
          return { ...oldData, balance: data.newBalance };
        }
        return oldData;
      });
      
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["user-credits", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions", variables.userId] });
      
      if (data.amountEarned > 0) {
        toast({
          title: "Credits Earned!",
          description: `${variables.description} - ${data.amountEarned} credits added`,
        });
      }
    },
    onError: (error: any, variables) => {
      console.error("💥 Failed to earn credits:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to award credits",
        variant: "destructive",
      });
    }
  });
};

// Legacy alias for backwards compatibility
export const useCreditOperations = () => {
  const spendCredits = useSpendCredits();
  const earnCredits = useEarnCredits();
  
  return {
    deductCredits: async (amount: number, description: string) => {
      // This would need a user ID - this is a compatibility shim
      throw new Error("Use useSpendCredits hook directly instead");
    },
    earnCredits: earnCredits.mutateAsync
  };
};

// New hook for checking if user can afford something
export const useCanAffordCredits = () => {
  return {
    checkCanAfford: async (userId: string, amount: number): Promise<boolean> => {
      try {
        const { data: credits, error } = await (supabase as any)
          .from("user_credits")
          .select("balance")
          .eq("user_id", userId)
          .single();
        
        if (error) {
          console.error("❌ Failed to check credits:", error);
          return false;
        }
        
        return credits.balance >= amount;
      } catch (error) {
        console.error("❌ Error checking credit balance:", error);
        return false;
      }
    }
  };
};
