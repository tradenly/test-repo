
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Zap, Star } from "lucide-react";
import { useGameSessions } from "@/hooks/useGameSessions";

export const SpaceInvadersStats = () => {
  const { data: sessions, isLoading } = useGameSessions('space_invaders');

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
    highestWave: Math.max(0, ...completedSessions.map(s => s.metadata?.finalWave || s.metadata?.wave || 1)),
    totalAliensDestroyed: completedSessions.reduce((sum, s) => sum + (s.metadata?.aliensDestroyed || 0), 0),
    victories: completedSessions.filter(s => s.metadata?.gameStatus === 'victory').length
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
