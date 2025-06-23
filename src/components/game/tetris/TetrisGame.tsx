import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TetrisEngine } from './TetrisEngine';
import { TetrisRenderer } from './TetrisRenderer';
import { UnifiedUser } from '@/hooks/useUnifiedAuth';
import { TetrisGameStats } from './TetrisGameStats';
import { TetrisNextPiece } from './TetrisNextPiece';
import { TetrisGameControls } from './TetrisGameControls';
import { MobileTetrisControls } from './MobileTetrisControls';
import { useSpendCredits } from '@/hooks/useCreditOperations';
import { useGameSessions } from '@/hooks/useGameSessions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import type { GameSpeed } from './TetrisEngine';

interface TetrisGameProps {
  user: UnifiedUser;
  onGameEnd: () => void;
  creditsBalance: number;
}

export const TetrisGame = ({ user, onGameEnd, creditsBalance }: TetrisGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<TetrisEngine | null>(null);
  const rendererRef = useRef<TetrisRenderer | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [currentGameState, setCurrentGameState] = useState<any>(null);
  const [selectedSpeed, setSelectedSpeed] = useState<GameSpeed>('moderate');
  const spendCredits = useSpendCredits();
  const { refetch: refetchSessions } = useGameSessions(user.id);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!gameRef.current || gameState !== 'playing') return;

    switch (event.key) {
      case 'ArrowLeft':
        gameRef.current.moveLeft();
        break;
      case 'ArrowRight':
        gameRef.current.moveRight();
        break;
      case 'ArrowDown':
        gameRef.current.moveDown();
        break;
      case ' ': // Spacebar
        event.preventDefault();
        gameRef.current.drop();
        break;
      case 'ArrowUp':
        gameRef.current.rotate();
        break;
      default:
        break;
    }
  }, [gameState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleMoveLeft = useCallback(() => {
    if (gameRef.current && gameState === 'playing') {
      gameRef.current.moveLeft();
    }
  }, [gameState]);

  const handleMoveRight = useCallback(() => {
    if (gameRef.current && gameState === 'playing') {
      gameRef.current.moveRight();
    }
  }, [gameState]);

  const handleMoveDown = useCallback(() => {
    if (gameRef.current && gameState === 'playing') {
      gameRef.current.moveDown();
    }
  }, [gameState]);

  const handleRotate = useCallback(() => {
    if (gameRef.current && gameState === 'playing') {
      gameRef.current.rotate();
    }
  }, [gameState]);

  const handlePause = useCallback(() => {
    if (gameRef.current && gameState === 'playing') {
      gameRef.current.pause();
      setGameState('paused');
    } else if (gameRef.current && gameState === 'paused') {
      gameRef.current.pause();
      setGameState('playing');
    }
  }, [gameState]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Set proper canvas dimensions - larger for desktop
    const canvasWidth = 600;
    const canvasHeight = 800;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Initialize the renderer
    const renderer = new TetrisRenderer(canvas);
    rendererRef.current = renderer;

    const game = new TetrisEngine();
    
    game.setCallbacks(
      (state) => {
        console.log("🎮 Game state updated, rendering...", { score: state.score, level: state.level });
        setCurrentGameState(state);
        
        // Render the game state to canvas
        if (rendererRef.current) {
          rendererRef.current.render(state);
        }
      },
      async (finalScore, finalLevel, finalLines) => {
        console.log('Game over! Final stats:', { finalScore, finalLevel, finalLines });
        setGameState('gameOver');
        
        // Calculate credits earned based on score
        let creditsEarned = 0;
        if (finalScore >= 1000) creditsEarned = 0.5;
        if (finalScore >= 5000) creditsEarned = 1;
        if (finalScore >= 10000) creditsEarned = 2;
        if (finalScore >= 25000) creditsEarned = 5;
        
        try {
          const { error } = await supabase.from('game_sessions').insert({
            user_id: user.id,
            game_type: 'falling_logs',
            score: finalScore,
            credits_earned: creditsEarned,
            metadata: {
              game_type: 'falling_logs',
              level: finalLevel,
              lines_cleared: finalLines,
              duration: Math.floor(Date.now() / 1000)
            }
          });

          if (error) {
            console.error('Error saving game session:', error);
            toast({
              title: "Error",
              description: "Failed to save game session",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Game Over!",
              description: `Score: ${finalScore} | Earned: ${creditsEarned} credits`,
            });
            refetchSessions();
          }
        } catch (err) {
          console.error('Unexpected error saving game session:', err);
        }
      }
    );

    gameRef.current = game;

    return () => {
      if (gameRef.current) {
        gameRef.current.stop();
      }
    };
  }, [user.id, refetchSessions, toast]);

  const startGame = async (speed: GameSpeed = selectedSpeed) => {
    if (creditsBalance < 1) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 1 credit to play.",
        variant: "destructive",
      });
      return;
    }

    try {
      await spendCredits.mutateAsync({
        userId: user.id,
        amount: 1,
        description: 'Falling Logs Game'
      });
      
      console.log("🎮 Starting game with speed:", speed);
      setGameState('playing');
      if (gameRef.current) {
        gameRef.current.start(speed);
      }
    } catch (error) {
      console.error('Error deducting credits:', error);
      toast({
        title: "Error",
        description: "Failed to start game",
        variant: "destructive",
      });
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setCurrentGameState(null);
    if (gameRef.current) {
      gameRef.current.stop();
    }
  };

  return (
    <div className="flex gap-8 items-start justify-center p-6 max-w-7xl mx-auto">
      {/* Game Canvas */}
      <div className="flex flex-col items-center">
        <canvas
          ref={canvasRef}
          className="border-4 border-gray-300 rounded-xl shadow-2xl bg-black"
          style={{ touchAction: 'none' }}
        />
        
        {/* Mobile Controls - Show below canvas on mobile only when playing */}
        {isMobile && gameState === 'playing' && (
          <div className="mt-6 w-full flex justify-center">
            <MobileTetrisControls
              onMoveLeft={handleMoveLeft}
              onMoveRight={handleMoveRight}
              onMoveDown={handleMoveDown}
              onRotate={handleRotate}
            />
          </div>
        )}
      </div>

      {/* Side Panel */}
      <div className="flex flex-col gap-6 min-w-[320px]">
        {/* Game Stats */}
        <TetrisGameStats gameState={currentGameState} />
        
        {/* Game Controls - Show for menu and game over states */}
        {(gameState === 'menu' || gameState === 'gameOver') && (
          <TetrisGameControls
            isPlaying={gameState === 'playing'}
            isPaused={false}
            isGameOver={gameState === 'gameOver'}
            selectedSpeed={selectedSpeed}
            creditsBalance={creditsBalance}
            onStart={startGame}
            onPause={handlePause}
            onReset={resetGame}
            onSpeedChange={setSelectedSpeed}
          />
        )}
        
        {/* Next Piece Preview - Show when playing */}
        {gameState === 'playing' && currentGameState?.nextPiece && (
          <TetrisNextPiece gameState={currentGameState} />
        )}
        
        {/* Pause/Resume controls when playing or paused */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4">
            <div className="flex gap-2">
              <button 
                onClick={handlePause}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium"
              >
                {gameState === 'paused' ? 'Resume' : 'Pause'}
              </button>
              <button 
                onClick={resetGame}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Quit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
