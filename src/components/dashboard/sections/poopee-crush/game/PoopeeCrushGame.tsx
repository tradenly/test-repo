
import { useState } from "react";
import { EnhancedGameBoard } from "./EnhancedGameBoard";
import { GameHUD } from "./GameHUD";
import { BoosterPanel } from "./BoosterPanel";
import { GameOverScreen } from "./GameOverScreen";
import { useEnhancedGameState } from "./useEnhancedGameState";
import { BoosterType } from "./BoosterSystem";
import { DifficultyLevel } from "./DifficultySelector";

interface PoopeeCrushGameProps {
  onGameEnd: (score: number, moves: number) => void;
  userId: string;
  difficulty: DifficultyLevel;
}

export const PoopeeCrushGame = ({ onGameEnd, userId, difficulty }: PoopeeCrushGameProps) => {
  const {
    gameState,
    animations,
    handleTileClick,
    useBooster,
    startNewGame,
    quitGame,
    restartGame
  } = useEnhancedGameState(difficulty, handleGameEnd);

  // Start new game on component mount
  useState(() => {
    startNewGame();
  });

  function handleGameEnd(finalScore: number) {
    console.log(`🔚 Game ended with final score: ${finalScore}`);
    const movesUsed = gameState.gameProgress.maxMoves - gameState.gameProgress.moves;
    onGameEnd(finalScore, movesUsed);
  }

  const handleBoosterUse = (type: BoosterType): boolean => {
    console.log(`🔧 [PoopeeCrushGame] Using booster: ${type}`);
    return useBooster(type);
  };

  if (gameState.gameOver) {
    return (
      <GameOverScreen
        finalScore={gameState.gameProgress.score}
        onRestart={restartGame}
        onQuit={quitGame}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
      <div className="lg:col-span-1">
        <GameHUD 
          gameProgress={gameState.gameProgress}
          onQuit={quitGame}
          onRestart={restartGame}
          difficulty={difficulty}
        />
      </div>
      
      <div className="lg:col-span-3">
        <EnhancedGameBoard
          board={gameState.board}
          selectedTile={gameState.selectedTile}
          hintTiles={gameState.hintTiles}
          onTileClick={handleTileClick}
          animations={animations}
        />
      </div>
      
      <div className="lg:col-span-1">
        <BoosterPanel
          gameActive={gameState.gameActive}
          onUseBooster={handleBoosterUse}
          gameProgress={gameState.gameProgress}
          userId={userId}
        />
      </div>
    </div>
  );
};
