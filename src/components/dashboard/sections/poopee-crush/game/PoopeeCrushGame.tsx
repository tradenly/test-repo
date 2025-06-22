
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedGameBoard } from "./EnhancedGameBoard";
import { LevelHUD } from "./LevelHUD";
import { LevelCompleteScreen } from "./LevelCompleteScreen";
import { GameOverScreen } from "./GameOverScreen";
import { BoosterPanel } from "./BoosterPanel";
import { useEnhancedGameState } from "./useEnhancedGameState";

interface PoopeeCrushGameProps {
  onGameEnd: (score: number, moves: number) => void;
}

export const PoopeeCrushGame = ({ onGameEnd }: PoopeeCrushGameProps) => {
  const {
    gameState,
    animations,
    handleTileClick,
    startNewLevel,
    resumeGame,
    quitGame,
    useBooster,
    continueToNextLevel,
    restartLevel
  } = useEnhancedGameState(
    (level: number, score: number, stars: number) => {
      console.log(`🏆 Level ${level} completed with ${score} points and ${stars} stars`);
      // Level completed - don't end game, just show completion screen
    },
    (finalScore: number) => {
      console.log(`💀 Game over with final score: ${finalScore}`);
      onGameEnd(finalScore, 0); // 0 moves as this is now level-based
    }
  );

  // Try to resume game on component mount
  useEffect(() => {
    const resumed = resumeGame();
    if (!resumed) {
      startNewLevel(1);
    }
  }, []);

  const handleQuit = () => {
    quitGame();
  };

  // Show level complete screen
  if (gameState.levelComplete && gameState.gameActive) {
    return (
      <LevelCompleteScreen
        level={gameState.gameProgress.currentLevel}
        score={gameState.gameProgress.score}
        starRating={gameState.starRating}
        levelConfig={gameState.levelConfig}
        onContinue={continueToNextLevel}
        onRestart={restartLevel}
        onQuit={handleQuit}
      />
    );
  }

  // Show game over screen
  if (gameState.gameOver || (!gameState.gameActive && gameState.gameProgress.moves <= 0)) {
    return (
      <GameOverScreen
        finalScore={gameState.gameProgress.score}
        level={gameState.gameProgress.currentLevel}
        onRestart={() => startNewLevel(1)}
        onQuit={handleQuit}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Level HUD */}
      <LevelHUD
        gameProgress={gameState.gameProgress}
        levelConfig={gameState.levelConfig}
        onQuit={handleQuit}
        onRestart={() => startNewLevel(gameState.gameProgress.currentLevel)}
      />

      {/* Booster Panel */}
      <BoosterPanel
        gameActive={gameState.gameActive}
        onUseBooster={useBooster}
        gameProgress={gameState.gameProgress}
      />

      {/* Game Board */}
      <Card className="bg-gray-900/50 border-gray-600">
        <CardContent className="p-4">
          <EnhancedGameBoard
            board={gameState.board}
            onTileClick={handleTileClick}
            selectedTile={gameState.selectedTile}
            hintTiles={gameState.hintTiles}
            animations={animations}
          />
        </CardContent>
      </Card>
    </div>
  );
};
