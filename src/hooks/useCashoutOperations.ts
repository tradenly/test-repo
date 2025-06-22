
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CashoutRequest {
  id: string;
  user_id: string;
  amount_credits: number;
  amount_crypto: number;
  previous_balance: number;
  new_balance: number;
  selected_wallet_id: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  requested_at: string;
  approved_at?: string;
  completed_at?: string;
  approved_by?: string;
  transaction_id?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export const useCashoutRequests = (userId: string) => {
  return useQuery<CashoutRequest[]>({
    queryKey: ["cashout-requests", userId],
    queryFn: async () => {
      console.log("Fetching cashout requests for user:", userId);
      
      const { data, error } = await supabase
        .from("credit_cashout_requests")
        .select("*")
        .eq("user_id", userId)
        .order("requested_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching cashout requests:", error);
        throw error;
      }
      
      console.log("Cashout requests data:", data);
      return data || [];
    },
    enabled: !!userId,
  });
};

export const useCreateCashoutRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ userId, creditAmount, walletId }: {
      userId: string;
      creditAmount: number;
      walletId: string;
    }) => {
      console.log("Creating cashout request:", { userId, creditAmount, walletId });
      
      // Get current user credits
      const { data: currentCredits, error: fetchError } = await supabase
        .from("user_credits")
        .select("balance")
        .eq("user_id", userId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching current credits:", fetchError);
        throw fetchError;
      }
      
      if (!currentCredits || currentCredits.balance < creditAmount) {
        throw new Error("Insufficient credits for cashout");
      }
      
      const previousBalance = currentCredits.balance;
      const newBalance = previousBalance - creditAmount;
      const cryptoAmount = creditAmount / 5; // 5 credits = 1 USDC
      
      // Create cashout request
      const { data: cashoutRequest, error: cashoutError } = await supabase
        .from("credit_cashout_requests")
        .insert({
          user_id: userId,
          amount_credits: creditAmount,
          amount_crypto: cryptoAmount,
          previous_balance: previousBalance,
          new_balance: newBalance,
          selected_wallet_id: walletId,
          status: 'pending',
        })
        .select()
        .single();
      
      if (cashoutError) {
        console.error("Error creating cashout request:", cashoutError);
        throw cashoutError;
      }
      
      // Update user credits (deduct immediately)
      const { error: updateError } = await supabase
        .from("user_credits")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      
      if (updateError) {
        console.error("Error updating user credits:", updateError);
        throw updateError;
      }
      
      // Create credit transaction record
      const { error: transactionError } = await supabase
        .from("credit_transactions")
        .insert({
          user_id: userId,
          transaction_type: "cashout",
          amount: -creditAmount,
          description: `Cashout request - ${cryptoAmount} USDC`,
          status: "pending",
          reference_id: cashoutRequest.id,
        });
      
      if (transactionError) {
        console.error("Error creating transaction record:", transactionError);
        throw transactionError;
      }
      
      console.log("Cashout request created successfully:", cashoutRequest);
      return cashoutRequest;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-credits", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["cashout-requests", variables.userId] });
      
      toast({
        title: "Cashout Request Submitted",
        description: "Your cashout request has been submitted and is pending admin approval.",
      });
    },
    onError: (error: any) => {
      console.error("Cashout request error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit cashout request.",
        variant: "destructive",
      });
    },
  });
};
