
import React from 'react';
import { useGameState } from './useGameState';
import { useGameCanvasState } from './hooks/useGameCanvasState';
import { useShieldManagement } from './hooks/useShieldManagement';
import { useGameEngineManager } from './hooks/useGameEngineManager';
import { GameControls } from './components/GameControls';
import { MobileGameControls } from './components/MobileGameControls';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameCanvasProps {
  onGameEnd: (score: number, pipesPassedCount: number, duration: number) => void;
  onGameStart: () => void;
  canPlay: boolean;
  credits: number;
}

export const GameCanvas = ({ onGameEnd, onGameStart, canPlay, credits }: GameCanvasProps) => {
  const isMobile = useIsMobile();
  
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
    gameSpeed,
    startGame: startGameState,
    endGame,
    resetGame: resetGameState,
    buyShields: buyShieldsState,
    changeSpeed
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
    gameSpeed,
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

  // Touch handlers for mobile
  const handleCanvasTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    if (gameState === 'playing' && gameRef.current) {
      gameRef.current.flap();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (gameState === 'playing' && gameRef.current) {
      gameRef.current.flap();
    }
  };

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-col lg:flex-row'} items-center gap-4`}>
      {/* Mobile Controls - Show above canvas on mobile */}
      {isMobile && (
        <div className="w-full max-w-md order-1">
          <MobileGameControls
            gameState={gameState}
            score={score}
            totalShields={totalShields}
            credits={credits}
            canPlay={canPlay}
            isInitialized={isInitialized}
            gameSpeed={gameSpeed}
            onStartGame={handleStartGame}
            onResetGame={handleResetGame}
            onBuyShields={buyShields}
            onSpeedChange={changeSpeed}
            isPurchasing={isPurchasing}
          />
        </div>
      )}

      {/* Game Canvas */}
      <div className={`${isMobile ? 'order-2' : ''}`}>
        <canvas 
          ref={canvasRef}
          className="border-2 border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ 
            maxWidth: isMobile ? '100%' : '800px', 
            height: 'auto',
            touchAction: 'none' // Prevent scrolling on touch
          }}
          tabIndex={gameState === 'playing' ? 0 : -1}
          role="application"
          aria-label="Flappy Hippos Game Canvas"
          aria-describedby="game-instructions"
          onTouchStart={handleCanvasTouch}
          onTouchEnd={(e) => e.preventDefault()}
          onClick={handleCanvasClick}
        />
        
        <div id="game-instructions" className="sr-only">
          {isMobile 
            ? "Tap anywhere on the screen to make the hippo jump and avoid obstacles."
            : "Use spacebar or click to make the hippo jump and avoid obstacles. Collect power-ups for extra points."
          }
        </div>
      </div>
      
      {/* Desktop Controls - Show beside canvas on desktop */}
      {!isMobile && (
        <div className="flex flex-col gap-2">
          <GameControls
            gameState={gameState}
            score={score}
            totalShields={totalShields}
            credits={credits}
            canPlay={canPlay}
            isInitialized={isInitialized}
            gameSpeed={gameSpeed}
            gameRef={gameRef}
            onStartGame={handleStartGame}
            onResetGame={handleResetGame}
            onBuyShields={buyShields}
            onSpeedChange={changeSpeed}
            isPurchasing={isPurchasing}
          />
        </div>
      )}
    </div>
  );
};
