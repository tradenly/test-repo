import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useSpendCredits, useEarnCredits } from '@/hooks/useCreditOperations';
import { useCreateGameSession } from '@/hooks/useGameSessions';
import { UnifiedUser } from '@/hooks/useUnifiedAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  GameState, 
  Direction, 
  GameStatus, 
  GAME_CONFIG,
  Position,
  Player,
  GhostMode,
  CellType
} from './GameTypes';
import { MAZE_LAYOUT } from './MazeData';
import { GhostAI } from './GhostAI';
import { PathfindingAI } from './PathfindingAI';

interface SimplePacManGameProps {
  user: UnifiedUser;
  onGameEnd: (score: number, duration: number) => void;
}

export const SimplePacManGame = ({ user, onGameEnd }: SimplePacManGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>();
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [powerModeDisplay, setPowerModeDisplay] = useState(false);
  const [powerTimeLeft, setPowerTimeLeft] = useState(0);
  
  const spendCredits = useSpendCredits();
  const earnCredits = useEarnCredits();
  const createGameSession = useCreateGameSession();
  const { toast } = useToast();

  // Shared function to record game session
  const recordGameSession = useCallback(async (finalGameState: GameState, gameStatus: GameStatus) => {
    if (!finalGameState) return { success: false, creditsEarned: 0 };

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const finalScore = finalGameState.score;
    
    // Calculate credits earned based on performance and outcome
    let creditsEarned = 0;
    if (finalScore > 0) {
      creditsEarned = Math.floor(finalScore / 500); // 1 credit per 500 points
      
      // Bonus credits for level completion
      if (gameStatus === GameStatus.LEVEL_COMPLETE) {
        creditsEarned += (finalGameState.level - 1) * 3; // 3 credits per level completed
      }
    }

    try {
      await createGameSession.mutateAsync({
        user_id: user.id,
        score: finalScore,
        duration_seconds: duration,
        credits_spent: 1,
        credits_earned: creditsEarned,
        pipes_passed: 0,
        metadata: {
          game_type: 'miss_poopee_man',
          level: finalGameState.level,
          lives_remaining: finalGameState.lives,
          pellets_eaten: Math.floor(finalScore / 10),
          game_status: gameStatus === GameStatus.LEVEL_COMPLETE ? 'level_complete' : 'game_over'
        }
      });

      if (creditsEarned > 0) {
        await earnCredits.mutateAsync({
          userId: user.id,
          amount: creditsEarned,
          description: `Miss POOPEE-Man - Level ${finalGameState.level}, ${finalScore} points`,
        });
      }

      return { success: true, creditsEarned };
    } catch (error) {
      console.error('❌ Error recording game session:', error);
      return { success: false, creditsEarned: 0 };
    }
  }, [user.id, createGameSession, earnCredits]);

  // Initialize game state
  const initializeGame = useCallback(() => {
    const pellets: boolean[][] = [];
    const powerPellets: boolean[][] = [];
    let pelletsCount = 0;
    
    for (let y = 0; y < MAZE_LAYOUT.length; y++) {
      pellets[y] = [];
      powerPellets[y] = [];
      for (let x = 0; x < MAZE_LAYOUT[y].length; x++) {
        pellets[y][x] = MAZE_LAYOUT[y][x] === CellType.PELLET; // 0 = regular pellet
        powerPellets[y][x] = MAZE_LAYOUT[y][x] === CellType.POWER_PELLET; // 2 = power pellet
        if (pellets[y][x] || powerPellets[y][x]) pelletsCount++;
      }
    }

    const player: Player = {
      position: { x: 16, y: 17 },
      direction: Direction.LEFT,
      nextDirection: null,
      isMoving: false,
      animationFrame: 0
    };

    gameStateRef.current = {
      player,
      ghosts: GhostAI.initializeGhosts(),
      pellets,
      powerPellets,
      score: 0,
      level: 1,
      lives: 3,
      gameStatus: GameStatus.PLAYING,
      powerMode: false,
      powerModeTimer: 0,
      pelletsRemaining: pelletsCount,
      gameTime: 0,
      lastMoveTime: Date.now(),
      ghostEatenCount: 0,
      modeTimer: 0,
      currentMode: 'scatter'
    };
    
    setScore(0);
    setLives(3);
    setLevel(1);
    setPowerModeDisplay(false);
    setPowerTimeLeft(0);
    console.log('🎮 Game initialized with correct maze rendering');
  }, []);

  // Check if position is valid (not a wall)
  const isValidPosition = (x: number, y: number): boolean => {
    if (x < 0 || x >= GAME_CONFIG.MAZE_WIDTH || y < 0 || y >= GAME_CONFIG.MAZE_HEIGHT) {
      return true; // Allow tunnel wrapping
    }
    return MAZE_LAYOUT[y][x] !== CellType.WALL; // Not a wall (1)
  };

  // Move player
  const movePlayer = useCallback(() => {
    if (!gameStateRef.current || gameStateRef.current.gameStatus !== GameStatus.PLAYING) return;

    const gameState = gameStateRef.current;
    const player = gameState.player;

    // Try to change direction if requested
    if (player.nextDirection) {
      const nextPos = getNextPosition(player.position, player.nextDirection);
      if (isValidPosition(nextPos.x, nextPos.y)) {
        player.direction = player.nextDirection;
        player.nextDirection = null;
      }
    }

    // Move in current direction
    if (player.direction !== Direction.NONE) {
      const newPos = getNextPosition(player.position, player.direction);
      
      // Handle tunnel wrapping
      if (newPos.x < 0) newPos.x = GAME_CONFIG.MAZE_WIDTH - 1;
      if (newPos.x >= GAME_CONFIG.MAZE_WIDTH) newPos.x = 0;

      if (isValidPosition(newPos.x, newPos.y)) {
        player.position = newPos;
        player.isMoving = true;
        player.animationFrame = (player.animationFrame + 1) % 4;

        // Check for pellet consumption
        if (gameState.pellets[newPos.y] && gameState.pellets[newPos.y][newPos.x]) {
          gameState.pellets[newPos.y][newPos.x] = false;
          gameState.score += 10;
          gameState.pelletsRemaining--;
          setScore(gameState.score);
        }

        // Check for power pellet consumption
        if (gameState.powerPellets[newPos.y] && gameState.powerPellets[newPos.y][newPos.x]) {
          gameState.powerPellets[newPos.y][newPos.x] = false;
          gameState.score += 50;
          gameState.pelletsRemaining--;
          
          // Activate power mode
          activatePowerMode();
          setScore(gameState.score);
        }

        // Check win condition
        if (gameState.pelletsRemaining <= 0) {
          levelComplete();
        }
      } else {
        player.isMoving = false;
      }
    }
  }, []);

  // Get next position based on direction
  const getNextPosition = (pos: Position, direction: Direction): Position => {
    switch (direction) {
      case Direction.UP: return { x: pos.x, y: pos.y - 1 };
      case Direction.DOWN: return { x: pos.x, y: pos.y + 1 };
      case Direction.LEFT: return { x: pos.x - 1, y: pos.y };
      case Direction.RIGHT: return { x: pos.x + 1, y: pos.y };
      default: return pos;
    }
  };

  // Activate power mode
  const activatePowerMode = () => {
    if (!gameStateRef.current) return;
    
    const gameState = gameStateRef.current;
    gameState.powerMode = true;
    gameState.powerModeTimer = GAME_CONFIG.POWER_MODE_DURATION;
    gameState.ghostEatenCount = 0;
    
    setPowerModeDisplay(true);
    setPowerTimeLeft(3);
    
    console.log('💩 Power mode activated for exactly 3 seconds');
  };

  // Move ghosts
  const moveGhosts = useCallback(() => {
    if (!gameStateRef.current || gameStateRef.current.gameStatus !== GameStatus.PLAYING) return;

    const gameState = gameStateRef.current;
    
    gameState.ghosts.forEach(ghost => {
      // Update ghost AI
      const updatedGhost = GhostAI.updateGhost(
        ghost, 
        gameState.player, 
        gameState.ghosts,
        gameState.currentMode,
        gameState.powerMode
      );
      
      Object.assign(ghost, updatedGhost);

      // Move ghost if it has a next direction
      if (ghost.nextDirection) {
        const newPos = getNextPosition(ghost.position, ghost.nextDirection);
        
        // Handle tunnel wrapping
        if (newPos.x < 0) newPos.x = GAME_CONFIG.MAZE_WIDTH - 1;
        if (newPos.x >= GAME_CONFIG.MAZE_WIDTH) newPos.x = 0;

        const allowGhostHouse = ghost.mode === GhostMode.EATEN || 
                               ghost.mode === GhostMode.EXITING_HOUSE || 
                               ghost.isInHouse;
        
        if (isValidPosition(newPos.x, newPos.y) || 
            (allowGhostHouse && MAZE_LAYOUT[newPos.y] && MAZE_LAYOUT[newPos.y][newPos.x] === CellType.GHOST_HOUSE)) {
          ghost.position = newPos;
          ghost.direction = ghost.nextDirection;
          ghost.nextDirection = null;
        }
      }
    });
  }, []);

  // Update game mode (scatter/chase)
  const updateGameMode = useCallback(() => {
    if (!gameStateRef.current) return;
    
    const gameState = gameStateRef.current;
    gameState.modeTimer += GAME_CONFIG.GAME_SPEED;
    
    if (gameState.currentMode === 'scatter' && gameState.modeTimer >= GAME_CONFIG.SCATTER_DURATION) {
      gameState.currentMode = 'chase';
      gameState.modeTimer = 0;
    } else if (gameState.currentMode === 'chase' && gameState.modeTimer >= GAME_CONFIG.CHASE_DURATION) {
      gameState.currentMode = 'scatter';
      gameState.modeTimer = 0;
    }
  }, []);

  // Update power mode
  const updatePowerMode = useCallback(() => {
    if (!gameStateRef.current) return;

    const gameState = gameStateRef.current;
    
    if (gameState.powerMode && gameState.powerModeTimer > 0) {
      gameState.powerModeTimer -= GAME_CONFIG.GAME_SPEED;
      
      const secondsLeft = Math.ceil(gameState.powerModeTimer / 1000);
      setPowerTimeLeft(Math.max(0, secondsLeft));
      
      if (gameState.powerModeTimer <= 0) {
        // Power mode expired
        gameState.powerMode = false;
        setPowerModeDisplay(false);
        setPowerTimeLeft(0);
        console.log('💪 Power mode ended - all ghosts return to normal behavior');
      }
    }
  }, []);

  // Check collisions
  const checkCollisions = useCallback(() => {
    if (!gameStateRef.current || gameStateRef.current.gameStatus !== GameStatus.PLAYING) return;

    const gameState = gameStateRef.current;
    const player = gameState.player;

    gameState.ghosts.forEach(ghost => {
      if (ghost.position.x === player.position.x && ghost.position.y === player.position.y) {
        if (ghost.mode === GhostMode.FRIGHTENED) {
          // Player eats ghost
          ghost.mode = GhostMode.EATEN;
          
          // Score based on consecutive ghosts eaten
          const points = 200 * Math.pow(2, gameState.ghostEatenCount);
          gameState.score += points;
          gameState.ghostEatenCount++;
          
          setScore(gameState.score);
          console.log(`👻 Ghost eaten! +${points} points. Total ghosts eaten: ${gameState.ghostEatenCount}`);
        } else if (ghost.mode !== GhostMode.EATEN) {
          // Ghost kills player
          gameState.lives--;
          setLives(gameState.lives);
          console.log('💀 Player killed! Lives remaining:', gameState.lives);
          
          if (gameState.lives <= 0) {
            endGame();
          } else {
            resetPositions();
          }
        }
      }
    });
  }, []);

  // Reset positions after player death
  const resetPositions = () => {
    if (!gameStateRef.current) return;
    
    const gameState = gameStateRef.current;
    
    // Reset player
    gameState.player.position = { x: 16, y: 17 };
    gameState.player.direction = Direction.LEFT;
    gameState.player.nextDirection = null;
    
    // Reset ghosts
    gameState.ghosts = GhostAI.initializeGhosts();
    
    // Clear power mode
    gameState.powerMode = false;
    gameState.powerModeTimer = 0;
    setPowerModeDisplay(false);
    setPowerTimeLeft(0);
  };

  // Level complete
  const levelComplete = useCallback(async () => {
    if (!gameStateRef.current) return;
    
    const gameState = gameStateRef.current;
    const currentLevel = gameState.level;
    
    // Set status to level complete
    gameState.gameStatus = GameStatus.LEVEL_COMPLETE;
    
    // Bonus points for completing level
    gameState.score += 1000 * currentLevel;
    setScore(gameState.score);
    
    console.log(`🏆 Level ${currentLevel} complete! Bonus: ${1000 * currentLevel} points`);
    
    // Record the level completion session
    const sessionResult = await recordGameSession(gameState, GameStatus.LEVEL_COMPLETE);
    
    if (sessionResult.success && sessionResult.creditsEarned > 0) {
      toast({
        title: "Level Complete!",
        description: `Level ${currentLevel} completed! Score: ${gameState.score} | Earned ${sessionResult.creditsEarned} credits`
      });
    }
    
    // Advance to next level
    gameState.level++;
    setLevel(gameState.level);
    
    // Start next level after delay
    setTimeout(() => {
      initializeGame();
      if (gameStateRef.current) {
        gameStateRef.current.level = gameState.level;
        gameStateRef.current.score = gameState.score;
        gameStateRef.current.lives = gameState.lives;
        setLevel(gameState.level);
        setScore(gameState.score);
      }
    }, 2000);
  }, [recordGameSession, toast, initializeGame]);

  // End game
  const endGame = useCallback(async () => {
    if (!gameStateRef.current) return;

    console.log('🏁 Ending game...');
    
    // Capture the current game state before modifying it
    const finalGameState = { ...gameStateRef.current };
    
    // Set game status to game over
    gameStateRef.current.gameStatus = GameStatus.GAME_OVER;
    setGameStarted(false);
    setPowerModeDisplay(false);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Record the game session with game over status
    const sessionResult = await recordGameSession(finalGameState, GameStatus.GAME_OVER);
    
    if (sessionResult.success) {
      toast({
        title: "Game Over!",
        description: `Final Score: ${finalGameState.score}${sessionResult.creditsEarned > 0 ? ` | Earned ${sessionResult.creditsEarned} credits` : ''}`
      });

      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onGameEnd(finalGameState.score, duration);
    } else {
      toast({
        title: "Game Over!",
        description: `Final Score: ${finalGameState.score}`,
        variant: "destructive"
      });
    }
  }, [recordGameSession, onGameEnd, toast]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameStateRef.current || gameStateRef.current.gameStatus !== GameStatus.PLAYING) return;

    const now = Date.now();
    
    if (now - gameStateRef.current.lastMoveTime >= GAME_CONFIG.GAME_SPEED) {
      movePlayer();
      moveGhosts();
      updateGameMode();
      updatePowerMode();
      checkCollisions();
      gameStateRef.current.lastMoveTime = now;
    }

    render();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [movePlayer, moveGhosts, updateGameMode, updatePowerMode, checkCollisions]);

  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !gameStateRef.current) return;

    const gameState = gameStateRef.current;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze walls
    ctx.fillStyle = '#0000FF';
    for (let y = 0; y < MAZE_LAYOUT.length; y++) {
      for (let x = 0; x < MAZE_LAYOUT[y].length; x++) {
        if (MAZE_LAYOUT[y][x] === CellType.WALL) { // 1 = wall, render as blue
          ctx.fillRect(x * GAME_CONFIG.CELL_SIZE, y * GAME_CONFIG.CELL_SIZE, GAME_CONFIG.CELL_SIZE, GAME_CONFIG.CELL_SIZE);
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
            x * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2,
            y * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2,
            2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // Draw power pellets
    const time = Date.now() / 300;
    for (let y = 0; y < gameState.powerPellets.length; y++) {
      for (let x = 0; x < gameState.powerPellets[y].length; x++) {
        if (gameState.powerPellets[y][x]) {
          const size = GAME_CONFIG.CELL_SIZE - 4 + Math.sin(time) * 2;
          ctx.font = `${size}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            '💩',
            x * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2,
            y * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2
          );
        }
      }
    }

    // Draw ghosts
    gameState.ghosts.forEach(ghost => {
      const centerX = ghost.position.x * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2;
      const centerY = ghost.position.y * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2;
      
      if (ghost.mode === GhostMode.EATEN) {
        // Draw eyes only
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(centerX - 4, centerY, 3, 0, Math.PI * 2);
        ctx.arc(centerX + 4, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(centerX - 4, centerY, 1.5, 0, Math.PI * 2);
        ctx.arc(centerX + 4, centerY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Determine if ghost should blink during power mode
        const shouldBlink = gameState.powerMode && gameState.powerModeTimer <= 1000 && 
                           Math.floor(Date.now() / 200) % 2 === 0;
        
        if (ghost.mode === GhostMode.FRIGHTENED) {
          ctx.fillStyle = shouldBlink ? '#FFFFFF' : '#0000FF';
        } else {
          ctx.fillStyle = ghost.color;
        }
        
        // Draw ghost body
        ctx.beginPath();
        ctx.arc(centerX, centerY - 3, GAME_CONFIG.CELL_SIZE / 2 - 1, Math.PI, 0, false);
        ctx.lineTo(centerX + GAME_CONFIG.CELL_SIZE / 2 - 1, centerY + GAME_CONFIG.CELL_SIZE / 2 - 1);
        ctx.lineTo(centerX + 4, centerY + GAME_CONFIG.CELL_SIZE / 2 - 1);
        ctx.lineTo(centerX + 2, centerY + 4);
        ctx.lineTo(centerX, centerY + GAME_CONFIG.CELL_SIZE / 2 - 1);
        ctx.lineTo(centerX - 2, centerY + 4);
        ctx.lineTo(centerX - 4, centerY + GAME_CONFIG.CELL_SIZE / 2 - 1);
        ctx.lineTo(centerX - GAME_CONFIG.CELL_SIZE / 2 + 1, centerY + GAME_CONFIG.CELL_SIZE / 2 - 1);
        ctx.closePath();
        ctx.fill();
        
        // Draw eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(centerX - 4, centerY - 4, 3, 0, Math.PI * 2);
        ctx.arc(centerX + 4, centerY - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        
        if (ghost.mode === GhostMode.FRIGHTENED) {
          // Frightened eyes
          ctx.fillStyle = '#000000';
          ctx.fillRect(centerX - 6, centerY - 6, 4, 4);
          ctx.fillRect(centerX + 2, centerY - 6, 4, 4);
          ctx.fillRect(centerX - 4, centerY + 2, 2, 2);
          ctx.fillRect(centerX - 1, centerY + 2, 2, 2);
          ctx.fillRect(centerX + 2, centerY + 2, 2, 2);
        } else {
          // Normal eyes looking toward player
          const dx = gameState.player.position.x - ghost.position.x;
          const dy = gameState.player.position.y - ghost.position.y;
          const pupilOffsetX = Math.sign(dx) * 1;
          const pupilOffsetY = Math.sign(dy) * 1;
          
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(centerX - 4 + pupilOffsetX, centerY - 4 + pupilOffsetY, 1.5, 0, Math.PI * 2);
          ctx.arc(centerX + 4 + pupilOffsetX, centerY - 4 + pupilOffsetY, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Draw Pac-Man
    const player = gameState.player;
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    
    const mouthAnimation = Math.sin(Date.now() / 100) * 0.3 + 0.3;
    let startAngle = 0.2 * Math.PI * mouthAnimation;
    let endAngle = (2 - 0.2 * mouthAnimation) * Math.PI;
    
    // Adjust mouth direction based on movement
    switch (player.direction) {
      case Direction.RIGHT:
        startAngle = 0.2 * Math.PI * mouthAnimation;
        endAngle = (2 - 0.2 * mouthAnimation) * Math.PI;
        break;
      case Direction.LEFT:
        startAngle = (1 + 0.2 * mouthAnimation) * Math.PI;
        endAngle = (1 - 0.2 * mouthAnimation) * Math.PI;
        break;
      case Direction.UP:
        startAngle = (1.5 + 0.2 * mouthAnimation) * Math.PI;
        endAngle = (1.5 - 0.2 * mouthAnimation) * Math.PI;
        break;
      case Direction.DOWN:
        startAngle = (0.5 + 0.2 * mouthAnimation) * Math.PI;
        endAngle = (0.5 - 0.2 * mouthAnimation) * Math.PI;
        break;
    }
    
    ctx.arc(
      player.position.x * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2,
      player.position.y * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2,
      GAME_CONFIG.CELL_SIZE / 2 - 2,
      startAngle,
      endAngle
    );
    ctx.lineTo(
      player.position.x * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2,
      player.position.y * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2
    );
    ctx.fill();
  }, []);

  // Start game
  const startGame = useCallback(async () => {
    try {
      console.log('🎮 Starting game - spending 1 credit...');
      await spendCredits.mutateAsync({
        userId: user.id,
        amount: 1,
        description: "Miss POOPEE-Man game entry fee"
      });

      initializeGame();
      startTimeRef.current = Date.now();
      setGameStarted(true);

      setTimeout(() => {
        gameLoop();
      }, 100);

      toast({
        title: "Game Started!",
        description: "Use arrow keys to control Miss POOPEE-Man"
      });
    } catch (error: any) {
      console.error('❌ Failed to start game:', error);
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
      if (!gameStarted || !gameStateRef.current || gameStateRef.current.gameStatus !== GameStatus.PLAYING) return;

      const gameState = gameStateRef.current;
      let newDirection: Direction | null = null;

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault();
          newDirection = Direction.UP;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          newDirection = Direction.DOWN;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          newDirection = Direction.LEFT;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          newDirection = Direction.RIGHT;
          break;
      }

      if (newDirection) {
        gameState.player.nextDirection = newDirection;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = GAME_CONFIG.MAZE_WIDTH * GAME_CONFIG.CELL_SIZE;
    canvas.height = GAME_CONFIG.MAZE_HEIGHT * GAME_CONFIG.CELL_SIZE;
    
    if (gameStarted) {
      render();
    }
  }, [gameStarted, render]);

  // Cleanup
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
        <div className="text-lg">Level: {level}</div>
        {powerModeDisplay && (
          <div className="text-lg text-blue-400 font-bold animate-pulse">
            POWER MODE! ({powerTimeLeft}s)
          </div>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className="border border-gray-600 bg-black"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="mt-2 text-sm text-gray-400 text-center">
        Use arrow keys or WASD to control direction
      </div>
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
