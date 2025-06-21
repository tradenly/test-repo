
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaderboardEntry } from "./useLeaderboardData";
import { Gamepad2, Trophy, Medal, Award } from "lucide-react";

interface MostGamesLeaderboardProps {
  data: LeaderboardEntry[] | undefined;
  currentUserId: string;
}

export const MostGamesLeaderboard = ({ data, currentUserId }: MostGamesLeaderboardProps) => {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-gray-800/40 border-gray-700">
        <CardContent className="p-6">
          <p className="text-gray-400 text-center">No leaderboard data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getDisplayName = (entry: LeaderboardEntry) => {
    return entry.full_name || entry.username || `Player ${entry.user_id.slice(-6)}`;
  };

  const sortedData = [...data].sort((a, b) => b.total_games - a.total_games);

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-green-400" />
          Most Games Played
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {sortedData.slice(0, 20).map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.user_id === currentUserId;
            
            return (
              <div 
                key={entry.user_id}
                className={`flex items-center justify-between p-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                  isCurrentUser ? "bg-blue-900/30 border-blue-600/50" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10">
                    {getRankIcon(rank)}
                  </div>
                  <div>
                    <p className={`font-medium ${isCurrentUser ? "text-blue-300" : "text-white"}`}>
                      {getDisplayName(entry)}
                      {isCurrentUser && <span className="ml-2 text-xs text-blue-400">(You)</span>}
                    </p>
                    <p className="text-sm text-gray-400">
                      Best score: {entry.highest_score.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-400">
                    {entry.total_games}
                  </p>
                  <p className="text-sm text-gray-400">
                    games
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
