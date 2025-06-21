
import { TetrisGameState } from './TetrisEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Zap, Hash } from 'lucide-react';

interface TetrisGameStatsProps {
  gameState: TetrisGameState | null;
}

export const TetrisGameStats = ({ gameState }: TetrisGameStatsProps) => {
  if (!gameState) {
    return (
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm">Game Stats</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center text-gray-400 text-sm">
            Start a game to see stats
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm">Game Stats</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="h-3 w-3 text-yellow-400" />
            </div>
            <div className="text-lg font-bold text-white">{gameState.score.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Score</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Zap className="h-3 w-3 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-white">{gameState.level}</div>
            <div className="text-xs text-gray-400">Level</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Hash className="h-3 w-3 text-green-400" />
            </div>
            <div className="text-lg font-bold text-white">{gameState.lines}</div>
            <div className="text-xs text-gray-400">Lines</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-3 w-3 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-white">{Math.max(0, 10 - (gameState.lines % 10))}</div>
            <div className="text-xs text-gray-400">To Next</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
