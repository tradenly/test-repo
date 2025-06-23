import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TetrisEngine } from './TetrisEngine';
import { UnifiedUser } from '@/hooks/useUnifiedAuth';
import { TetrisGameStats } from './TetrisGameStats';
import { TetrisNextPiece } from './TetrisNextPiece';
import { TetrisGameControls } from './TetrisGameControls';
import { MobileTetrisControls } from './MobileTetrisControls';
import { useCreditOperations } from '@/hooks/useCreditOperations';
import { useGameSessions } from '@/hooks/useGameSessions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface TetrisGameProps {
  user: UnifiedUser;
  onGameEnd: () => void;
  creditsBalance: number;
}

export const TetrisGame = ({ user, onGameEnd, creditsBalance }: TetrisGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<TetrisEngine | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [nextPiece, setNextPiece] = useState<number[][]>([]);
  const { deductCredits } = useCreditOperations();
  const { refetch: refetchSessions } = useGameSessions(user.id);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!gameRef.current || gameState !== 'playing') return;

    switch (event.key) {
      case 'ArrowLeft':
        gameRef.current.movePiece(-1, 0);
        break;
      case 'ArrowRight':
        gameRef.current.movePiece(1, 0);
        break;
      case 'ArrowDown':
        gameRef.current.movePiece(0, 1);
        break;
      case ' ': // Spacebar
        event.preventDefault(); // Prevent page scrolling
        gameRef.current.rotatePiece();
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
      gameRef.current.movePiece(-1, 0);
    }
  }, [gameState]);

  const handleMoveRight = useCallback(() => {
    if (gameRef.current && gameState === 'playing') {
      gameRef.current.movePiece(1, 0);
    }
  }, [gameState]);

  const handleMoveDown = useCallback(() => {
    if (gameRef.current && gameState === 'playing') {
      gameRef.current.movePiece(0, 1);
    }
  }, [gameState]);

  const handleRotate = useCallback(() => {
    if (gameRef.current && gameState === 'playing') {
      gameRef.current.rotatePiece();
    }
  }, [gameState]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Adjust canvas size for mobile
    const canvasWidth = isMobile ? Math.min(300, window.innerWidth - 40) : 400;
    const canvasHeight = isMobile ? Math.min(600, window.innerHeight * 0.6) : 800;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const game = new TetrisEngine(ctx, canvas.width, canvas.height);
    
    game.onScoreUpdate = (newScore, newLevel, newLines) => {
      setScore(newScore);
      setLevel(newLevel);
      setLines(newLines);
    };

    game.onNextPieceUpdate = (piece) => {
      setNextPiece(piece);
    };

    game.onGameOver = async (finalScore, finalLevel, finalLines) => {
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
    };

    gameRef.current = game;

    return () => {
      if (gameRef.current) {
        gameRef.current.cleanup();
      }
    };
  }, [user.id, refetchSessions, toast, isMobile]);

  const startGame = async () => {
    if (creditsBalance < 1) {
      toast({
        title: "Insufficient Credits",
        description: "You need at least 1 credit to play.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deductCredits(1, 'Falling Logs Game');
      setGameState('playing');
      if (gameRef.current) {
        gameRef.current.start();
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
    setScore(0);
    setLevel(1);
    setLines(0);
    if (gameRef.current) {
      gameRef.current.reset();
    }
  };

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 items-start justify-center p-4`}>
      {/* Game Canvas */}
      <div className="flex flex-col items-center">
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-300 rounded-lg shadow-lg bg-black"
          style={{ touchAction: 'none' }}
        />
        
        {/* Mobile Controls - Show below canvas on mobile */}
        {isMobile && gameState === 'playing' && (
          <div className="mt-4 w-full flex justify-center">
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
      <div className={`flex flex-col gap-4 ${isMobile ? 'w-full' : 'min-w-[250px]'}`}>
        <TetrisGameStats
          score={score}
          level={level}
          lines={lines}
          creditsBalance={creditsBalance}
        />
        
        {gameState !== 'playing' && (
          <TetrisGameControls
            gameState={gameState}
            onStart={startGame}
            onReset={resetGame}
            onBack={onGameEnd}
            canPlay={creditsBalance >= 1}
          />
        )}
        
        {gameState === 'playing' && (
          <TetrisNextPiece piece={nextPiece} />
        )}
        
        {/* Desktop Mobile Controls - Show in sidebar on desktop */}
        {!isMobile && gameState === 'playing' && (
          <MobileTetrisControls
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
            onMoveDown={handleMoveDown}
            onRotate={handleRotate}
          />
        )}
      </div>
    </div>
  );
};
