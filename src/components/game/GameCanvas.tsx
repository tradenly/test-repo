import React from 'react';
import { useGameState } from './useGameState';
import { useGameCanvasState } from './hooks/useGameCanvasState';
import { useShieldManagement } from './hooks/useShieldManagement';
import { useGameEngineManager } from './hooks/useGameEngineManager';
import { GameControls } from './components/GameControls';
import { MobileGameControls } from './components/MobileGameControls';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';

interface GameCanvasProps {
  onGameEnd: (score: number, pipesPassedCount: number, duration: number) => void;
  onGameStart: () => void;
  canPlay: boolean;
  credits: number;
  gameMode?: 'flappy_hippos' | 'miss_poopee_man';
}

export const GameCanvas = ({ onGameEnd, onGameStart, canPlay, credits, gameMode = 'flappy_hippos' }: GameCanvasProps) => {
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
    countdown,
    startGame: startGameState,
    endGame,
    playAgain, // NEW: Use playAgain instead of resetGame for preserving shields
    resetGame: resetGameState, // Keep full reset for Reset button
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
    updateGameEngineShields,
    gameMode
  });

  const handleStartGame = () => {
    if (!canPlay || !isInitialized) {
      console.log("❌ Cannot start game - conditions not met:", { canPlay, isInitialized });
      return;
    }
    
    onGameStart();
    startGameState();
    
    // Delay the engine start for mobile countdown
    if (isMobile) {
      setTimeout(() => {
        engineStartGame();
      }, 3000); // 3 second countdown
    } else {
      engineStartGame();
    }
  };

  // NEW: Handle Play Again (preserves shields)
  const handlePlayAgain = () => {
    console.log("🔄 Play Again clicked - preserving shields");
    playAgain(); // Use playAgain instead of resetGame
    engineResetGame();
  };

  // MODIFIED: Handle Full Reset (clears shields)
  const handleResetGame = () => {
    console.log("🔄 Full Reset clicked - clearing shields");
    resetGameState(); // Full reset clears purchased shields
    engineResetGame();
  };

  // Enhanced touch handlers for mobile
  const handleCanvasTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-col lg:flex-row'} items-center gap-4 relative`}>
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
              countdown={countdown}
              onStartGame={handleStartGame}
              onResetGame={handleResetGame}
              onBuyShields={buyShields}
              onSpeedChange={changeSpeed}
              isPurchasing={isPurchasing}
              gameMode={gameMode}
            />
        </div>
      )}

      {/* Game Canvas Container */}
      <div className={`relative ${isMobile ? 'order-2' : ''}`}>
        <canvas 
          ref={canvasRef}
          className="border-2 border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-sky-200"
          style={{ 
            maxWidth: isMobile ? '100%' : '800px',
            width: isMobile ? '350px' : '800px',
            height: isMobile ? '500px' : '600px',
            touchAction: 'none',
            // Enhanced emoji font rendering
            fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", system-ui, sans-serif',
            fontWeight: 'bold'
          }}
          tabIndex={gameState === 'playing' ? 0 : -1}
          role="application"
          aria-label="Flappy Hippos Game Canvas"
          aria-describedby="game-instructions"
          onTouchStart={handleCanvasTouch}
          onTouchEnd={(e) => e.preventDefault()}
          onClick={handleCanvasClick}
        />
        
        {/* Mobile-only centered start button overlay */}
        {isMobile && gameState === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
            <Button
              onClick={handleStartGame}
              disabled={!canPlay || !isInitialized}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg transform transition-transform active:scale-95"
              style={{ minHeight: '60px', minWidth: '160px' }}
            >
              <Play className="h-6 w-6 mr-2" />
              {!isInitialized ? 'Loading...' : canPlay ? 'TAP TO START' : 'No Credits'}
            </Button>
          </div>
        )}

        {/* Mobile countdown overlay when starting */}
        {isMobile && gameState === 'starting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-2 animate-pulse">
                {countdown > 0 ? countdown : 'GO!'}
              </div>
              <div className="text-lg text-gray-200">Get Ready!</div>
            </div>
          </div>
        )}

        {/* UPDATED: Mobile-only centered game over overlay with Play Again */}
        {isMobile && gameState === 'gameOver' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
            <div className="bg-gray-800/95 rounded-xl p-6 text-center shadow-xl border border-gray-600 max-w-xs w-full mx-4">
              <h3 className="text-2xl font-bold text-white mb-3">Game Over!</h3>
              <div className="text-4xl mb-3">💩</div>
              <p className="text-xl text-yellow-400 mb-4">Score: {score}</p>
              <p className="text-sm text-gray-300 mb-6">
                Shields: {gameRef.current?.getCurrentShields() || 0}/{totalShields}
              </p>
              
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handlePlayAgain}
                  disabled={!canPlay || !isInitialized}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg font-bold rounded-full shadow-lg transform transition-transform active:scale-95"
                  style={{ minHeight: '50px' }}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Play Again
                </Button>
                
                <Button
                  onClick={handleResetGame}
                  variant="outline"
                  className="border-gray-500 text-white hover:bg-gray-700 px-6 py-3 text-base rounded-full shadow-lg transform transition-transform active:scale-95"
                  style={{ minHeight: '50px' }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Game
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile touch instruction overlay when playing */}
        {isMobile && gameState === 'playing' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm animate-fade-in">
            Tap anywhere to flap! 💩
          </div>
        )}
        
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
            gameMode={gameMode}
          />
        </div>
      )}
    </div>
  );
};
