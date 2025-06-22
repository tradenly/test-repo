
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameBoard } from "./GameBoard";
import { useGameState } from "./useGameState";

interface PoopeeCrushGameProps {
  onGameEnd: (score: number, moves: number) => void;
}

export const PoopeeCrushGame = ({ onGameEnd }: PoopeeCrushGameProps) => {
  const {
    gameState,
    animations,
    handleTileClick,
    startNewGame,
    resumeGame,
    quitGame
  } = useGameState(onGameEnd);

  // Try to resume game on component mount
  useEffect(() => {
    const resumed = resumeGame();
    if (!resumed) {
      startNewGame();
    }
  }, []);

  const handleQuit = () => {
    quitGame();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 10000) return "text-purple-400";
    if (score >= 5000) return "text-blue-400";
    if (score >= 2500) return "text-green-400";
    if (score >= 1000) return "text-yellow-400";
    return "text-white";
  };

  const getMovesColor = (moves: number): string => {
    if (moves <= 5) return "text-red-400";
    if (moves <= 10) return "text-yellow-400";
    return "text-white";
  };

  if (!gameState.gameActive && gameState.moves <= 0) {
    return (
      <div className="space-y-4">
        <Card className="bg-gray-900/50 border-gray-600">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="text-2xl font-bold text-white">🎉 Game Complete!</div>
              <div className="text-xl text-gray-300">
                Final Score: <span className={getScoreColor(gameState.score)}>{gameState.score.toLocaleString()}</span>
              </div>
              <div className="text-gray-400">
                {gameState.score >= 10000 && "🏆 LEGENDARY PERFORMANCE!"}
                {gameState.score >= 5000 && gameState.score < 10000 && "⭐ EXCELLENT WORK!"}
                {gameState.score >= 2500 && gameState.score < 5000 && "👍 GREAT JOB!"}
                {gameState.score >= 1000 && gameState.score < 2500 && "👌 GOOD EFFORT!"}
                {gameState.score < 1000 && "Keep practicing to improve!"}
              </div>
              <Button
                onClick={startNewGame}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Game Header */}
      <div className="flex justify-between items-center">
        <div className="text-white">
          <div className={`text-2xl font-bold ${getScoreColor(gameState.score)}`}>
            Score: {gameState.score.toLocaleString()}
          </div>
          <div className={`text-lg ${getMovesColor(gameState.moves)}`}>
            Moves: {gameState.moves}
            {gameState.moves <= 5 && " ⚠️"}
          </div>
        </div>
        <div className="space-x-2">
          <Button
            onClick={startNewGame}
            variant="outline"
            className="bg-gray-600 hover:bg-gray-500 border-gray-500 text-white"
          >
            New Game
          </Button>
          <Button
            onClick={handleQuit}
            variant="outline"
            className="bg-red-600 hover:bg-red-500 border-red-500 text-white"
          >
            Quit Game
          </Button>
        </div>
      </div>

      {/* Scoring Guide */}
      <div className="bg-gray-800/40 rounded-lg p-3">
        <div className="text-center">
          <div className="text-white font-medium mb-2">💰 Scoring & Rewards</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-300">
            <div>1000+ pts: <span className="text-yellow-400">+0.5 credits</span></div>
            <div>2500+ pts: <span className="text-green-400">+1 credit</span></div>
            <div>5000+ pts: <span className="text-blue-400">+2 credits</span></div>
            <div>10000+ pts: <span className="text-purple-400">+5 credits</span></div>
          </div>
          <div className="text-xs text-yellow-400 mt-1">
            🏆 New high score = +1 bonus credit!
          </div>
        </div>
      </div>

      {/* Game Board */}
      <Card className="bg-gray-900/50 border-gray-600">
        <CardContent className="p-4">
          <GameBoard
            board={gameState.board}
            onTileClick={handleTileClick}
            selectedTile={gameState.selectedTile}
            animations={animations}
          />
        </CardContent>
      </Card>
    </div>
  );
};
