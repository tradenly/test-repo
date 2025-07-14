
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GameProgress } from "./EnhancedGameEngine";
import { DifficultyLevel } from "./DifficultySelector";

interface GameHUDProps {
  gameProgress: GameProgress;
  onQuit: () => void;
  onRestart: () => void;
  difficulty: DifficultyLevel;
}

export const GameHUD = ({ gameProgress, onQuit, onRestart, difficulty }: GameHUDProps) => {
  const scoreProgress = Math.min(100, (gameProgress.score / gameProgress.targetScore) * 100);

  return (
    <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-3 h-fit">
      {/* Game Header */}
      <div className="mb-3">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-md p-2 mb-2">
          <h2 className="text-lg font-bold text-white text-center">POOPEE Crush</h2>
        </div>
        <div className="text-sm text-gray-300 text-center">
          <span className="text-yellow-400 font-semibold">{gameProgress.moves}</span> moves left
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-3 space-y-2">
        <Button onClick={onRestart} variant="outline" size="sm" className="w-full text-xs">
          New Game
        </Button>
        <Button onClick={onQuit} variant="destructive" size="sm" className="w-full text-xs">
          Quit Game
        </Button>
      </div>

      {/* Score and Difficulty */}
      <div className="mb-3 space-y-2">
        <div>
          <div className="text-xs text-gray-300 mb-1">Score</div>
          <div className="text-base font-semibold text-white">{gameProgress.score.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Target: {gameProgress.targetScore.toLocaleString()}</div>
          <Progress value={scoreProgress} className="h-1.5 bg-gray-700 mt-1" />
          <div className="text-xs text-gray-400 mt-1">
            {scoreProgress.toFixed(1)}% complete
          </div>
        </div>
        
        <div>
          <div className="text-xs text-gray-300 mb-1">Difficulty</div>
          <div className={`text-xs font-semibold ${
            difficulty === 'easy' ? 'text-green-400' :
            difficulty === 'medium' ? 'text-yellow-400' :
            difficulty === 'advanced' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {difficulty.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Game Stats */}
      <div className="space-y-2">
        <div className="text-xs text-gray-400 mb-1">Game Stats</div>
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
