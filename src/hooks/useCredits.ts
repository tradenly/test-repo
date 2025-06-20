
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCredits = (userId: string) => {
  return useQuery({
    queryKey: ["user-credits", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (error) {
        // If no credits record exists, return default
        if (error.code === 'PGRST116') {
          return { balance: 0, user_id: userId };
        }
        throw error;
      }
      
      return data;
    },
    enabled: !!userId,
  });
};

export const useCreditTransactions = (userId: string) => {
  return useQuery({
    queryKey: ["credit-transactions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
