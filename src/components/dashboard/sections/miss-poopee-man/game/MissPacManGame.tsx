
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MissPacManEngine, Direction, GameState } from './MissPacManEngine';
import { MissPacManRenderer } from './MissPacManRenderer';
import { Button } from '@/components/ui/button';
import { useSpendCredits, useEarnCredits } from '@/hooks/useCreditOperations';
import { useCreateGameSession } from '@/hooks/useGameSessions';
import { UnifiedUser } from '@/hooks/useUnifiedAuth';
import { useToast } from '@/hooks/use-toast';

interface MissPacManGameProps {
  user: UnifiedUser;
  onGameEnd: (score: number, duration: number) => void;
}

export const MissPacManGame = ({ user, onGameEnd }: MissPacManGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<MissPacManEngine | null>(null);
  const rendererRef = useRef<MissPacManRenderer | null>(null);
  const gameLoopRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  const spendCredits = useSpendCredits();
  const earnCredits = useEarnCredits();
  const createGameSession = useCreateGameSession();
  const { toast } = useToast();

  // Initialize game engine and renderer
  const initializeGame = useCallback(() => {
    if (!canvasRef.current) return;

    try {
      console.log('Initializing Miss Pac-Man game...');
      engineRef.current = new MissPacManEngine();
      rendererRef.current = new MissPacManRenderer(canvasRef.current);
      setGameState(engineRef.current.getGameState());
      console.log('Miss Pac-Man game initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Miss Pac-Man game:', error);
      toast({
        title: "Game Error",
        description: "Failed to initialize the game. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Game loop for rendering
  const gameLoop = useCallback(() => {
    if (!engineRef.current || !rendererRef.current) return;

    const currentState = engineRef.current.getGameState();
    setGameState(currentState);
    rendererRef.current.render(currentState);

    // Check for game end conditions
    if (currentState.gameStatus === 'game-over' || currentState.gameStatus === 'level-complete') {
      handleGameEnd(currentState);
    } else if (currentState.gameStatus === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, []);

  // Handle game end
  const handleGameEnd = useCallback(async (finalState: GameState) => {
    console.log('Game ending with state:', finalState);
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const score = finalState.score;
    
    // Calculate credits earned based on performance
    let creditsEarned = 0;
    if (score > 0) {
      creditsEarned = Math.floor(score / 100); // 1 credit per 100 points
      if (finalState.gameStatus === 'level-complete') {
        creditsEarned += 5; // Bonus for completing level
      }
    }

    try {
      // Record game session
      await createGameSession.mutateAsync({
        user_id: user.id,
        score,
        duration_seconds: duration,
        credits_spent: 1,
        credits_earned: creditsEarned,
        pipes_passed: 0, // Not applicable for this game
        metadata: {
          game_type: 'miss_poopee_man',
          level: finalState.level,
          lives_remaining: finalState.lives,
          pellets_eaten: Math.floor(score / 10), // Rough estimate
          game_status: finalState.gameStatus
        }
      });

      // Award credits if earned
      if (creditsEarned > 0) {
        await earnCredits.mutateAsync({
          userId: user.id,
          amount: creditsEarned,
          description: `Miss POOPEE-Man game completed - Level ${finalState.level}`,
        });
      }

      onGameEnd(score, duration);
    } catch (error) {
      console.error('Error recording game session:', error);
      toast({
        title: "Error",
        description: "Failed to save game results",
        variant: "destructive"
      });
    }
  }, [user.id, createGameSession, earnCredits, onGameEnd, toast]);

  // Start game
  const startGame = useCallback(async () => {
    if (!engineRef.current) {
      console.error('Engine not initialized');
      return;
    }

    try {
      console.log('Starting game - spending 1 credit...');
      // Spend 1 credit to play
      await spendCredits.mutateAsync({
        userId: user.id,
        amount: 1,
        description: "Miss POOPEE-Man game entry fee"
      });

      console.log('Credit spent successfully, starting game...');
      startTimeRef.current = Date.now();
      
      // Start the game engine
      engineRef.current.startGame();
      setGameStarted(true);
      
      // Start the rendering loop
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      
      toast({
        title: "Game Started!",
        description: "Use arrow keys or tap the screen to control Miss POOPEE-Man"
      });
    } catch (error: any) {
      console.error('Failed to start game:', error);
      toast({
        title: "Cannot Start Game",
        description: error.message || "Failed to start game",
        variant: "destructive"
      });
    }
  }, [user.id, spendCredits, gameLoop, toast]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!engineRef.current || !gameState || gameState.gameStatus !== 'playing') return;

      const directionMap: { [key: string]: Direction } = {
        'ArrowUp': Direction.UP,
        'ArrowDown': Direction.DOWN,
        'ArrowLeft': Direction.LEFT,
        'ArrowRight': Direction.RIGHT,
        'w': Direction.UP,
        's': Direction.DOWN,
        'a': Direction.LEFT,
        'd': Direction.RIGHT
      };

      const direction = directionMap[event.key];
      if (direction) {
        event.preventDefault();
        console.log('Key pressed:', event.key, 'Direction:', direction);
        engineRef.current.setPlayerDirection(direction);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Handle touch controls for mobile
  const handleCanvasTouch = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || !gameState || gameState.gameStatus !== 'playing') return;
    
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const deltaX = x - centerX;
    const deltaY = y - centerY;
    
    let direction: Direction;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? Direction.RIGHT : Direction.LEFT;
    } else {
      direction = deltaY > 0 ? Direction.DOWN : Direction.UP;
    }
    
    console.log('Touch direction:', direction);
    engineRef.current.setPlayerDirection(direction);
  }, [gameState]);

  // Initialize on mount
  useEffect(() => {
    initializeGame();
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [initializeGame]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current) {
        rendererRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {!gameStarted ? (
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl mb-4">👾</div>
          <h3 className="text-2xl font-bold text-white">Ready to Play?</h3>
          <p className="text-gray-400">
            Click Start Game to begin your Miss POOPEE-Man adventure!
          </p>
          <Button 
            onClick={startGame}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Start Game (1 Credit)
          </Button>
        </div>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            className="w-full h-full max-w-full max-h-full"
            onTouchStart={handleCanvasTouch}
            style={{ touchAction: 'none' }}
          />
          
          {gameState && gameState.gameStatus !== 'playing' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 bg-black/80 p-6 rounded-lg">
                {gameState.gameStatus === 'game-over' && (
                  <>
                    <div className="text-2xl font-bold text-red-400">Game Over!</div>
                    <div className="text-white">Final Score: {gameState.score}</div>
                  </>
                )}
                {gameState.gameStatus === 'level-complete' && (
                  <>
                    <div className="text-2xl font-bold text-green-400">Level Complete!</div>
                    <div className="text-white">Score: {gameState.score}</div>
                  </>
                )}
                <Button 
                  onClick={startGame} 
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Play Again (1 Credit)
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      
      {gameStarted && gameState && gameState.gameStatus === 'playing' && (
        <div className="mt-4 text-center text-sm text-gray-400">
          <p>Use arrow keys or tap the screen to control Miss POOPEE-Man</p>
          <p>Eat all 💩 pellets to complete the level!</p>
        </div>
      )}
    </div>
  );
};
