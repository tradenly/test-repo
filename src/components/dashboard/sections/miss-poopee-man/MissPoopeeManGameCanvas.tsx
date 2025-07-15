import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MissPoopeeManEngine } from './MissPoopeeManEngine';

interface MissPoopeeManGameCanvasProps {
  onGameEnd: (score: number, pelletsCount: number, duration: number) => void;
  onGameStart: () => void;
  canPlay: boolean;
  credits: number;
}

export const MissPoopeeManGameCanvas = ({ 
  onGameEnd, 
  onGameStart, 
  canPlay, 
  credits 
}: MissPoopeeManGameCanvasProps) => {
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<MissPoopeeManEngine | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize game engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size will be set by the engine based on maze dimensions

    try {
      gameRef.current = new MissPoopeeManEngine(
        ctx,
        canvas,
        (finalScore: number, pelletsCount: number, duration: number) => {
          setGameState('gameOver');
          onGameEnd(finalScore, pelletsCount, duration);
        },
        (newScore: number) => {
          setScore(newScore);
        }
      );
      
      setIsInitialized(true);
      console.log("✅ Miss POOPEE-Man game engine initialized");
    } catch (error) {
      console.error("❌ Failed to initialize Miss POOPEE-Man game engine:", error);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.cleanup();
      }
    };
  }, [isMobile, onGameEnd]);

  const handleStartGame = () => {
    if (!canPlay || !isInitialized || !gameRef.current) {
      console.log("❌ Cannot start game - conditions not met:", { canPlay, isInitialized, gameRef: !!gameRef.current });
      return;
    }
    
    onGameStart();
    setGameState('playing');
    setScore(0);
    gameRef.current.start();
  };

  const handleResetGame = () => {
    if (gameRef.current) {
      gameRef.current.reset();
      setGameState('menu');
      setScore(0);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 relative">
      {/* Game Canvas Container */}
      <div className="relative">
        <canvas 
          ref={canvasRef}
          className="border-2 border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black"
          style={{ 
            maxWidth: '100%',
            touchAction: 'none',
          }}
          tabIndex={gameState === 'playing' ? 0 : -1}
          role="application"
          aria-label="Miss POOPEE-Man Game Canvas"
        />
        
        {/* Menu overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
            <Button
              onClick={handleStartGame}
              disabled={!canPlay || !isInitialized}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-bold rounded-full shadow-lg"
            >
              <Play className="h-6 w-6 mr-2" />
              {!isInitialized ? 'Loading...' : canPlay ? 'START GAME' : 'No Credits'}
            </Button>
          </div>
        )}

        {/* Game over overlay */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
            <div className="bg-gray-800/95 rounded-xl p-6 text-center shadow-xl border border-gray-600">
              <h3 className="text-2xl font-bold text-white mb-3">Game Over!</h3>
              <div className="text-4xl mb-3">👻</div>
              <p className="text-xl text-yellow-400 mb-4">Score: {score}</p>
              
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleStartGame}
                  disabled={!canPlay || !isInitialized}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg font-bold rounded-full shadow-lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Play Again
                </Button>
                
                <Button
                  onClick={handleResetGame}
                  variant="outline"
                  className="border-gray-500 text-white hover:bg-gray-700 px-6 py-3 text-base rounded-full shadow-lg"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Game
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Score display during game */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg">
            Score: {score}
          </div>
        )}
      </div>
    </div>
  );
};