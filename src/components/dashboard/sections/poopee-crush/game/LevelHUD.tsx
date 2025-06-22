
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
    <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-3 h-fit">
      {/* Compact Header */}
      <div className="mb-3">
        <h2 className="text-lg font-bold text-white mb-1">Level {gameProgress.currentLevel}</h2>
        <div className="text-sm text-gray-300">
          <span className="text-yellow-400">{gameProgress.moves}</span> moves left
        </div>
      </div>

      {/* Compact Action Buttons */}
      <div className="mb-3 space-y-2">
        <Button onClick={onRestart} variant="outline" size="sm" className="w-full text-xs">
          Restart
        </Button>
        <Button onClick={onQuit} variant="destructive" size="sm" className="w-full text-xs">
          Quit
        </Button>
      </div>

      {/* Score and Difficulty */}
      <div className="mb-3 space-y-2">
        <div>
          <div className="text-xs text-gray-300 mb-1">Score</div>
          <div className="text-base font-semibold text-white">{gameProgress.score.toLocaleString()}</div>
        </div>
        
        <div>
          <div className="text-xs text-gray-300 mb-1">Difficulty</div>
          <div className={`text-xs font-semibold ${
            levelConfig.difficulty === 'easy' ? 'text-green-400' :
            levelConfig.difficulty === 'medium' ? 'text-yellow-400' :
            levelConfig.difficulty === 'hard' ? 'text-orange-400' : 'text-red-400'
          }`}>
            {levelConfig.difficulty.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Compact Objectives */}
      <div className="mb-3">
        <h3 className="text-xs font-semibold text-gray-300 mb-2">Objectives</h3>
        <div className="space-y-2">
          {levelConfig.objectives.map((objective, index) => (
            <div key={index}>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span className="text-xs truncate">{objective.description}</span>
                <span>{getObjectiveProgress(objective).toFixed(0)}%</span>
              </div>
              <Progress 
                value={getObjectiveProgress(objective)} 
                className="h-1.5 bg-gray-700"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Compact Game Stats */}
      <div className="space-y-2">
        <div className="text-xs text-gray-400 mb-1">Stats</div>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <div className="text-xs font-bold text-blue-400">{gameProgress.clearedTiles}</div>
            <div className="text-xs text-gray-400">Tiles</div>
          </div>
          <div>
            <div className="text-xs font-bold text-purple-400">{gameProgress.specialTilesCreated}</div>
            <div className="text-xs text-gray-400">Special</div>
          </div>
          <div>
            <div className="text-xs font-bold text-orange-400">{gameProgress.cascades}</div>
            <div className="text-xs text-gray-400">Cascades</div>
          </div>
        </div>
      </div>
    </div>
  );
};
