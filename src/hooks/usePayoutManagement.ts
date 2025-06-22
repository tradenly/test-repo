import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CashoutRequest } from "./useCashoutOperations";

export interface CashoutRequestWithUser extends CashoutRequest {
  user_profile?: {
    id: string;
    username?: string | null;
    full_name?: string | null;
  } | null;
  user_wallet?: {
    id: string;
    wallet_address: string;
    blockchain: string;
    wallet_name?: string | null;
  } | null;
}

export const useAdminCashoutRequests = () => {
  return useQuery({
    queryKey: ["admin-cashout-requests"],
    queryFn: async (): Promise<CashoutRequestWithUser[]> => {
      console.log("Fetching admin cashout requests");
      
      const { data, error } = await supabase
        .from("credit_cashout_requests")
        .select(`
          *,
          user_profile:profiles!credit_cashout_requests_user_id_fkey(id, username, full_name),
          user_wallet:user_wallets!credit_cashout_requests_selected_wallet_id_fkey(id, wallet_address, blockchain, wallet_name)
        `)
        .order("requested_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching admin cashout requests:", error);
        throw error;
      }
      
      console.log("Admin cashout requests data:", data);
      
      // Safely map and cast the response data
      return (data || []).map(item => {
        // Handle potential query errors in related tables with proper null checking
        const userProfile = item.user_profile && 
          typeof item.user_profile === 'object' && 
          !('error' in item.user_profile) &&
          item.user_profile !== null &&
          'id' in item.user_profile
          ? item.user_profile as { id: string; username?: string | null; full_name?: string | null; }
          : null;
          
        const userWallet = item.user_wallet && 
          typeof item.user_wallet === 'object' && 
          !('error' in item.user_wallet) &&
          item.user_wallet !== null &&
          'id' in item.user_wallet
          ? item.user_wallet as { id: string; wallet_address: string; blockchain: string; wallet_name?: string | null; }
          : null;

        return {
          ...item,
          status: item.status as 'pending' | 'approved' | 'completed' | 'rejected',
          user_profile: userProfile,
          user_wallet: userWallet,
        };
      });
    },
  });
};

export const useUpdateCashoutStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      adminNotes, 
      transactionId,
      adminUserId 
    }: {
      requestId: string;
      status: 'approved' | 'completed' | 'rejected';
      adminNotes?: string;
      transactionId?: string;
      adminUserId: string;
    }) => {
      console.log("Updating cashout status:", { requestId, status, adminNotes, transactionId });
      
      const updateData: any = {
        status,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      };
      
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = adminUserId;
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.transaction_id = transactionId;
      }
      
      // If rejecting, we need to refund the credits
      if (status === 'rejected') {
        // Get the cashout request details
        const { data: cashoutRequest, error: fetchError } = await supabase
          .from("credit_cashout_requests")
          .select("user_id, amount_credits, previous_balance")
          .eq("id", requestId)
          .single();
        
        if (fetchError) {
          console.error("Error fetching cashout request:", fetchError);
          throw fetchError;
        }
        
        // Restore user credits
        const { error: creditError } = await supabase
          .from("user_credits")
          .update({ 
            balance: cashoutRequest.previous_balance,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", cashoutRequest.user_id);
        
        if (creditError) {
          console.error("Error restoring credits:", creditError);
          throw creditError;
        }
        
        // Create refund transaction
        const { error: transactionError } = await supabase
          .from("credit_transactions")
          .insert({
            user_id: cashoutRequest.user_id,
            transaction_type: "refund",
            amount: cashoutRequest.amount_credits,
            description: `Cashout request rejected - credits refunded`,
            status: "completed",
            completed_at: new Date().toISOString(),
            reference_id: requestId,
          });
        
        if (transactionError) {
          console.error("Error creating refund transaction:", transactionError);
          throw transactionError;
        }
      }
      
      // Update the cashout request
      const { error: updateError } = await supabase
        .from("credit_cashout_requests")
        .update(updateData)
        .eq("id", requestId);
      
      if (updateError) {
        console.error("Error updating cashout request:", updateError);
        throw updateError;
      }
      
      // If completed, create completion transaction for user activity feed
      if (status === 'completed') {
        const { data: cashoutRequest, error: fetchError } = await supabase
          .from("credit_cashout_requests")
          .select("user_id, amount_crypto")
          .eq("id", requestId)
          .single();
        
        if (!fetchError && cashoutRequest) {
          await supabase
            .from("credit_transactions")
            .insert({
              user_id: cashoutRequest.user_id,
              transaction_type: "earned", // This will show as positive activity
              amount: 0, // No credit change, just notification
              description: `Cashout completed - ${cashoutRequest.amount_crypto} USDC sent`,
              status: "completed",
              completed_at: new Date().toISOString(),
              reference_id: requestId,
              metadata: { 
                cashout_completed: true,
                transaction_id: transactionId,
                crypto_amount: cashoutRequest.amount_crypto
              }
            });
        }
      }
      
      console.log("Cashout status updated successfully");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cashout-requests"] });
      toast({
        title: "Success",
        description: "Cashout request status updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Update cashout status error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update cashout request.",
        variant: "destructive",
      });
    },
  });
};
