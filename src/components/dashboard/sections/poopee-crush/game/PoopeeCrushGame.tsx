
import { useState } from "react";
import { EnhancedGameBoard } from "./EnhancedGameBoard";
import { GameHUD } from "./GameHUD";
import { BoosterPanel } from "./BoosterPanel";
import { GameOverScreen } from "./GameOverScreen";
import { useEnhancedGameState } from "./useEnhancedGameState";
import { BoosterType } from "./BoosterSystem";
import { DifficultyLevel } from "./DifficultySelector";
import { Position } from "./EnhancedGameEngine";
import { usePoopeeCrushCredits } from "../usePoopeeCrushCredits";

interface PoopeeCrushGameProps {
  onGameEnd: (score: number, moves: number) => void;
  userId: string;
  difficulty: DifficultyLevel;
}

export const PoopeeCrushGame = ({ onGameEnd, userId, difficulty }: PoopeeCrushGameProps) => {
  const [hammerMode, setHammerMode] = useState(false);
  const { spendCredits } = usePoopeeCrushCredits(userId);

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

  const handleBoosterUse = (type: BoosterType, targetTile?: Position): boolean => {
    console.log(`🔧 [PoopeeCrushGame] Using booster: ${type}`);
    
    if (type === BoosterType.HAMMER && targetTile) {
      try {
        spendCredits.mutate({
          amount: 0.5,
          description: 'Used Hammer booster in POOPEE Crush'
        });
        
        const success = useBooster(type, targetTile);
        // Always clear hammer mode after use, regardless of success
        setHammerMode(false);
        return success;
      } catch (error) {
        console.error('❌ [PoopeeCrushGame] Failed to spend credits for hammer:', error);
        setHammerMode(false);
        return false;
      }
    }
    
    return useBooster(type, targetTile);
  };

  const handleTileClickWithHammer = (row: number, col: number) => {
    if (hammerMode) {
      // Use hammer on the clicked tile
      const success = handleBoosterUse(BoosterType.HAMMER, { row, col });
      console.log(`🔨 [PoopeeCrushGame] Hammer used on (${row}, ${col}), success: ${success}`);
    } else {
      handleTileClick(row, col);
    }
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
          onTileClick={handleTileClickWithHammer}
          animations={animations}
          hammerMode={hammerMode}
        />
      </div>
      
      <div className="lg:col-span-1">
        <BoosterPanel
          gameActive={gameState.gameActive}
          onUseBooster={handleBoosterUse}
          gameProgress={gameState.gameProgress}
          userId={userId}
          onHammerModeChange={setHammerMode}
          hammerMode={hammerMode}
        />
      </div>
    </div>
  );
};
