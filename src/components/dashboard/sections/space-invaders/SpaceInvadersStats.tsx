
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Zap, Star } from "lucide-react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Helper function to safely access metadata properties
const getMetadataValue = (metadata: any, key: string, defaultValue: any = 0) => {
  if (!metadata || typeof metadata !== 'object') return defaultValue;
  return metadata[key] ?? defaultValue;
};

export const SpaceInvadersStats = () => {
  const { user } = useUnifiedAuth();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["game-sessions", user?.id, "space_invaders"],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("game_type", "space_invaders")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading stats...</div>
        </CardContent>
      </Card>
    );
  }

  const completedSessions = sessions?.filter(s => s.completed_at) || [];
  
  const stats = {
    totalGames: completedSessions.length,
    highScore: Math.max(0, ...completedSessions.map(s => s.score)),
    totalCreditsEarned: completedSessions.reduce((sum, s) => sum + (s.credits_earned || 0), 0),
    totalCreditsSpent: completedSessions.reduce((sum, s) => sum + (s.credits_spent || 0), 0),
    averageScore: completedSessions.length > 0 
      ? Math.round(completedSessions.reduce((sum, s) => sum + s.score, 0) / completedSessions.length)
      : 0,
    highestWave: Math.max(0, ...completedSessions.map(s => 
      getMetadataValue(s.metadata, 'finalWave', getMetadataValue(s.metadata, 'wave', 1))
    )),
    totalAliensDestroyed: completedSessions.reduce((sum, s) => 
      sum + getMetadataValue(s.metadata, 'aliensDestroyed', 0), 0
    ),
    victories: completedSessions.filter(s => 
      getMetadataValue(s.metadata, 'gameStatus') === 'victory'
    ).length
  };

  const netCredits = stats.totalCreditsEarned - stats.totalCreditsSpent;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            High Score
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-white">{stats.highScore.toLocaleString()}</div>
          <Badge variant="outline" className="mt-1 text-xs">
            Highest Wave: {stats.highestWave}
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
            <Target className="h-4 w-4" />
            Games Played
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-white">{stats.totalGames}</div>
          <Badge variant="outline" className="mt-1 text-xs">
            Victories: {stats.victories}
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Aliens Destroyed
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-white">{stats.totalAliensDestroyed.toLocaleString()}</div>
          <Badge variant="outline" className="mt-1 text-xs">
            Avg Score: {stats.averageScore}
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-1">
            <Star className="h-4 w-4" />
            Net Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className={`text-2xl font-bold ${netCredits >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netCredits >= 0 ? '+' : ''}{netCredits.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Earned: {stats.totalCreditsEarned.toFixed(2)} | Spent: {stats.totalCreditsSpent.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
