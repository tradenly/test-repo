
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSpendCredits } from "@/hooks/useCreditOperations";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { toast } from "sonner";
import { GameEngine } from './GameEngine';
import { GameMenu, GameOver } from './GameUI';
import { useGameState } from './useGameState';

interface GameCanvasProps {
  onGameEnd: (score: number, pipesPassedCount: number, duration: number) => void;
  onGameStart: () => void;
  canPlay: boolean;
  credits: number;
}

export const GameCanvas = ({ onGameEnd, onGameStart, canPlay, credits }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);
  
  const { user } = useUnifiedAuth();
  const spendCredits = useSpendCredits();
  
  const {
    gameState,
    score,
    setScore,
    gameStartTime,
    totalShields,
    startGame: startGameState,
    endGame,
    resetGame: resetGameState,
    buyShields: buyShieldsState
  } = useGameState();

  // Stable callback references
  const handleGameEndRef = useRef<(finalScore: number, pipesPassedCount: number, duration: number) => void>();
  const setScoreRef = useRef<(score: number) => void>();

  // Update refs when callbacks change
  useEffect(() => {
    handleGameEndRef.current = (finalScore: number, pipesPassedCount: number, duration: number) => {
      endGame();
      onGameEnd(finalScore, pipesPassedCount, duration);
    };
  }, [endGame, onGameEnd]);

  useEffect(() => {
    setScoreRef.current = setScore;
  }, [setScore]);

  // Centralized shield management function
  const updateGameEngineShields = useCallback((newTotalShields: number) => {
    console.log("🛡️ Updating game engine shields to:", newTotalShields);
    if (gameRef.current) {
      gameRef.current.updateShields(newTotalShields);
    }
  }, []);

  const startGame = useCallback(() => {
    if (!canPlay || !isInitialized || !gameRef.current) {
      console.log("❌ Cannot start game - conditions not met:", { canPlay, isInitialized, gameRef: !!gameRef.current });
      return;
    }
    
    onGameStart();
    startGameState();
    
    // Immediately update game engine with current shields and start
    updateGameEngineShields(totalShields);
    gameRef.current.start();
  }, [canPlay, onGameStart, isInitialized, totalShields, startGameState, updateGameEngineShields]);

  const resetGame = useCallback(() => {
    resetGameState();
    
    // Reset game engine to 3 shields
    if (gameRef.current) {
      gameRef.current.reset(3);
    }
  }, [resetGameState]);

  const buyShields = useCallback(async () => {
    if (!user?.id || credits < 5) {
      toast.error("Not enough credits to buy shields!");
      return;
    }

    console.log("💰 Purchasing shields...");
    try {
      await spendCredits.mutateAsync({
        userId: user.id,
        amount: 5,
        description: "Purchased 3 shields in Flappy Hippos"
      });
      
      // Update state first
      buyShieldsState();
      
      // Calculate new total and immediately sync with game engine
      const newTotalShields = totalShields + 3;
      updateGameEngineShields(newTotalShields);
      
      toast.success("3 shields purchased! They are added to your current game.");
    } catch (error) {
      console.error("Error purchasing shields:", error);
      toast.error("Failed to purchase shields");
    }
  }, [user?.id, credits, spendCredits, buyShieldsState, totalShields, updateGameEngineShields]);

  // Game engine initialization - only create once and prevent multiple initializations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || initializationRef.current) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log("Canvas context not found");
      return;
    }

    console.log("🎮 Initializing game engine...");
    initializationRef.current = true;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 570;

    try {
      if (gameRef.current) {
        gameRef.current.cleanup();
      }
      
      gameRef.current = new GameEngine(
        ctx, 
        canvas, 
        (score, pipes, duration) => handleGameEndRef.current?.(score, pipes, duration),
        (score) => setScoreRef.current?.(score)
      );
      setIsInitialized(true);
      console.log("🎮 Game engine created and initialized");
    } catch (error) {
      console.error("❌ Error creating game engine:", error);
      initializationRef.current = false;
    }

    return () => {
      console.log("🧹 Component unmounting, cleaning up...");
      if (gameRef.current) {
        gameRef.current.cleanup();
        gameRef.current = null;
      }
      initializationRef.current = false;
      setIsInitialized(false);
    };
  }, []); // Empty dependency array to prevent recreation

  // Update game engine shields whenever totalShields changes
  useEffect(() => {
    if (isInitialized && gameRef.current) {
      console.log("🛡️ Total shields changed to:", totalShields, "- syncing game engine");
      updateGameEngineShields(totalShields);
    }
  }, [totalShields, isInitialized, updateGameEngineShields]);

  return (
    <div className="flex flex-col lg:flex-row items-start gap-3">
      <canvas 
        ref={canvasRef}
        className="border-2 border-gray-300 rounded-lg shadow-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      <div className="flex flex-col gap-2">
        {gameState === 'menu' && (
          <GameMenu 
            credits={credits}
            totalShields={totalShields}
            canPlay={canPlay}
            isInitialized={isInitialized}
            onStartGame={startGame}
            onBuyShields={buyShields}
            isPurchasing={spendCredits.isPending}
          />
        )}

        {gameState === 'gameOver' && (
          <GameOver 
            score={score}
            currentShields={gameRef.current?.getCurrentShields() || 0}
            totalShields={totalShields}
            credits={credits}
            canPlay={canPlay}
            isInitialized={isInitialized}
            onResetGame={resetGame}
            onStartGame={startGame}
            onBuyShields={buyShields}
            isPurchasing={spendCredits.isPending}
          />
        )}
      </div>
    </div>
  );
};
