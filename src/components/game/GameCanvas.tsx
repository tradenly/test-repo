
import React from 'react';
import { useGameState } from './useGameState';
import { useGameCanvasState } from './hooks/useGameCanvasState';
import { useShieldManagement } from './hooks/useShieldManagement';
import { useGameEngineManager } from './hooks/useGameEngineManager';
import { GameControls } from './components/GameControls';

interface GameCanvasProps {
  onGameEnd: (score: number, pipesPassedCount: number, duration: number) => void;
  onGameStart: () => void;
  canPlay: boolean;
  credits: number;
}

export const GameCanvas = ({ onGameEnd, onGameStart, canPlay, credits }: GameCanvasProps) => {
  // State management
  const {
    canvasRef,
    gameRef,
    isInitialized,
    setIsInitialized,
    initializationRef
  } = useGameCanvasState();

  const {
    gameState,
    score,
    setScore,
    totalShields,
    startGame: startGameState,
    endGame,
    resetGame: resetGameState,
    buyShields: buyShieldsState
  } = useGameState();

  // Shield management
  const { updateGameEngineShields, buyShields, isPurchasing } = useShieldManagement({
    gameRef,
    credits,
    totalShields,
    buyShieldsState
  });

  // Game engine management
  const { startGame: engineStartGame, resetGame: engineResetGame } = useGameEngineManager({
    canvasRef,
    gameRef,
    isInitialized,
    setIsInitialized,
    initializationRef,
    totalShields,
    onGameEnd: (finalScore: number, pipesPassedCount: number, duration: number) => {
      endGame();
      onGameEnd(finalScore, pipesPassedCount, duration);
    },
    setScore,
    updateGameEngineShields
  });

  const handleStartGame = () => {
    if (!canPlay || !isInitialized) {
      console.log("❌ Cannot start game - conditions not met:", { canPlay, isInitialized });
      return;
    }
    
    onGameStart();
    startGameState();
    engineStartGame();
  };

  const handleResetGame = () => {
    resetGameState();
    engineResetGame();
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-3">
      <canvas 
        ref={canvasRef}
        className="border-2 border-gray-300 rounded-lg shadow-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      <div className="flex flex-col gap-2">
        <GameControls
          gameState={gameState}
          score={score}
          totalShields={totalShields}
          credits={credits}
          canPlay={canPlay}
          isInitialized={isInitialized}
          gameRef={gameRef}
          onStartGame={handleStartGame}
          onResetGame={handleResetGame}
          onBuyShields={buyShields}
          isPurchasing={isPurchasing}
        />
      </div>
    </div>
  );
};
