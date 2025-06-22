
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserReferral {
  id: string;
  user_id: string;
  referral_code: string;
  created_at: string;
  updated_at: string;
}

export interface ReferralTransaction {
  id: string;
  referrer_user_id: string;
  referred_user_id: string;
  referral_code: string;
  credits_awarded: number;
  status: string;
  created_at: string;
  completed_at: string;
}

export interface ReferralStats {
  totalReferrals: number;
  totalCreditsEarned: number;
  recentReferrals: ReferralTransaction[];
}

export const useReferralData = (userId: string) => {
  const referralQuery = useQuery<UserReferral>({
    queryKey: ["user-referral", userId],
    queryFn: async () => {
      console.log("Fetching referral code for user:", userId);
      
      const { data, error } = await (supabase as any)
        .from("user_referrals")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (error) {
        console.log("Referral fetch error:", error);
        throw error;
      }
      
      console.log("Referral data:", data);
      return data as UserReferral;
    },
    enabled: !!userId,
  });

  const referralStatsQuery = useQuery<ReferralStats>({
    queryKey: ["referral-stats", userId],
    queryFn: async () => {
      console.log("Fetching referral stats for user:", userId);
      
      const { data, error } = await (supabase as any)
        .from("referral_transactions")
        .select("*")
        .eq("referrer_user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.log("Referral stats fetch error:", error);
        throw error;
      }
      
      const transactions = (data || []) as ReferralTransaction[];
      const totalReferrals = transactions.length;
      const totalCreditsEarned = transactions.reduce((sum, t) => sum + Number(t.credits_awarded), 0);
      
      console.log("Referral stats:", { totalReferrals, totalCreditsEarned, transactions });
      
      return {
        totalReferrals,
        totalCreditsEarned,
        recentReferrals: transactions.slice(0, 5)
      } as ReferralStats;
    },
    enabled: !!userId,
  });

  return {
    referral: referralQuery.data,
    isLoadingReferral: referralQuery.isLoading,
    referralStats: referralStatsQuery.data,
    isLoadingStats: referralStatsQuery.isLoading,
    refetchReferral: referralQuery.refetch,
    refetchStats: referralStatsQuery.refetch,
  };
};
