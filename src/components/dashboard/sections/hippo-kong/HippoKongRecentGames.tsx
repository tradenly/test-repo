import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Trophy, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { formatDistanceToNow } from "date-fns";

interface HippoKongRecentGamesProps {
  user: UnifiedUser;
}

export const HippoKongRecentGames = ({ user }: HippoKongRecentGamesProps) => {
  const { data: recentGames, isLoading } = useQuery({
    queryKey: ['hippo-kong-recent-games', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_type', 'hippo_kong')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading recent games...</div>
        </CardContent>
      </Card>
    );
  }

  if (!recentGames || recentGames.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-2">🎮</div>
            <p>No games played yet.</p>
            <p className="text-sm">Start climbing to see your history!</p>
          </div>
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
          <Clock className="h-5 w-5" />
          Recent Games
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentGames.map((game, index) => {
          const level = (game.metadata as any)?.level || 1;
          const duration = game.duration_seconds || 0;
          
          return (
            <div
              key={game.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="text-lg">
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎮'}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="h-3 w-3" />
                    <span className="font-medium">{game.score}</span>
                    <span className="text-muted-foreground">• Level {level}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(duration)} • {formatDistanceToNow(new Date(game.completed_at!), { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-green-500">
                  <Coins className="h-3 w-3" />
                  <span>+{(game.credits_earned || 0).toFixed(1)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};