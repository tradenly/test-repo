
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, TrendingUp, Coins } from "lucide-react";

interface MissPoopeeManStatsProps {
  totalGames: number;
  highScore: number;
  averageScore: number;
  totalCreditsEarned: number;
  currentCredits: number;
}

export const MissPoopeeManStats = ({
  totalGames,
  highScore,
  averageScore,
  totalCreditsEarned,
  currentCredits
}: MissPoopeeManStatsProps) => {
  return (
    <div className="space-y-4">
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <span className="text-2xl">👾</span>
            Game Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{totalGames}</div>
              <div className="text-sm text-gray-400">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{highScore}</div>
              <div className="text-sm text-gray-400">High Score</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{averageScore}</div>
              <div className="text-sm text-gray-400">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{totalCreditsEarned.toFixed(1)}</div>
              <div className="text-sm text-gray-400">Credits Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-400" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{currentCredits.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Credits Available</div>
            <div className="text-xs text-gray-500 mt-2">1 credit per game</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
