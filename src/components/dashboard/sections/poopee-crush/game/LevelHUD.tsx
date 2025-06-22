
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GameProgress } from "./EnhancedGameEngine";
import { LevelConfig } from "./LevelConfig";

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
    <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-1">Level {gameProgress.currentLevel}</h2>
        <div className="text-sm text-gray-300">
          <span className="text-yellow-400">{gameProgress.moves}</span> moves left
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-4 space-y-2">
        <Button onClick={onRestart} variant="outline" size="sm" className="w-full text-xs">
          Restart
        </Button>
        <Button onClick={onQuit} variant="destructive" size="sm" className="w-full text-xs">
          Quit
        </Button>
      </div>

      {/* Score and Difficulty */}
      <div className="mb-4 space-y-3">
        <div>
          <div className="text-xs text-gray-300 mb-1">Score</div>
          <div className="text-lg font-semibold text-white">{gameProgress.score.toLocaleString()}</div>
        </div>
        
        <div>
          <div className="text-xs text-gray-300 mb-1">Difficulty</div>
          <div className={`text-sm font-semibold ${
            levelConfig.difficulty === 'easy' ? 'text-green-400' :
            levelConfig.difficulty === 'medium' ? 'text-yellow-400' :
            levelConfig.difficulty === 'hard' ? 'text-orange-400' : 'text-red-400'
          }`}>
            {levelConfig.difficulty.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="mb-4 flex-1">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Objectives</h3>
        <div className="space-y-3">
          {levelConfig.objectives.map((objective, index) => (
            <div key={index}>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span className="text-xs">{objective.description}</span>
                <span>{getObjectiveProgress(objective).toFixed(0)}%</span>
              </div>
              <Progress 
                value={getObjectiveProgress(objective)} 
                className="h-2 bg-gray-700"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Game Stats */}
      <div className="space-y-2 text-center">
        <div className="text-xs text-gray-400 mb-2">Stats</div>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <div className="text-sm font-bold text-blue-400">{gameProgress.clearedTiles}</div>
            <div className="text-xs text-gray-400">Tiles</div>
          </div>
          <div>
            <div className="text-sm font-bold text-purple-400">{gameProgress.specialTilesCreated}</div>
            <div className="text-xs text-gray-400">Special</div>
          </div>
          <div>
            <div className="text-sm font-bold text-orange-400">{gameProgress.cascades}</div>
            <div className="text-xs text-gray-400">Cascades</div>
          </div>
        </div>
      </div>
    </div>
  );
};
