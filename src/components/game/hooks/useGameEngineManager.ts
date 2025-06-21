
import { useEffect, useRef, useCallback } from 'react';
import { GameEngine } from '../GameEngine';

interface UseGameEngineManagerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  gameRef: React.MutableRefObject<GameEngine | null>;
  isInitialized: boolean;
  setIsInitialized: (value: boolean) => void;
  initializationRef: React.MutableRefObject<boolean>;
  totalShields: number;
  onGameEnd: (score: number, pipesPassedCount: number, duration: number) => void;
  setScore: (score: number) => void;
  updateGameEngineShields: (shields: number) => void;
}

export const useGameEngineManager = ({
  canvasRef,
  gameRef,
  isInitialized,
  setIsInitialized,
  initializationRef,
  totalShields,
  onGameEnd,
  setScore,
  updateGameEngineShields
}: UseGameEngineManagerProps) => {
  
  // Stable callback references
  const handleGameEndRef = useRef<(finalScore: number, pipesPassedCount: number, duration: number) => void>();
  const setScoreRef = useRef<(score: number) => void>();

  // Update refs when callbacks change
  useEffect(() => {
    handleGameEndRef.current = (finalScore: number, pipesPassedCount: number, duration: number) => {
      onGameEnd(finalScore, pipesPassedCount, duration);
    };
  }, [onGameEnd]);

  useEffect(() => {
    setScoreRef.current = setScore;
  }, [setScore]);

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

    console.log("🎮 useGameEngineManager: Initializing game engine...");
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
      console.log("🎮 useGameEngineManager: Game engine created and initialized");
    } catch (error) {
      console.error("❌ Error creating game engine:", error);
      initializationRef.current = false;
    }

    return () => {
      console.log("🧹 useGameEngineManager: Component unmounting, cleaning up...");
      if (gameRef.current) {
        gameRef.current.cleanup();
        gameRef.current = null;
      }
      initializationRef.current = false;
      setIsInitialized(false);
    };
  }, []); // Empty dependency array to prevent recreation

  // Critical fix: Update game engine shields whenever totalShields changes
  useEffect(() => {
    console.log("🛡️ useGameEngineManager: totalShields changed to:", totalShields);
    if (isInitialized && gameRef.current) {
      console.log("🛡️ useGameEngineManager: Syncing shields with game engine");
      updateGameEngineShields(totalShields);
    }
  }, [totalShields, isInitialized, updateGameEngineShields]);

  const startGame = useCallback(() => {
    if (!isInitialized || !gameRef.current) {
      console.log("❌ useGameEngineManager: Cannot start game - conditions not met:", { isInitialized, gameRef: !!gameRef.current });
      return false;
    }
    
    console.log("🎯 useGameEngineManager: Starting game with shields:", totalShields);
    // Immediately update game engine with current shields and start
    updateGameEngineShields(totalShields);
    gameRef.current.start();
    return true;
  }, [isInitialized, totalShields, updateGameEngineShields]);

  const resetGame = useCallback(() => {
    console.log("🔄 useGameEngineManager: Resetting game engine to 3 shields");
    // Reset game engine to 3 shields
    if (gameRef.current) {
      gameRef.current.reset(3);
    }
  }, []);

  return {
    startGame,
    resetGame
  };
};
