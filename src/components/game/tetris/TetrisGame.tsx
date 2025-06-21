
import { useEffect, useRef, useState, useCallback } from 'react';
import { TetrisEngine, TetrisGameState } from './TetrisEngine';
import { TetrisRenderer } from './TetrisRenderer';
import { Button } from '@/components/ui/button';
import { useCreateGameSession } from '@/hooks/useGameSessions';
import { UnifiedUser } from '@/hooks/useUnifiedAuth';

interface TetrisGameProps {
  user: UnifiedUser;
  onGameEnd?: () => void;
}

export const TetrisGame = ({ user, onGameEnd }: TetrisGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<TetrisEngine | null>(null);
  const rendererRef = useRef<TetrisRenderer | null>(null);
  const [gameState, setGameState] = useState<TetrisGameState | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const createGameSession = useCreateGameSession();

  // Initialize game engine and renderer
  useEffect(() => {
    if (canvasRef.current) {
      engineRef.current = new TetrisEngine();
      rendererRef.current = new TetrisRenderer(canvasRef.current);
      
      engineRef.current.setCallbacks(
        (state) => {
          setGameState(state);
          rendererRef.current?.render(state);
        },
        handleGameOver
      );
    }
  }, []);

  const handleGameOver = useCallback(async (score: number, level: number, lines: number) => {
    if (!gameStartTime) return;

    const duration = Math.floor((Date.now() - gameStartTime) / 1000);
    
    console.log("🏁 Tetris game ended:", { score, level, lines, duration });
    
    try {
      await createGameSession.mutateAsync({
        user_id: user.id,
        score,
        duration_seconds: duration,
        credits_spent: 1,
        credits_earned: Math.floor(score / 1000),
        pipes_passed: 0, // Not applicable for Tetris
        metadata: {
          game_type: 'falling_logs',
          level,
          lines_cleared: lines
        }
      });
      
      console.log("✅ Tetris game session saved successfully");
    } catch (error) {
      console.error("❌ Failed to save Tetris game session:", error);
    }
    
    onGameEnd?.();
  }, [gameStartTime, user.id, createGameSession, onGameEnd]);

  const startGame = () => {
    console.log("🎯 Starting new Tetris game");
    setGameStartTime(Date.now());
    engineRef.current?.start();
  };

  const pauseGame = () => {
    engineRef.current?.pause();
  };

  const resetGame = () => {
    engineRef.current?.stop();
    setGameState(null);
    setGameStartTime(0);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!engineRef.current || !gameState) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          engineRef.current.moveLeft();
          break;
        case 'ArrowRight':
          event.preventDefault();
          engineRef.current.moveRight();
          break;
        case 'ArrowUp':
          event.preventDefault();
          engineRef.current.rotate();
          break;
        case 'ArrowDown':
          event.preventDefault();
          engineRef.current.moveDown();
          break;
        case ' ':
          event.preventDefault();
          engineRef.current.drop();
          break;
        case 'p':
        case 'P':
          event.preventDefault();
          engineRef.current.pause();
          break;
        case 'r':
        case 'R':
          if (gameState.isGameOver) {
            event.preventDefault();
            startGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex gap-4 mb-4">
        {!gameState || gameState.isGameOver ? (
          <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
            {gameState?.isGameOver ? 'Restart Game' : 'Start Game'}
          </Button>
        ) : (
          <>
            <Button 
              onClick={pauseGame} 
              variant="outline"
              className="border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
            >
              {gameState.isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button 
              onClick={resetGame} 
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              Reset
            </Button>
          </>
        )}
      </div>

      <canvas
        ref={canvasRef}
        className="border-2 border-gray-600 rounded-lg bg-black"
        style={{ imageRendering: 'pixelated' }}
      />

      {gameState && (
        <div className="grid grid-cols-3 gap-6 text-center text-white mt-4">
          <div>
            <div className="text-2xl font-bold text-yellow-400">{gameState.score}</div>
            <div className="text-sm text-gray-400">Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{gameState.level}</div>
            <div className="text-sm text-gray-400">Level</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{gameState.lines}</div>
            <div className="text-sm text-gray-400">Lines</div>
          </div>
        </div>
      )}

      <div className="text-center text-gray-400 text-sm mt-4">
        <p>Use arrow keys to move and rotate pieces</p>
        <p>Spacebar for hard drop • P to pause • R to restart (when game over)</p>
      </div>
    </div>
  );
};
