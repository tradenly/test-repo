
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define proper types for the credit system
export interface UserCredits {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  transaction_type: 'purchase' | 'earned' | 'spent' | 'cashout' | 'bonus' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  reference_id?: string;
  created_at: string;
  completed_at?: string;
  metadata?: any;
}

export const useCredits = (userId: string) => {
  return useQuery<UserCredits>({
    queryKey: ["user-credits", userId],
    queryFn: async () => {
      console.log("Fetching credits for user:", userId);
      
      // Use type assertion to work around missing table types
      const { data, error } = await (supabase as any)
        .from("user_credits")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (error) {
        console.log("Credits fetch error:", error);
        // If no credits record exists, return default
        if (error.code === 'PGRST116') {
          return { 
            id: '', 
            user_id: userId, 
            balance: 0, 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as UserCredits;
        }
        throw error;
      }
      
      console.log("Credits data:", data);
      return data as UserCredits;
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};

export const useCreditTransactions = (userId: string) => {
  return useQuery<CreditTransaction[]>({
    queryKey: ["credit-transactions", userId],
    queryFn: async () => {
      console.log("Fetching credit transactions for user:", userId);
      
      // Use type assertion to work around missing table types
      const { data, error } = await (supabase as any)
        .from("credit_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.log("Credit transactions fetch error:", error);
        throw error;
      }
      
      console.log("Credit transactions data:", data);
      return (data || []) as CreditTransaction[];
    },
    enabled: !!userId,
  });
};
