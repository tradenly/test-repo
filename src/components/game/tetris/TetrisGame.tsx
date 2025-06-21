
import { useEffect, useRef, useState, useCallback } from 'react';
import { TetrisEngine, TetrisGameState, GameSpeed } from './TetrisEngine';
import { TetrisRenderer } from './TetrisRenderer';
import { TetrisGameStats } from './TetrisGameStats';
import { TetrisNextPiece } from './TetrisNextPiece';
import { TetrisGameControls } from './TetrisGameControls';
import { Card, CardContent } from '@/components/ui/card';
import { useCreateGameSession } from '@/hooks/useGameSessions';
import { UnifiedUser } from '@/hooks/useUnifiedAuth';

interface TetrisGameProps {
  user: UnifiedUser;
  onGameEnd?: () => void;
  creditsBalance: number;
}

export const TetrisGame = ({ user, onGameEnd, creditsBalance }: TetrisGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<TetrisEngine | null>(null);
  const rendererRef = useRef<TetrisRenderer | null>(null);
  const [gameState, setGameState] = useState<TetrisGameState | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [selectedSpeed, setSelectedSpeed] = useState<GameSpeed>('moderate');
  const createGameSession = useCreateGameSession();

  // Initialize game engine and renderer
  useEffect(() => {
    if (canvasRef.current) {
      engineRef.current = new TetrisEngine();
      rendererRef.current = new TetrisRenderer(canvasRef.current);
      
      engineRef.current.setCallbacks(
        (state) => {
          console.log("🔄 Game state updated:", { score: state.score, lines: state.lines, level: state.level });
          setGameState({ ...state }); // Create new object to ensure React re-renders
          rendererRef.current?.render(state);
        },
        handleGameOver
      );
    }
  }, []);

  // Resize canvas when container changes
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current && rendererRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          const rect = container.getBoundingClientRect();
          const size = Math.min(rect.width - 32, rect.height - 32);
          rendererRef.current.setCanvasSize(size, size);
          if (gameState) {
            rendererRef.current.render(gameState);
          }
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [gameState]);

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
        pipes_passed: 0,
        metadata: {
          game_type: 'falling_logs',
          level,
          lines_cleared: lines,
          speed: selectedSpeed
        }
      });
      
      console.log("✅ Tetris game session saved successfully");
    } catch (error) {
      console.error("❌ Failed to save Tetris game session:", error);
    }
    
    onGameEnd?.();
  }, [gameStartTime, user.id, createGameSession, onGameEnd, selectedSpeed]);

  const startGame = (speed: GameSpeed) => {
    console.log("🎯 Starting new Tetris game with speed:", speed);
    setGameStartTime(Date.now());
    setSelectedSpeed(speed);
    engineRef.current?.start(speed);
  };

  const pauseGame = () => {
    console.log("⏸️ Pausing/resuming game");
    engineRef.current?.pause();
  };

  const resetGame = () => {
    console.log("🔄 Resetting game");
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
            startGame(selectedSpeed);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, selectedSpeed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Main Gameplay Area */}
      <div className="lg:col-span-2">
        <Card className="bg-gray-800/40 border-gray-700 h-full">
          <CardContent className="p-4 h-full flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="border-2 border-gray-600 rounded-lg bg-black max-w-full max-h-full"
              style={{ imageRendering: 'pixelated' }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Side Panel with Stats and Controls */}
      <div className="space-y-3">
        <TetrisGameControls
          isPlaying={!!gameState && !gameState.isGameOver}
          isPaused={gameState?.isPaused || false}
          isGameOver={gameState?.isGameOver || false}
          selectedSpeed={selectedSpeed}
          creditsBalance={creditsBalance}
          onStart={startGame}
          onPause={pauseGame}
          onReset={resetGame}
          onSpeedChange={setSelectedSpeed}
        />
        
        <TetrisGameStats gameState={gameState} />
        
        <TetrisNextPiece gameState={gameState} />
      </div>
    </div>
  );
};
