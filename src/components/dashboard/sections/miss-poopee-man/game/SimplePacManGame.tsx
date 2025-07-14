
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useSpendCredits, useEarnCredits } from '@/hooks/useCreditOperations';
import { useCreateGameSession } from '@/hooks/useGameSessions';
import { UnifiedUser } from '@/hooks/useUnifiedAuth';
import { useToast } from '@/hooks/use-toast';

interface SimplePacManGameProps {
  user: UnifiedUser;
  onGameEnd: (score: number, duration: number) => void;
}

// Simple game state
interface GameState {
  playerX: number;
  playerY: number;
  score: number;
  pellets: boolean[][];
  gameRunning: boolean;
  gameOver: boolean;
}

// Simple maze (smaller for demo)
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,1,2,2,2,2,2,1],
  [1,2,1,1,2,2,2,2,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,2,2,1,1,1,2,2,1,2,1],
  [1,2,2,2,2,2,1,2,2,2,2,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,2,2,1,1,1,2,2,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,2,2,2,2,1,1,2,1],
  [1,2,2,2,2,2,1,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const CELL_SIZE = 30;

export const SimplePacManGame = ({ user, onGameEnd }: SimplePacManGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>();
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  
  const spendCredits = useSpendCredits();
  const earnCredits = useEarnCredits();
  const createGameSession = useCreateGameSession();
  const { toast } = useToast();

  // Initialize game state
  const initializeGame = useCallback(() => {
    const pellets: boolean[][] = [];
    for (let y = 0; y < MAZE.length; y++) {
      pellets[y] = [];
      for (let x = 0; x < MAZE[y].length; x++) {
        pellets[y][x] = MAZE[y][x] === 2; // 2 = pellet
      }
    }

    gameStateRef.current = {
      playerX: 1,
      playerY: 1,
      score: 0,
      pellets,
      gameRunning: true,
      gameOver: false
    };
    
    setScore(0);
    console.log('Game initialized');
  }, []);

  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !gameStateRef.current) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gameState = gameStateRef.current;

    // Draw maze
    ctx.fillStyle = '#0000FF';
    for (let y = 0; y < MAZE.length; y++) {
      for (let x = 0; x < MAZE[y].length; x++) {
        if (MAZE[y][x] === 1) { // wall
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw pellets
    ctx.fillStyle = '#FFFF00';
    for (let y = 0; y < gameState.pellets.length; y++) {
      for (let x = 0; x < gameState.pellets[y].length; x++) {
        if (gameState.pellets[y][x]) {
          ctx.beginPath();
          ctx.arc(
            x * CELL_SIZE + CELL_SIZE / 2,
            y * CELL_SIZE + CELL_SIZE / 2,
            3,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // Draw player (Miss POOPEE-Man)
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(
      gameState.playerX * CELL_SIZE + CELL_SIZE / 2,
      gameState.playerY * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0.2 * Math.PI,
      1.8 * Math.PI
    );
    ctx.lineTo(
      gameState.playerX * CELL_SIZE + CELL_SIZE / 2,
      gameState.playerY * CELL_SIZE + CELL_SIZE / 2
    );
    ctx.fill();

    // Draw score
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 10, 25);
  }, []);

  // Move player
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (!gameStateRef.current || !gameStateRef.current.gameRunning) return;

    const newX = gameStateRef.current.playerX + dx;
    const newY = gameStateRef.current.playerY + dy;

    // Check bounds and walls
    if (
      newX >= 0 && 
      newX < MAZE[0].length && 
      newY >= 0 && 
      newY < MAZE.length && 
      MAZE[newY][newX] !== 1
    ) {
      gameStateRef.current.playerX = newX;
      gameStateRef.current.playerY = newY;

      // Check for pellet
      if (gameStateRef.current.pellets[newY][newX]) {
        gameStateRef.current.pellets[newY][newX] = false;
        gameStateRef.current.score += 10;
        setScore(gameStateRef.current.score);
        console.log('Pellet eaten! Score:', gameStateRef.current.score);

        // Check win condition
        const remainingPellets = gameStateRef.current.pellets.flat().filter(p => p).length;
        if (remainingPellets === 0) {
          endGame();
        }
      }
    }
  }, []);

  // End game
  const endGame = useCallback(async () => {
    if (!gameStateRef.current) return;

    gameStateRef.current.gameRunning = false;
    gameStateRef.current.gameOver = true;
    setGameStarted(false);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const finalScore = gameStateRef.current.score;
    
    // Calculate credits earned
    const creditsEarned = Math.floor(finalScore / 50); // 1 credit per 50 points

    try {
      // Record game session
      await createGameSession.mutateAsync({
        user_id: user.id,
        score: finalScore,
        duration_seconds: duration,
        credits_spent: 1,
        credits_earned: creditsEarned,
        pipes_passed: 0,
        metadata: {
          game_type: 'miss_poopee_man',
          pellets_eaten: Math.floor(finalScore / 10)
        }
      });

      // Award credits if earned
      if (creditsEarned > 0) {
        await earnCredits.mutateAsync({
          userId: user.id,
          amount: creditsEarned,
          description: `Miss POOPEE-Man game completed - ${finalScore} points`,
        });
      }

      toast({
        title: "Game Complete!",
        description: `Score: ${finalScore}${creditsEarned > 0 ? ` | Earned ${creditsEarned} credits` : ''}`
      });

      onGameEnd(finalScore, duration);
    } catch (error) {
      console.error('Error recording game session:', error);
      toast({
        title: "Error",
        description: "Failed to save game results",
        variant: "destructive"
      });
    }
  }, [user.id, createGameSession, earnCredits, onGameEnd, toast]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameStateRef.current?.gameRunning) return;

    render();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [render]);

  // Start game
  const startGame = useCallback(async () => {
    try {
      console.log('Starting game - spending 1 credit...');
      await spendCredits.mutateAsync({
        userId: user.id,
        amount: 1,
        description: "Miss POOPEE-Man game entry fee"
      });

      console.log('Credit spent, initializing game...');
      initializeGame();
      startTimeRef.current = Date.now();
      setGameStarted(true);

      // Start game loop
      gameLoop();

      toast({
        title: "Game Started!",
        description: "Use arrow keys to control Miss POOPEE-Man"
      });
    } catch (error: any) {
      console.error('Failed to start game:', error);
      toast({
        title: "Cannot Start Game",
        description: error.message || "Failed to start game",
        variant: "destructive"
      });
    }
  }, [user.id, spendCredits, initializeGame, gameLoop, toast]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameStarted || !gameStateRef.current?.gameRunning) return;

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          event.preventDefault();
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
          event.preventDefault();
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
          event.preventDefault();
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
          event.preventDefault();
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, movePlayer]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = MAZE[0].length * CELL_SIZE;
    canvas.height = MAZE.length * CELL_SIZE;
    
    if (gameStarted) {
      render();
    }
  }, [gameStarted, render]);

  if (!gameStarted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl mb-4">👾</div>
          <h3 className="text-2xl font-bold text-white">Ready to Play Miss POOPEE-Man?</h3>
          <p className="text-gray-400">
            Navigate the maze and collect all the pellets!
          </p>
          <p className="text-sm text-gray-500">
            Use arrow keys or WASD to move
          </p>
          <Button 
            onClick={startGame}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Start Game (1 Credit)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="mb-4">
        <div className="text-white text-lg">Score: {score}</div>
        <div className="text-gray-400 text-sm">Use arrow keys or WASD to move</div>
      </div>
      <canvas
        ref={canvasRef}
        className="border border-gray-600 bg-black"
        style={{ imageRendering: 'pixelated' }}
      />
      <Button 
        onClick={endGame}
        variant="outline"
        className="mt-4"
      >
        End Game
      </Button>
    </div>
  );
};
