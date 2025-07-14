
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

// Game constants
const CELL_SIZE = 20;
const MAZE_WIDTH = 25;
const MAZE_HEIGHT = 21;

// Directions
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

// Game entities
interface Position {
  x: number;
  y: number;
}

interface Ghost {
  x: number;
  y: number;
  direction: { x: number; y: number };
  color: string;
  mode: 'chase' | 'scatter' | 'frightened';
  frightened: boolean;
}

interface GameState {
  pacman: Position & { direction: { x: number; y: number }; nextDirection: { x: number; y: number } | null };
  ghosts: Ghost[];
  pellets: boolean[][];
  powerPellets: boolean[][];
  score: number;
  lives: number;
  gameRunning: boolean;
  gameOver: boolean;
  powerMode: boolean;
  powerModeTimer: number;
}

// Larger, more complex maze
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,3,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1],
  [1,1,1,1,1,2,1,1,1,1,1,0,1,0,1,1,1,1,1,2,1,1,1,1,1],
  [0,0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
  [1,1,1,1,1,2,1,0,1,1,0,0,0,0,0,1,1,0,1,2,1,1,1,1,1],
  [0,0,0,0,0,2,0,0,1,0,0,0,0,0,0,0,1,0,0,2,0,0,0,0,0],
  [1,1,1,1,1,2,1,0,1,0,0,0,0,0,0,0,1,0,1,2,1,1,1,1,1],
  [0,0,0,0,1,2,1,0,1,1,1,1,1,1,1,1,1,0,1,2,1,0,0,0,0],
  [1,1,1,1,1,2,1,1,1,1,1,0,1,0,1,1,1,1,1,2,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,2,1],
  [1,3,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,3,1],
  [1,1,1,2,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,2,1,1,1],
  [1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

export const SimplePacManGame = ({ user, onGameEnd }: SimplePacManGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>();
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  const spendCredits = useSpendCredits();
  const earnCredits = useEarnCredits();
  const createGameSession = useCreateGameSession();
  const { toast } = useToast();

  // Initialize game state
  const initializeGame = useCallback(() => {
    const pellets: boolean[][] = [];
    const powerPellets: boolean[][] = [];
    
    for (let y = 0; y < MAZE.length; y++) {
      pellets[y] = [];
      powerPellets[y] = [];
      for (let x = 0; x < MAZE[y].length; x++) {
        pellets[y][x] = MAZE[y][x] === 2; // 2 = regular pellet
        powerPellets[y][x] = MAZE[y][x] === 3; // 3 = power pellet
      }
    }

    // Initialize ghosts
    const ghosts: Ghost[] = [
      { x: 12, y: 9, direction: DIRECTIONS.UP, color: '#FF0000', mode: 'chase', frightened: false },
      { x: 12, y: 10, direction: DIRECTIONS.DOWN, color: '#FFB8FF', mode: 'chase', frightened: false },
      { x: 11, y: 10, direction: DIRECTIONS.UP, color: '#00FFFF', mode: 'chase', frightened: false },
      { x: 13, y: 10, direction: DIRECTIONS.UP, color: '#FFB852', mode: 'chase', frightened: false }
    ];

    gameStateRef.current = {
      pacman: { x: 12, y: 15, direction: DIRECTIONS.LEFT, nextDirection: null },
      ghosts,
      pellets,
      powerPellets,
      score: 0,
      lives: 3,
      gameRunning: true,
      gameOver: false,
      powerMode: false,
      powerModeTimer: 0
    };
    
    setScore(0);
    setLives(3);
    lastMoveTimeRef.current = Date.now();
    console.log('Game initialized with proper Pac-Man mechanics');
  }, []);

  // Check if position is valid (not a wall)
  const isValidPosition = (x: number, y: number) => {
    if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) return false;
    return MAZE[y][x] !== 1;
  };

  // Move Pac-Man
  const movePacMan = useCallback(() => {
    if (!gameStateRef.current?.gameRunning) return;

    const gameState = gameStateRef.current;
    const pacman = gameState.pacman;

    // Try to change direction if a next direction is queued
    if (pacman.nextDirection) {
      const nextX = pacman.x + pacman.nextDirection.x;
      const nextY = pacman.y + pacman.nextDirection.y;
      
      if (isValidPosition(nextX, nextY)) {
        pacman.direction = pacman.nextDirection;
        pacman.nextDirection = null;
      }
    }

    // Move in current direction
    const newX = pacman.x + pacman.direction.x;
    const newY = pacman.y + pacman.direction.y;

    // Handle tunnel (left-right wrap)
    let finalX = newX;
    if (newX < 0) finalX = MAZE_WIDTH - 1;
    if (newX >= MAZE_WIDTH) finalX = 0;

    if (isValidPosition(finalX, newY)) {
      pacman.x = finalX;
      pacman.y = newY;

      // Check for pellet consumption
      if (gameState.pellets[newY] && gameState.pellets[newY][finalX]) {
        gameState.pellets[newY][finalX] = false;
        gameState.score += 10;
        setScore(gameState.score);
      }

      // Check for power pellet consumption
      if (gameState.powerPellets[newY] && gameState.powerPellets[newY][finalX]) {
        gameState.powerPellets[newY][finalX] = false;
        gameState.score += 50;
        gameState.powerMode = true;
        gameState.powerModeTimer = 300; // 10 seconds at 30 FPS
        
        // Make all ghosts frightened
        gameState.ghosts.forEach(ghost => {
          ghost.frightened = true;
          // Reverse ghost direction
          ghost.direction = { x: -ghost.direction.x, y: -ghost.direction.y };
        });
        
        setScore(gameState.score);
      }

      // Check win condition
      const remainingPellets = gameState.pellets.flat().filter(p => p).length + 
                              gameState.powerPellets.flat().filter(p => p).length;
      if (remainingPellets === 0) {
        endGame();
      }
    }
  }, []);

  // Move ghosts
  const moveGhosts = useCallback(() => {
    if (!gameStateRef.current?.gameRunning) return;

    const gameState = gameStateRef.current;

    gameState.ghosts.forEach(ghost => {
      // Simple AI: try to move toward Pac-Man if not frightened
      const pacman = gameState.pacman;
      let bestDirection = ghost.direction;
      
      if (!ghost.frightened) {
        // Chase mode: move toward Pac-Man
        const dx = pacman.x - ghost.x;
        const dy = pacman.y - ghost.y;
        
        const possibleDirections = [
          DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT
        ].filter(dir => {
          const newX = ghost.x + dir.x;
          const newY = ghost.y + dir.y;
          return isValidPosition(newX, newY);
        });

        if (possibleDirections.length > 0) {
          // Choose direction that gets closer to Pac-Man
          bestDirection = possibleDirections.reduce((best, dir) => {
            const newX = ghost.x + dir.x;
            const newY = ghost.y + dir.y;
            const bestX = ghost.x + best.x;
            const bestY = ghost.y + best.y;
            
            const newDistance = Math.abs(newX - pacman.x) + Math.abs(newY - pacman.y);
            const bestDistance = Math.abs(bestX - pacman.x) + Math.abs(bestY - pacman.y);
            
            return newDistance < bestDistance ? dir : best;
          });
        }
      } else {
        // Frightened mode: move away from Pac-Man
        const possibleDirections = [
          DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT
        ].filter(dir => {
          const newX = ghost.x + dir.x;
          const newY = ghost.y + dir.y;
          return isValidPosition(newX, newY);
        });

        if (possibleDirections.length > 0) {
          // Choose random direction or move away
          bestDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        }
      }

      const newX = ghost.x + bestDirection.x;
      const newY = ghost.y + bestDirection.y;

      if (isValidPosition(newX, newY)) {
        ghost.x = newX;
        ghost.y = newY;
        ghost.direction = bestDirection;
      }

      // Check collision with Pac-Man
      if (ghost.x === pacman.x && ghost.y === pacman.y) {
        if (ghost.frightened) {
          // Eat the ghost
          gameState.score += 200;
          setScore(gameState.score);
          // Reset ghost to center
          ghost.x = 12;
          ghost.y = 9;
          ghost.frightened = false;
        } else {
          // Pac-Man dies
          gameState.lives--;
          setLives(gameState.lives);
          
          if (gameState.lives <= 0) {
            endGame();
          } else {
            // Reset positions
            pacman.x = 12;
            pacman.y = 15;
            pacman.direction = DIRECTIONS.LEFT;
            gameState.ghosts.forEach((g, i) => {
              g.x = 12;
              g.y = 9 + i;
              g.frightened = false;
            });
          }
        }
      }
    });

    // Handle power mode timer
    if (gameState.powerMode) {
      gameState.powerModeTimer--;
      if (gameState.powerModeTimer <= 0) {
        gameState.powerMode = false;
        gameState.ghosts.forEach(ghost => {
          ghost.frightened = false;
        });
      }
    }
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
            2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // Draw power pellets (💩)
    for (let y = 0; y < gameState.powerPellets.length; y++) {
      for (let x = 0; x < gameState.powerPellets[y].length; x++) {
        if (gameState.powerPellets[y][x]) {
          ctx.font = `${CELL_SIZE - 4}px Arial`;
          ctx.fillText(
            '💩',
            x * CELL_SIZE + 2,
            y * CELL_SIZE + CELL_SIZE - 2
          );
        }
      }
    }

    // Draw ghosts
    gameState.ghosts.forEach(ghost => {
      ctx.fillStyle = ghost.frightened ? '#0000FF' : ghost.color;
      ctx.fillRect(
        ghost.x * CELL_SIZE + 2,
        ghost.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4
      );
      
      // Draw eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(ghost.x * CELL_SIZE + 4, ghost.y * CELL_SIZE + 4, 3, 3);
      ctx.fillRect(ghost.x * CELL_SIZE + 11, ghost.y * CELL_SIZE + 4, 3, 3);
    });

    // Draw Pac-Man
    const pacman = gameState.pacman;
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    
    // Determine mouth direction
    let startAngle = 0.2 * Math.PI;
    let endAngle = 1.8 * Math.PI;
    
    if (pacman.direction === DIRECTIONS.RIGHT) {
      startAngle = 0.2 * Math.PI;
      endAngle = 1.8 * Math.PI;
    } else if (pacman.direction === DIRECTIONS.LEFT) {
      startAngle = 1.2 * Math.PI;
      endAngle = 0.8 * Math.PI;
    } else if (pacman.direction === DIRECTIONS.UP) {
      startAngle = 1.7 * Math.PI;
      endAngle = 1.3 * Math.PI;
    } else if (pacman.direction === DIRECTIONS.DOWN) {
      startAngle = 0.7 * Math.PI;
      endAngle = 0.3 * Math.PI;
    }
    
    ctx.arc(
      pacman.x * CELL_SIZE + CELL_SIZE / 2,
      pacman.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      startAngle,
      endAngle
    );
    ctx.lineTo(
      pacman.x * CELL_SIZE + CELL_SIZE / 2,
      pacman.y * CELL_SIZE + CELL_SIZE / 2
    );
    ctx.fill();
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
    const creditsEarned = Math.floor(finalScore / 100); // 1 credit per 100 points

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
          lives_remaining: gameStateRef.current.lives,
          level_completed: gameStateRef.current.pellets.flat().filter(p => p).length === 0
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

    const now = Date.now();
    
    // Move every 150ms for Pac-Man speed
    if (now - lastMoveTimeRef.current > 150) {
      movePacMan();
      moveGhosts();
      lastMoveTimeRef.current = now;
    }

    render();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [render, movePacMan, moveGhosts]);

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
      setTimeout(() => {
        gameLoop();
      }, 100);

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

      const gameState = gameStateRef.current;
      let newDirection = null;

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault();
          newDirection = DIRECTIONS.UP;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          newDirection = DIRECTIONS.DOWN;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          newDirection = DIRECTIONS.LEFT;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          newDirection = DIRECTIONS.RIGHT;
          break;
      }

      if (newDirection) {
        // Queue the direction change
        gameState.pacman.nextDirection = newDirection;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = MAZE_WIDTH * CELL_SIZE;
    canvas.height = MAZE_HEIGHT * CELL_SIZE;
    
    if (gameStarted) {
      render();
    }
  }, [gameStarted, render]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!gameStarted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl mb-4">👾</div>
          <h3 className="text-2xl font-bold text-white">Ready to Play Miss POOPEE-Man?</h3>
          <p className="text-gray-400">
            Navigate the maze, eat 💩 power pellets, and avoid the ghosts!
          </p>
          <p className="text-sm text-gray-500">
            Use arrow keys or WASD to change direction
          </p>
          <Button 
            onClick={startGame}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={spendCredits.isPending}
          >
            {spendCredits.isPending ? 'Starting...' : 'Start Game (1 Credit)'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="mb-4 flex gap-8 text-white">
        <div className="text-lg">Score: {score}</div>
        <div className="text-lg">Lives: {lives}</div>
        <div className="text-sm text-gray-400">Use arrow keys or WASD to control direction</div>
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
