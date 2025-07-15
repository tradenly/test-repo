import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameSession } from "@/hooks/useGameSessions";

interface MissPoopeeManRecentGamesProps {
  gameSessions?: GameSession[];
}

export const MissPoopeeManRecentGames = ({ gameSessions }: MissPoopeeManRecentGamesProps) => {
  if (!gameSessions || gameSessions.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Recent Games</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {gameSessions.slice(0, 5).map((session) => (
            <div key={session.id} className="flex justify-between items-center bg-gray-900/40 rounded p-3">
              <div className="flex items-center gap-4">
                <div className="text-white font-medium">Score: {session.score}</div>
                <div className="text-gray-400 text-sm">
                  {new Date(session.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-green-400 text-sm">
                +{session.credits_earned.toFixed(2)} credits
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};