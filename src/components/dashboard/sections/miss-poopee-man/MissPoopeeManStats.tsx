
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
  const statsCards = [
    {
      title: "Games Played",
      value: totalGames,
      icon: Target,
      color: "text-blue-400"
    },
    {
      title: "High Score",
      value: highScore,
      icon: Trophy,
      color: "text-yellow-400"
    },
    {
      title: "Average Score",
      value: averageScore,
      icon: TrendingUp,
      color: "text-green-400"
    },
    {
      title: "Current Credits",
      value: currentCredits.toFixed(2),
      icon: Coins,
      color: "text-purple-400"
    }
  ];

  return (
    <>
      {statsCards.map((stat, index) => (
        <Card key={index} className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
