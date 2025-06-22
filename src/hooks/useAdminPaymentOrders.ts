
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PaymentOrder } from "./usePaymentOrders";
import { logger } from "@/utils/logger";

export interface PaymentOrderWithUser extends PaymentOrder {
  user_profile?: {
    id: string;
    username?: string | null;
    full_name?: string | null;
  } | null;
}

export const useAdminPaymentOrders = () => {
  return useQuery({
    queryKey: ["admin-payment-orders"],
    queryFn: async (): Promise<PaymentOrderWithUser[]> => {
      logger.log("Fetching admin payment orders");
      
      // First, get all payment orders
      const { data: paymentOrders, error: paymentError } = await supabase
        .from("credit_payment_orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (paymentError) {
        logger.error("Error fetching payment orders:", paymentError);
        throw paymentError;
      }
      
      if (!paymentOrders || paymentOrders.length === 0) {
        logger.log("No payment orders found");
        return [];
      }
      
      logger.log("Found payment orders:", paymentOrders.length);
      
      // Get unique user IDs
      const userIds = [...new Set(paymentOrders.map(order => order.user_id))];
      
      // Fetch user profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", userIds);
      
      if (profilesError) {
        logger.error("Error fetching profiles:", profilesError);
        // Don't throw, just log - we can still show orders without profile data
      }
      
      logger.log("Profiles fetched:", profiles?.length || 0);
      
      // Create lookup map for better performance
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      // Combine the data
      const result = paymentOrders.map(order => {
        const userProfile = profilesMap.get(order.user_id) || null;
        
        return {
          ...order,
          status: order.status as 'pending' | 'confirmed' | 'failed' | 'expired',
          user_profile: userProfile ? {
            id: userProfile.id,
            username: userProfile.username,
            full_name: userProfile.full_name,
          } : null,
        };
      });
      
      logger.log("Final admin payment orders with user data:", result);
      return result;
    },
  });
};

export const useConfirmPaymentOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      orderId, 
      transactionHash,
      adminUserId 
    }: {
      orderId: string;
      transactionHash?: string;
      adminUserId: string;
    }) => {
      logger.log("Confirming payment order:", { orderId, transactionHash });
      
      const { data, error } = await supabase.rpc('confirm_credit_payment_order', {
        order_id: orderId,
        admin_user_id: adminUserId,
        transaction_hash: transactionHash || null
      });
      
      if (error) {
        logger.error("Error confirming payment order:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Failed to confirm payment order - order not found or already processed");
      }
      
      logger.log("Payment order confirmed successfully");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-orders"] });
      queryClient.invalidateQueries({ queryKey: ["payment-orders"] });
      toast({
        title: "Success",
        description: "Payment order confirmed and credits added to user account.",
      });
    },
    onError: (error: any) => {
      logger.error("Confirm payment order error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm payment order.",
        variant: "destructive",
      });
    },
  });
};

export const useRejectPaymentOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      orderId, 
      adminNotes 
    }: {
      orderId: string;
      adminNotes?: string;
    }) => {
      logger.log("Rejecting payment order:", { orderId, adminNotes });
      
      const { error } = await supabase
        .from("credit_payment_orders")
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId);
      
      if (error) {
        logger.error("Error rejecting payment order:", error);
        throw error;
      }
      
      logger.log("Payment order rejected successfully");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-orders"] });
      queryClient.invalidateQueries({ queryKey: ["payment-orders"] });
      toast({
        title: "Success",
        description: "Payment order has been rejected.",
      });
    },
    onError: (error: any) => {
      logger.error("Reject payment order error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject payment order.",
        variant: "destructive",
      });
    },
  });
};
