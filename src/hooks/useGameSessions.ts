
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GameSession {
  id: string;
  user_id: string;
  game_type: string;
  score: number;
  duration_seconds: number;
  credits_spent: number;
  credits_earned: number;
  pipes_passed: number;
  created_at: string;
  completed_at?: string;
  metadata?: any;
}

export const useGameSessions = (userId: string) => {
  return useQuery<GameSession[]>({
    queryKey: ["game-sessions", userId],
    queryFn: async () => {
      console.log("Fetching game sessions for user:", userId);
      
      const { data, error } = await (supabase as any)
        .from("game_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) {
        console.log("Game sessions fetch error:", error);
        throw error;
      }
      
      console.log("Game sessions data:", data);
      return (data || []) as GameSession[];
    },
    enabled: !!userId,
  });
};

export const useCreateGameSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sessionData: {
      user_id: string;
      score: number;
      duration_seconds: number;
      credits_spent: number;
      credits_earned: number;
      pipes_passed: number;
      metadata?: any;
    }) => {
      console.log("Creating game session:", sessionData);
      
      const { data, error } = await (supabase as any)
        .from("game_sessions")
        .insert([{
          ...sessionData,
          game_type: sessionData.metadata?.game_type || 'flappy_hippos',
          completed_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        console.error("Error creating game session:", error);
        throw error;
      }
      
      console.log("Game session created:", data);
      return data as GameSession;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["game-sessions", data.user_id] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard-data"] });
    },
  });
};
