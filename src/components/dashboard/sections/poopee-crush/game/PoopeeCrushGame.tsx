
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedGameBoard } from "./EnhancedGameBoard";
import { LevelHUD } from "./LevelHUD";
import { BoosterPanel } from "./BoosterPanel";
import { LevelCompleteScreen } from "./LevelCompleteScreen";
import { GameOverScreen } from "./GameOverScreen";
import { AudioControls } from "./AudioControls";
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
    startNewLevel,
    resumeGame,
    quitGame,
    continueToNextLevel,
    restartLevel
  } = useEnhancedGameState(difficulty, handleLevelComplete, handleGameEnd);

  useEffect(() => {
    console.log(`🎮 [PoopeeCrushGame] Starting with difficulty: ${difficulty}`);
    
    const resumed = resumeGame();
    if (!resumed) {
      startNewLevel(1);
    }
  }, [difficulty, resumeGame, startNewLevel]);

  function handleLevelComplete(level: number, score: number, stars: number) {
    console.log(`🎉 Level ${level} complete! Score: ${score}, Stars: ${stars}`);
  }

  function handleGameEnd(finalScore: number) {
    console.log(`🔚 Game ended with final score: ${finalScore}`);
    const movesUsed = gameState.gameProgress.maxMoves - gameState.gameProgress.moves;
    onGameEnd(finalScore, movesUsed);
  }

  const handleBoosterUse = (type: BoosterType, targetTile?: Position): boolean => {
    console.log(`🔧 [PoopeeCrushGame] Using booster: ${type}`);
    
    if (type === BoosterType.HAMMER && targetTile) {
      try {
        // For hammer, we'll spend credits synchronously
        // Note: In a real implementation, you might want to handle this differently
        spendCredits.mutate({
          amount: 0.5,
          description: 'Used Hammer booster in POOPEE Crush'
        });
        
        setHammerMode(false);
        return useBooster(type, targetTile);
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
      handleBoosterUse(BoosterType.HAMMER, { row, col });
    } else {
      handleTileClick(row, col);
    }
  };

  if (gameState.levelComplete) {
    return (
      <LevelCompleteScreen
        level={gameState.gameProgress.currentLevel}
        score={gameState.gameProgress.score}
        stars={gameState.starRating}
        onContinue={continueToNextLevel}
        onRestart={restartLevel}
        onQuit={quitGame}
      />
    );
  }

  if (gameState.gameOver) {
    return (
      <GameOverScreen
        finalScore={gameState.gameProgress.score}
        level={gameState.gameProgress.currentLevel}
        onRestart={restartLevel}
        onQuit={quitGame}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-white">
          <h3 className="text-lg font-semibold">Level {gameState.gameProgress.currentLevel}</h3>
          <p className="text-sm text-gray-400">Difficulty: {difficulty}</p>
        </div>
        <div className="flex gap-2">
          <AudioControls gameActive={gameState.gameActive} />
          <Button
            onClick={quitGame}
            variant="outline"
            size="sm"
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            Quit Game
          </Button>
        </div>
      </div>

      <LevelHUD 
        gameProgress={gameState.gameProgress} 
        levelConfig={gameState.levelConfig} 
        onQuit={quitGame}
        onRestart={restartLevel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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
    </div>
  );
};
