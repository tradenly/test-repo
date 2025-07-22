
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Trophy, Zap } from "lucide-react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Helper function to safely access metadata properties
const getMetadataValue = (metadata: any, key: string, defaultValue: any = 0) => {
  if (!metadata || typeof metadata !== 'object') return defaultValue;
  return metadata[key] ?? defaultValue;
};

export const SpaceInvadersRecentGames = () => {
  const { user } = useUnifiedAuth();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["game-sessions", user?.id, "space_invaders", "recent"],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("game_type", "space_invaders")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading recent games...</div>
        </CardContent>
      </Card>
    );
  }

  const recentSessions = sessions
    ?.filter(s => s.completed_at)
    ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    ?.slice(0, 10) || [];

  if (recentSessions.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            Recent Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            No games played yet. Start your first Space Invaders mission!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-400" />
          Recent Games
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentSessions.map((session) => {
            const gameStatus = getMetadataValue(session.metadata, 'gameStatus', 'completed');
            const wave = getMetadataValue(session.metadata, 'finalWave', getMetadataValue(session.metadata, 'wave', 1));
            const aliensDestroyed = getMetadataValue(session.metadata, 'aliensDestroyed', 0);
            const netCredits = (session.credits_earned || 0) - (session.credits_spent || 0);

            return (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      <span className="text-white font-medium">
                        {session.score.toLocaleString()} pts
                      </span>
                      <Badge 
                        variant={gameStatus === 'victory' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {gameStatus === 'victory' ? 'Victory' : 'Game Over'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Wave {wave}
                      </span>
                      <span>{aliensDestroyed} aliens destroyed</span>
                      <span>{format(new Date(session.created_at), 'MMM d, HH:mm')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-medium ${netCredits >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {netCredits >= 0 ? '+' : ''}{netCredits.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">credits</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
