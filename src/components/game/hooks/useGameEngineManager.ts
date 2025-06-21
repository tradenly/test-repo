

import { useEffect, useCallback } from 'react';
import { GameEngine } from '../GameEngine';
import type { GameSpeed } from '../useGameState';

interface UseGameEngineManagerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  gameRef: React.MutableRefObject<GameEngine | null>;
  isInitialized: boolean;
  setIsInitialized: (value: boolean) => void;
  initializationRef: React.MutableRefObject<boolean>;
  totalShields: number;
  gameSpeed: GameSpeed;
  onGameEnd: (score: number, pipesPassedCount: number, duration: number) => void;
  setScore: (score: number) => void;
  updateGameEngineShields: () => void;
}

export const useGameEngineManager = ({
  canvasRef,
  gameRef,
  isInitialized,
  setIsInitialized,
  initializationRef,
  totalShields,
  gameSpeed,
  onGameEnd,
  setScore,
  updateGameEngineShields
}: UseGameEngineManagerProps) => {

  // Initialize game engine
  useEffect(() => {
    if (!canvasRef.current || initializationRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 600;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("❌ Failed to get canvas context");
      return;
    }

    console.log("🎮 Initializing game engine...");
    initializationRef.current = true;

    try {
      const gameEngine = new GameEngine(
        ctx,
        canvas,
        onGameEnd,
        setScore
      );

      gameRef.current = gameEngine;
      setIsInitialized(true);
      console.log("✅ Game engine initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize game engine:", error);
      initializationRef.current = false;
    }
  }, [canvasRef, gameRef, onGameEnd, setScore, setIsInitialized, initializationRef]);

  // Update shields when they change
  useEffect(() => {
    if (gameRef.current && isInitialized) {
      console.log("🛡️ useGameEngineManager: Shield update triggered - totalShields:", totalShields);
      updateGameEngineShields();
    }
  }, [totalShields, isInitialized, updateGameEngineShields]);

  // Update speed when it changes
  useEffect(() => {
    if (gameRef.current && isInitialized) {
      console.log("🏃 Updating game speed to:", gameSpeed);
      gameRef.current.setGameSpeed(gameSpeed);
    }
  }, [gameSpeed, isInitialized]);

  const startGame = useCallback(() => {
    if (gameRef.current && isInitialized) {
      console.log("🎯 useGameEngineManager: Starting game with speed:", gameSpeed, "and shields:", totalShields);
      gameRef.current.start();
    }
  }, [isInitialized, gameSpeed, totalShields]);

  const resetGame = useCallback(() => {
    if (gameRef.current && isInitialized) {
      console.log("🔄 useGameEngineManager: Resetting game engine with shields:", totalShields);
      gameRef.current.reset(totalShields);
    }
  }, [isInitialized, totalShields]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameRef.current) {
        console.log("🧹 Cleaning up game engine");
        gameRef.current.cleanup();
        gameRef.current = null;
      }
    };
  }, [gameRef]);

  return {
    startGame,
    resetGame
  };
};

