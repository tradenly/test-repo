
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  user_id: string;
  username: string | null;
  full_name: string | null;
  highest_score: number;
  total_games: number;
  longest_survival: number;
  average_score: number;
  total_credits_earned: number;
  last_played: string;
}

export const useLeaderboardData = () => {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard-data"],
    queryFn: async () => {
      console.log("Fetching leaderboard data...");
      
      const { data, error } = await (supabase as any)
        .from("leaderboard_stats")
        .select("*")
        .order("highest_score", { ascending: false })
        .limit(100);
      
      if (error) {
        console.error("Leaderboard fetch error:", error);
        throw error;
      }
      
      console.log("Leaderboard data:", data);
      return (data || []) as LeaderboardEntry[];
    },
  });
};
