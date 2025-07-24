import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface HippoJumperRecentGamesProps {
  user: UnifiedUser;
}

export const HippoJumperRecentGames = ({ user }: HippoJumperRecentGamesProps) => {
  const { data: recentGames, isLoading } = useQuery({
    queryKey: ['hippo-jumper-recent-games', user?.id],
    queryFn: async () => {
      // This would fetch real recent games from your backend
      // For now, return mock data
      return [
        { id: 1, score: 1250, date: new Date(Date.now() - 1000 * 60 * 30) },
        { id: 2, score: 850, date: new Date(Date.now() - 1000 * 60 * 60 * 2) },
        { id: 3, score: 1100, date: new Date(Date.now() - 1000 * 60 * 60 * 24) },
        { id: 4, score: 650, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
        { id: 5, score: 920, date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
      ];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Games</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading recent games...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Games</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentGames?.slice(0, 5).map((game) => (
            <div key={game.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <div>
                <div className="font-medium">{game.score} points</div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(game.date, { addSuffix: true })}
                </div>
              </div>
            </div>
          )) || <div className="text-muted-foreground">No recent games</div>}
        </div>
      </CardContent>
    </Card>
  );
};