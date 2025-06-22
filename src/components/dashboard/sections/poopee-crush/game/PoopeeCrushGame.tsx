
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EnhancedGameBoard } from "./EnhancedGameBoard";
import { LevelHUD } from "./LevelHUD";
import { LevelCompleteScreen } from "./LevelCompleteScreen";
import { GameOverScreen } from "./GameOverScreen";
import { BoosterPanel } from "./BoosterPanel";
import { AudioControls } from "./AudioControls";
import { useEnhancedGameState } from "./useEnhancedGameState";
import { usePoopeeCrushCredits } from "../usePoopeeCrushCredits";
import { useGameAudio } from "@/hooks/useGameAudio";
import { BoosterType } from "./BoosterSystem";
import { toast } from "sonner";

interface PoopeeCrushGameProps {
  onGameEnd: (score: number, moves: number) => void;
  userId: string;
}

export const PoopeeCrushGame = ({ onGameEnd, userId }: PoopeeCrushGameProps) => {
  const [hammerMode, setHammerMode] = useState(false);
  const { spendCredits, checkCanAfford } = usePoopeeCrushCredits(userId);
  const { 
    playBackgroundMusic, 
    stopBackgroundMusic, 
    playSoundEffect, 
    settings 
  } = useGameAudio();
  
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
      playSoundEffect('levelComplete');
    },
    (finalScore: number) => {
      console.log(`💀 Game over with final score: ${finalScore}`);
      playSoundEffect('gameOver');
      stopBackgroundMusic();
      onGameEnd(finalScore, 0);
    }
  );

  // Start background music when game becomes active
  useEffect(() => {
    if (gameState.gameActive && settings.musicEnabled) {
      playBackgroundMusic();
    } else if (!gameState.gameActive) {
      stopBackgroundMusic();
    }
  }, [gameState.gameActive, settings.musicEnabled, playBackgroundMusic, stopBackgroundMusic]);

  // Try to resume game on component mount
  useEffect(() => {
    const resumed = resumeGame();
    if (!resumed) {
      startNewLevel(1);
    }
  }, []);

  const handleHammerTarget = async (row: number, col: number) => {
    if (!hammerMode) return;
    
    try {
      await spendCredits.mutateAsync({
        amount: 0.5,
        description: "Used Hammer booster in POOPEE Crush"
      });
      
      const success = useBooster(BoosterType.HAMMER, { row, col });
      
      if (success) {
        playSoundEffect('hammer');
        toast.success("Hammer used successfully!");
        setHammerMode(false);
      } else {
        toast.error("Failed to use hammer");
      }
    } catch (error) {
      console.error("Failed to use hammer:", error);
      toast.error("Failed to use hammer");
      setHammerMode(false);
    }
  };

  const handleBoosterUse = (type: BoosterType, targetTile?: {row: number, col: number}) => {
    if (type === BoosterType.HAMMER && targetTile) {
      return useBooster(type, targetTile);
    }
    
    // Play sound effect for booster usage
    if (type === BoosterType.SHUFFLE) {
      playSoundEffect('shuffle');
    } else if (type === BoosterType.HINT) {
      playSoundEffect('hint');
    } else {
      playSoundEffect('booster');
    }
    
    return useBooster(type, targetTile);
  };

  const handleRestartWithCredit = async () => {
    const canAfford = await checkCanAfford(1);
    if (!canAfford) {
      toast.error("You need 1 credit to restart the level");
      return;
    }
    
    try {
      await spendCredits.mutateAsync({
        amount: 1,
        description: "Restarted level in POOPEE Crush"
      });
      
      startNewLevel(gameState.gameProgress.currentLevel);
      toast.success("Level restarted!");
    } catch (error) {
      console.error("Failed to restart level:", error);
      toast.error("Failed to restart level");
    }
  };

  const handleQuit = () => {
    setHammerMode(false);
    stopBackgroundMusic();
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
        onRestart={handleRestartWithCredit}
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
    <Card className="bg-gray-900/50 border-gray-600">
      <CardContent className="p-4">
        {/* Enhanced Layout: Level HUD | Game Board | Controls (Boosters + Audio) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[600px]">
          {/* Level HUD - Left Side (Desktop) / Top (Mobile) */}
          <div className="lg:col-span-3 order-1">
            <LevelHUD
              gameProgress={gameState.gameProgress}
              levelConfig={gameState.levelConfig}
              onQuit={handleQuit}
              onRestart={handleRestartWithCredit}
            />
          </div>

          {/* Game Board - Center */}
          <div className="lg:col-span-6 order-2 flex justify-center items-center">
            <EnhancedGameBoard
              board={gameState.board}
              onTileClick={handleTileClick}
              selectedTile={gameState.selectedTile}
              hintTiles={gameState.hintTiles}
              animations={animations}
              hammerMode={hammerMode}
              onHammerTarget={handleHammerTarget}
            />
          </div>

          {/* Controls Panel - Right Side (Desktop) / Bottom (Mobile) */}
          <div className="lg:col-span-3 order-3 space-y-4">
            <BoosterPanel
              gameActive={gameState.gameActive}
              onUseBooster={handleBoosterUse}
              gameProgress={gameState.gameProgress}
              userId={userId}
              onHammerModeChange={setHammerMode}
              hammerMode={hammerMode}
            />
            
            <AudioControls gameActive={gameState.gameActive} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
