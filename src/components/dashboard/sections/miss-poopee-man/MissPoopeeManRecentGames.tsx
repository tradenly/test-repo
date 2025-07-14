
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameSession } from "@/hooks/useGameSessions";
import { formatDistanceToNow } from "date-fns";

interface MissPoopeeManRecentGamesProps {
  gameSessions: GameSession[];
}

export const MissPoopeeManRecentGames = ({ gameSessions }: MissPoopeeManRecentGamesProps) => {
  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span className="text-xl">📊</span>
          Recent Games
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {gameSessions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No games played yet. Start your first game!</p>
          ) : (
            gameSessions.map((session) => (
              <div
                key={session.id}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">👾</span>
                      <span className="text-white font-medium">Score: {session.score}</span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>Duration: {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s</div>
                      <div>Credits: -{session.credits_spent} / +{session.credits_earned}</div>
                      {session.metadata?.level && (
                        <div>Level reached: {session.metadata.level}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
