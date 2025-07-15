import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Trophy, Clock, Coins } from "lucide-react";

interface MissPoopeeManStatsProps {
  currentBalance: number;
  creditsLoading: boolean;
  highScore: number;
  totalGames: number;
  averageScore: number;
}

export const MissPoopeeManStats = ({ 
  currentBalance, 
  creditsLoading, 
  highScore, 
  totalGames, 
  averageScore 
}: MissPoopeeManStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Credit Balance Card */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Your Credits</CardTitle>
          <Coins className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {creditsLoading ? "..." : currentBalance.toFixed(2)}
          </div>
          <p className="text-xs text-gray-400">Available to play</p>
        </CardContent>
      </Card>

      {/* High Score Card */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">High Score</CardTitle>
          <Trophy className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{highScore}</div>
          <p className="text-xs text-gray-400">Personal best</p>
        </CardContent>
      </Card>

      {/* Games Played Card */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Games Played</CardTitle>
          <Clock className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalGames}</div>
          <p className="text-xs text-gray-400">Total sessions</p>
        </CardContent>
      </Card>

      {/* Average Score Card */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Average Score</CardTitle>
          <Gamepad2 className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{averageScore}</div>
          <p className="text-xs text-gray-400">Per game</p>
        </CardContent>
      </Card>
    </div>
  );
};