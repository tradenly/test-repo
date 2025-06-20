
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSpendCredits = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, amount, description }: {
      userId: string;
      amount: number;
      description: string;
    }) => {
      console.log("Spending credits:", { userId, amount, description });
      
      // Start a transaction
      const { data: currentCredits, error: fetchError } = await (supabase as any)
        .from("user_credits")
        .select("balance")
        .eq("user_id", userId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching current credits:", fetchError);
        throw fetchError;
      }
      
      if (currentCredits.balance < amount) {
        throw new Error("Insufficient credits");
      }
      
      const newBalance = currentCredits.balance - amount;
      
      // Update balance
      const { error: updateError } = await (supabase as any)
        .from("user_credits")
        .update({ balance: newBalance })
        .eq("user_id", userId);
      
      if (updateError) {
        console.error("Error updating credits:", updateError);
        throw updateError;
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
        console.error("Error recording transaction:", transactionError);
        throw transactionError;
      }
      
      return { newBalance };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-credits", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions", variables.userId] });
    },
  });
};

export const useEarnCredits = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, amount, description, gameSessionId }: {
      userId: string;
      amount: number;
      description: string;
      gameSessionId?: string;
    }) => {
      console.log("Earning credits:", { userId, amount, description });
      
      if (amount <= 0) return { newBalance: 0 };
      
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
          console.error("Error creating credits:", createError);
          throw createError;
        }
        
        currentCredits = newCredits;
      } else if (fetchError) {
        console.error("Error fetching current credits:", fetchError);
        throw fetchError;
      } else {
        // Update existing balance
        const newBalance = currentCredits.balance + amount;
        
        const { error: updateError } = await (supabase as any)
          .from("user_credits")
          .update({ balance: newBalance })
          .eq("user_id", userId);
        
        if (updateError) {
          console.error("Error updating credits:", updateError);
          throw updateError;
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
        console.error("Error recording transaction:", transactionError);
        throw transactionError;
      }
      
      return { newBalance: currentCredits.balance };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-credits", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions", variables.userId] });
    },
  });
};
