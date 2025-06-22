
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { GameSession } from "@/hooks/useGameSessions";
import { SkeletonTable } from "@/components/ui/enhanced-skeleton";

interface PoopeeCrushRecentGamesProps {
  gameSessions: GameSession[] | undefined;
  isLoading?: boolean;
}

export const PoopeeCrushRecentGames = ({ gameSessions, isLoading }: PoopeeCrushRecentGamesProps) => {
  const recentSessions = gameSessions?.slice(0, 5) || [];

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Recent POOPEE Crush Games</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SkeletonTable rows={3} />
        ) : recentSessions.length === 0 ? (
          <p className="text-gray-400 text-center py-4">
            No games played yet. Start your first POOPEE Crush game!
          </p>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg"
              >
                <div>
                  <div className="text-white font-medium">
                    Score: {session.score.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-medium">
                    +{session.credits_earned} credits
                  </div>
                  <div className="text-gray-400 text-sm">
                    {session.metadata?.moves_used || 0} moves
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
