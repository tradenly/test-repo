
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GameProgress, LevelConfig } from "./EnhancedGameEngine";

interface LevelHUDProps {
  gameProgress: GameProgress;
  levelConfig: LevelConfig;
  onQuit: () => void;
  onRestart: () => void;
}

export const LevelHUD = ({ gameProgress, levelConfig, onQuit, onRestart }: LevelHUDProps) => {
  const getObjectiveProgress = (objective: any) => {
    switch (objective.type) {
      case 'score':
        return Math.min(100, (gameProgress.score / objective.target) * 100);
      case 'clear_tiles':
        return Math.min(100, (gameProgress.clearedTiles / objective.target) * 100);
      case 'special_tiles':
        return Math.min(100, (gameProgress.specialTilesCreated / objective.target) * 100);
      case 'cascades':
        return Math.min(100, (gameProgress.cascades / objective.target) * 100);
      default:
        return 0;
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-600">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">Level {gameProgress.currentLevel}</h2>
            <div className="text-sm text-gray-300">
              <span className="text-yellow-400">{gameProgress.moves}</span> moves left
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={onRestart} variant="outline" size="sm">
              Restart
            </Button>
            <Button onClick={onQuit} variant="destructive" size="sm">
              Quit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Score Display */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Score</span>
              <span className="text-white font-semibold">{gameProgress.score.toLocaleString()}</span>
            </div>
          </div>

          {/* Difficulty Badge */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Difficulty</span>
              <span className={`font-semibold ${
                levelConfig.difficulty === 'easy' ? 'text-green-400' :
                levelConfig.difficulty === 'medium' ? 'text-yellow-400' :
                levelConfig.difficulty === 'hard' ? 'text-orange-400' : 'text-red-400'
              }`}>
                {levelConfig.difficulty.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Objectives */}
        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">Objectives</h3>
          {levelConfig.objectives.map((objective, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{objective.description}</span>
                <span>{getObjectiveProgress(objective).toFixed(0)}%</span>
              </div>
              <Progress 
                value={getObjectiveProgress(objective)} 
                className="h-2 bg-gray-700"
              />
            </div>
          ))}
        </div>

        {/* Game Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-400">{gameProgress.clearedTiles}</div>
            <div className="text-xs text-gray-400">Tiles Cleared</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-400">{gameProgress.specialTilesCreated}</div>
            <div className="text-xs text-gray-400">Special Tiles</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-400">{gameProgress.cascades}</div>
            <div className="text-xs text-gray-400">Cascades</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
