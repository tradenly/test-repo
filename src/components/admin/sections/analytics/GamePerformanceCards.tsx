
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from 'lucide-react';

const gameColors = {
  flappy_hippos: '#3B82F6',
  poopee_crush: '#10B981', 
  falling_logs: '#F59E0B'
};

interface GameStats {
  name: string;
  sessions: number;
  uniquePlayers: Set<string>;
  totalScore: number;
  creditsSpent: number;
  creditsEarned: number;
}

interface GamePerformanceCardsProps {
  gameStats: Record<string, GameStats>;
}

export const GamePerformanceCards = ({ gameStats }: GamePerformanceCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(gameStats).map(([gameType, stats]) => (
        <Card key={gameType} className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" style={{ color: gameColors[gameType as keyof typeof gameColors] }} />
              {stats.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Sessions:</span>
              <span className="text-white">{stats.sessions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Unique Players:</span>
              <span className="text-white">{stats.uniquePlayers.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Score:</span>
              <span className="text-white">{stats.sessions > 0 ? Math.round(stats.totalScore / stats.sessions) : 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Credits/Session:</span>
              <span className="text-white">{stats.sessions > 0 ? (stats.creditsSpent / stats.sessions).toFixed(1) : 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Profit Margin:</span>
              <span className="text-white">{stats.creditsSpent > 0 ? (((stats.creditsSpent - stats.creditsEarned) / stats.creditsSpent) * 100).toFixed(1) : 0}%</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
