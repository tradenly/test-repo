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
      
      // First, get all cashout requests
      const { data: cashoutRequests, error: cashoutError } = await supabase
        .from("credit_cashout_requests")
        .select("*")
        .order("requested_at", { ascending: false });
      
      if (cashoutError) {
        console.error("Error fetching cashout requests:", cashoutError);
        throw cashoutError;
      }
      
      if (!cashoutRequests || cashoutRequests.length === 0) {
        console.log("No cashout requests found");
        return [];
      }
      
      console.log("Found cashout requests:", cashoutRequests.length);
      
      // Get unique user IDs and wallet IDs
      const userIds = [...new Set(cashoutRequests.map(req => req.user_id))];
      const walletIds = [...new Set(cashoutRequests.map(req => req.selected_wallet_id))];
      
      // Fetch user profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", userIds);
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Don't throw, just log - we can still show requests without profile data
      }
      
      // Fetch wallets separately
      const { data: wallets, error: walletsError } = await supabase
        .from("user_wallets")
        .select("id, wallet_address, blockchain, wallet_name")
        .in("id", walletIds);
      
      if (walletsError) {
        console.error("Error fetching wallets:", walletsError);
        // Don't throw, just log - we can still show requests without wallet data
      }
      
      console.log("Profiles fetched:", profiles?.length || 0);
      console.log("Wallets fetched:", wallets?.length || 0);
      
      // Create lookup maps for better performance
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const walletsMap = new Map(wallets?.map(w => [w.id, w]) || []);
      
      // Combine the data
      const result = cashoutRequests.map(request => {
        const userProfile = profilesMap.get(request.user_id) || null;
        const userWallet = walletsMap.get(request.selected_wallet_id) || null;
        
        return {
          ...request,
          status: request.status as 'pending' | 'approved' | 'completed' | 'rejected',
          user_profile: userProfile ? {
            id: userProfile.id,
            username: userProfile.username,
            full_name: userProfile.full_name,
          } : null,
          user_wallet: userWallet ? {
            id: userWallet.id,
            wallet_address: userWallet.wallet_address,
            blockchain: userWallet.blockchain,
            wallet_name: userWallet.wallet_name,
          } : null,
        };
      });
      
      console.log("Final admin cashout requests with user data:", result);
      return result;
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
