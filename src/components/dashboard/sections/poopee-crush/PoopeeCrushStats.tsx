
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Trophy, Target, TrendingUp } from "lucide-react";

interface PoopeeCrushStatsProps {
  currentBalance: number;
  creditsLoading: boolean;
  highScore: number;
  totalGames: number;
  averageScore: number;
}

export const PoopeeCrushStats = ({ 
  currentBalance, 
  creditsLoading, 
  highScore, 
  totalGames, 
  averageScore 
}: PoopeeCrushStatsProps) => {
  const statsCards = [
    {
      title: "Credits",
      value: creditsLoading ? "..." : currentBalance?.toFixed(2) || "0.00",
      icon: Coins,
      description: "Available to play",
      color: "text-yellow-400"
    },
    {
      title: "High Score",
      value: highScore.toLocaleString(),
      icon: Trophy,
      description: "Personal best",
      color: "text-blue-400"
    },
    {
      title: "Games Played",
      value: totalGames.toLocaleString(),
      icon: Target,
      description: "Total matches",
      color: "text-green-400"
    },
    {
      title: "Average Score",
      value: averageScore.toLocaleString(),
      icon: TrendingUp,
      description: "Per game",
      color: "text-purple-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="bg-gray-800/40 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-gray-400 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
