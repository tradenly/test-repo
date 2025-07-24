import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Clock, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface HippoKongStatsProps {
  user: UnifiedUser;
}

export const HippoKongStats = ({ user }: HippoKongStatsProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['hippo-kong-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('game_sessions')
        .select('score, duration_seconds, credits_earned, metadata')
        .eq('user_id', user.id)
        .eq('game_type', 'hippo_kong')
        .not('completed_at', 'is', null);

      if (error) throw error;

      const gamesPlayed = data.length;
      const highestScore = data.length > 0 ? Math.max(...data.map(session => session.score)) : 0;
      const totalCreditsEarned = data.reduce((sum, session) => sum + (session.credits_earned || 0), 0);
      const averageScore = gamesPlayed > 0 ? data.reduce((sum, session) => sum + session.score, 0) / gamesPlayed : 0;
      const longestSurvival = data.length > 0 ? Math.max(...data.map(session => session.duration_seconds || 0)) : 0;
      const highestLevel = data.length > 0 ? Math.max(...data.map(session => (session.metadata as any)?.level || 1)) : 1;

      return {
        gamesPlayed,
        highestScore,
        totalCreditsEarned,
        averageScore,
        longestSurvival,
        highestLevel
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Hippo Kong Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading stats...</div>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Your Hippo Kong Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-primary mr-1" />
            </div>
            <div className="text-2xl font-bold text-primary">{stats?.highestScore || 0}</div>
            <div className="text-xs text-muted-foreground">High Score</div>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
            </div>
            <div className="text-2xl font-bold text-yellow-500">{stats?.highestLevel || 1}</div>
            <div className="text-xs text-muted-foreground">Highest Level</div>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            </div>
            <div className="text-2xl font-bold text-green-500">
              {stats?.averageScore ? Math.round(stats.averageScore) : 0}
            </div>
            <div className="text-xs text-muted-foreground">Avg Score</div>
          </div>
          
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-blue-500 mr-1" />
            </div>
            <div className="text-2xl font-bold text-blue-500">
              {formatTime(stats?.longestSurvival || 0)}
            </div>
            <div className="text-xs text-muted-foreground">Longest Climb</div>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Games Played:</span>
            <span className="font-medium">{stats?.gamesPlayed || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Credits Earned:</span>
            <span className="font-medium text-green-500">
              {stats?.totalCreditsEarned?.toFixed(1) || '0.0'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};