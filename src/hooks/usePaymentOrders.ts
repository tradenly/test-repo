
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentOrder {
  id: string;
  user_id: string;
  wallet_address: string;
  blockchain: string;
  usdc_amount: number;
  credit_amount: number;
  payment_address: string;
  status: 'pending' | 'confirmed' | 'failed' | 'expired';
  transaction_hash?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export const usePaymentOrders = (userId?: string) => {
  return useQuery<PaymentOrder[]>({
    queryKey: ["payment-orders", userId],
    queryFn: async () => {
      console.log("Fetching payment orders for user:", userId);
      
      let query = supabase
        .from("credit_payment_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Payment orders fetch error:", error);
        throw error;
      }
      
      console.log("Payment orders data:", data);
      return (data || []) as PaymentOrder[];
    },
    enabled: true,
  });
};

export const useCreatePaymentOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: {
      userId: string;
      walletAddress: string;
      blockchain: string;
      usdcAmount: number;
      creditAmount: number;
      paymentAddress: string;
    }) => {
      console.log("Creating payment order:", orderData);
      
      const { data, error } = await supabase
        .from("credit_payment_orders")
        .insert([{
          user_id: orderData.userId,
          wallet_address: orderData.walletAddress,
          blockchain: orderData.blockchain,
          usdc_amount: orderData.usdcAmount,
          credit_amount: orderData.creditAmount,
          payment_address: orderData.paymentAddress,
        }])
        .select()
        .single();
      
      if (error) {
        console.error("Error creating payment order:", error);
        throw error;
      }
      
      return data as PaymentOrder;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payment-orders"] });
      queryClient.invalidateQueries({ queryKey: ["payment-orders", variables.userId] });
    },
  });
};
