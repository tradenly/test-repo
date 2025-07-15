
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

// Game constants - increased width by 30%
const CELL_SIZE = 20;
const MAZE_WIDTH = 33; // Increased from 25 to 33 (32% increase)
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
  eaten: boolean;
  respawnTimer: number;
  lastDirection: { x: number; y: number } | null;
  stuckCounter: number;
  target: Position | null;
  homeCorner: Position; // Each ghost has a home corner for scatter mode
  lastValidDirections: { x: number; y: number }[];
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

// Wider maze layout
const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,2,1,2,1,2,1,1,1,1,1,2,1,1,1,1,1,2,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1,2,1,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,2,1],
  [1,2,2,2,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,1,2,1,0,0,0,0,2,1,0,0,0,1,2,0,0,0,0,1,2,1,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,0,1,1,2,2,1,0,0,0,1,2,2,1,1,0,1,2,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,2,0,0,1,0,2,0,0,0,0,0,0,0,2,0,1,0,0,2,0,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,0,1,0,2,0,0,0,0,0,0,0,2,0,1,0,1,2,1,1,1,1,1,1,1,1],
  [0,0,0,0,0,1,2,1,0,1,1,2,2,1,0,0,0,1,2,2,1,1,0,1,2,1,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1,2,1,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,2,1,2,1,2,1,1,1,1,1,2,1,1,1,1,1,2,2,1],
  [1,3,2,2,1,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,3,1],
  [1,1,1,2,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,2,1,1,1,1,1],
  [1,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,1,2,1,2,1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,2,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
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

    // Initialize ghosts with proper home corners and spawn positions
    const ghosts: Ghost[] = [
      { 
        x: 16, y: 9, 
        direction: DIRECTIONS.UP, 
        color: '#FF0000', 
        mode: 'chase', 
        frightened: false, 
        eaten: false, 
        respawnTimer: 0,
        lastDirection: null,
        stuckCounter: 0,
        target: null,
        homeCorner: { x: 32, y: 0 }, // Top right
        lastValidDirections: []
      },
      { 
        x: 16, y: 10, 
        direction: DIRECTIONS.DOWN, 
        color: '#FFB8FF', 
        mode: 'chase', 
        frightened: false, 
        eaten: false, 
        respawnTimer: 0,
        lastDirection: null,
        stuckCounter: 0,
        target: null,
        homeCorner: { x: 0, y: 0 }, // Top left
        lastValidDirections: []
      },
      { 
        x: 15, y: 10, 
        direction: DIRECTIONS.UP, 
        color: '#00FFFF', 
        mode: 'chase', 
        frightened: false, 
        eaten: false, 
        respawnTimer: 0,
        lastDirection: null,
        stuckCounter: 0,
        target: null,
        homeCorner: { x: 0, y: 20 }, // Bottom left
        lastValidDirections: []
      },
      { 
        x: 17, y: 10, 
        direction: DIRECTIONS.UP, 
        color: '#FFB852', 
        mode: 'chase', 
        frightened: false, 
        eaten: false, 
        respawnTimer: 0,
        lastDirection: null,
        stuckCounter: 0,
        target: null,
        homeCorner: { x: 32, y: 20 }, // Bottom right
        lastValidDirections: []
      }
    ];

    gameStateRef.current = {
      pacman: { x: 16, y: 15, direction: DIRECTIONS.LEFT, nextDirection: null },
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
    console.log('🎮 Game initialized with improved ghost AI and proper power mode mechanics');
  }, []);

  // Check if position is valid (not a wall)
  const isValidPosition = (x: number, y: number) => {
    if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) return false;
    return MAZE[y][x] !== 1;
  };

  // Get valid directions from a position
  const getValidDirections = (x: number, y: number) => {
    const allDirections = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT];
    return allDirections.filter(dir => isValidPosition(x + dir.x, y + dir.y));
  };

  // Calculate distance between two points (Manhattan distance)
  const calculateDistance = (pos1: Position, pos2: Position) => {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  };

  // Get opposite direction
  const getOppositeDirection = (direction: { x: number; y: number }) => {
    return { x: -direction.x, y: -direction.y };
  };

  // Advanced ghost AI with proper pathfinding
  const moveGhosts = useCallback(() => {
    if (!gameStateRef.current?.gameRunning) return;

    const gameState = gameStateRef.current;
    const pacman = gameState.pacman;

    gameState.ghosts.forEach(ghost => {
      // Handle respawn timer for eaten ghosts
      if (ghost.eaten) {
        ghost.respawnTimer--;
        if (ghost.respawnTimer <= 0) {
          ghost.eaten = false;
          ghost.frightened = false;
          ghost.mode = 'chase';
          ghost.x = 16;
          ghost.y = 9;
          ghost.stuckCounter = 0;
          ghost.lastValidDirections = [];
          console.log('👻 Ghost respawned and ready to chase');
        }
        return;
      }

      const validDirections = getValidDirections(ghost.x, ghost.y);
      if (validDirections.length === 0) return;

      // Remove reverse direction unless it's the only option
      const nonReverseDirections = validDirections.filter(dir => {
        const opposite = getOppositeDirection(ghost.direction);
        return !(dir.x === opposite.x && dir.y === opposite.y);
      });

      const directionsToConsider = nonReverseDirections.length > 0 ? nonReverseDirections : validDirections;

      let bestDirection = ghost.direction;

      // Detect if ghost is stuck (oscillating between two positions)
      ghost.lastValidDirections.push({ ...ghost.direction });
      if (ghost.lastValidDirections.length > 4) {
        ghost.lastValidDirections.shift();
      }

      // Check for oscillation pattern
      const isOscillating = ghost.lastValidDirections.length === 4 &&
        ghost.lastValidDirections[0].x === ghost.lastValidDirections[2].x &&
        ghost.lastValidDirections[0].y === ghost.lastValidDirections[2].y &&
        ghost.lastValidDirections[1].x === ghost.lastValidDirections[3].x &&
        ghost.lastValidDirections[1].y === ghost.lastValidDirections[3].y;

      if (isOscillating) {
        ghost.stuckCounter += 3; // Penalize oscillation heavily
        console.log('👻 Ghost oscillation detected, breaking pattern');
      }

      if (ghost.stuckCounter > 5) {
        // Force a random direction to break free
        const randomDirections = directionsToConsider.filter(dir => 
          !(dir.x === ghost.direction.x && dir.y === ghost.direction.y)
        );
        if (randomDirections.length > 0) {
          bestDirection = randomDirections[Math.floor(Math.random() * randomDirections.length)];
          ghost.stuckCounter = 0;
          ghost.lastValidDirections = [];
          console.log('👻 Ghost broke free from stuck state');
        }
      } else if (ghost.frightened) {
        // FRIGHTENED MODE: Run away from Pac-Man
        const awayDirections = directionsToConsider.map(dir => {
          const newX = ghost.x + dir.x;
          const newY = ghost.y + dir.y;
          const distanceFromPacman = calculateDistance({ x: newX, y: newY }, pacman);
          return { direction: dir, distance: distanceFromPacman };
        }).sort((a, b) => b.distance - a.distance); // Sort by distance descending

        bestDirection = awayDirections[0].direction;
        console.log('😱 Ghost running away from Pac-Man');
      } else {
        // CHASE MODE: Move toward Pac-Man using proper pathfinding
        let targetPosition = { x: pacman.x, y: pacman.y };

        // Each ghost has slightly different targeting
        if (ghost.color === '#FFB8FF') { // Pink ghost - target 4 cells ahead of Pac-Man
          targetPosition = {
            x: Math.max(0, Math.min(MAZE_WIDTH - 1, pacman.x + pacman.direction.x * 4)),
            y: Math.max(0, Math.min(MAZE_HEIGHT - 1, pacman.y + pacman.direction.y * 4))
          };
        } else if (ghost.color === '#00FFFF') { // Cyan ghost - ambush behavior
          const distanceFromPacman = calculateDistance({ x: ghost.x, y: ghost.y }, pacman);
          if (distanceFromPacman > 8) {
            targetPosition = { x: pacman.x, y: pacman.y };
          } else {
            targetPosition = ghost.homeCorner; // Retreat to corner when close
          }
        } else if (ghost.color === '#FFB852') { // Orange ghost - conditional chase
          const distanceFromPacman = calculateDistance({ x: ghost.x, y: ghost.y }, pacman);
          targetPosition = distanceFromPacman > 8 ? { x: pacman.x, y: pacman.y } : ghost.homeCorner;
        }

        // Find best direction toward target
        const targetDirections = directionsToConsider.map(dir => {
          const newX = ghost.x + dir.x;
          const newY = ghost.y + dir.y;
          const distanceToTarget = calculateDistance({ x: newX, y: newY }, targetPosition);
          return { direction: dir, distance: distanceToTarget };
        }).sort((a, b) => a.distance - b.distance); // Sort by distance ascending

        bestDirection = targetDirections[0].direction;
        ghost.target = targetPosition;
      }

      // Apply movement
      const newX = ghost.x + bestDirection.x;
      const newY = ghost.y + bestDirection.y;

      if (isValidPosition(newX, newY)) {
        ghost.x = newX;
        ghost.y = newY;
        ghost.direction = bestDirection;
        
        // Reset stuck counter if moving successfully
        if (ghost.stuckCounter > 0) {
          ghost.stuckCounter = Math.max(0, ghost.stuckCounter - 1);
        }
      } else {
        ghost.stuckCounter++;
      }
    });

    // Check collisions after all ghosts have moved
    checkCollisions();
  }, []);

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
        gameState.powerModeTimer = 180; // 3 seconds at 60 FPS
        
        // Make ALL ghosts frightened and reverse their direction
        gameState.ghosts.forEach(ghost => {
          if (!ghost.eaten) {
            ghost.frightened = true;
            ghost.mode = 'frightened';
            ghost.stuckCounter = 0;
            ghost.lastValidDirections = [];
            // Reverse direction when becoming frightened
            ghost.direction = getOppositeDirection(ghost.direction);
          }
        });
        
        setScore(gameState.score);
        console.log('💩 Power mode activated! All ghosts frightened for 3 seconds');
      }

      // Check win condition
      const remainingPellets = gameState.pellets.flat().filter(p => p).length + 
                              gameState.powerPellets.flat().filter(p => p).length;
      if (remainingPellets === 0) {
        console.log('🏆 Level complete!');
        endGame();
      }
    }
  }, []);

  // Fixed collision detection
  const checkCollisions = useCallback(() => {
    if (!gameStateRef.current?.gameRunning) return;

    const gameState = gameStateRef.current;
    const pacman = gameState.pacman;

    gameState.ghosts.forEach(ghost => {
      if (ghost.eaten) return;

      // Check if ghost and Pac-Man are on the same position
      if (ghost.x === pacman.x && ghost.y === pacman.y) {
        if (ghost.frightened) {
          // Pac-Man eats ghost
          ghost.eaten = true;
          ghost.frightened = false;
          ghost.mode = 'chase';
          ghost.respawnTimer = 300; // 5 seconds at 60 FPS
          gameState.score += 200;
          setScore(gameState.score);
          console.log('👻 Ghost eaten! Score:', gameState.score);
        } else {
          // Ghost kills Pac-Man
          gameState.lives--;
          setLives(gameState.lives);
          console.log('💀 Pac-Man died! Lives remaining:', gameState.lives);
          
          if (gameState.lives <= 0) {
            console.log('💀 Game Over!');
            endGame();
          } else {
            // Reset positions
            pacman.x = 16;
            pacman.y = 15;
            pacman.direction = DIRECTIONS.LEFT;
            pacman.nextDirection = null;
            
            // Reset ghosts
            gameState.ghosts.forEach((g, i) => {
              g.x = 16;
              g.y = 9 + (i % 2);
              g.frightened = false;
              g.eaten = false;
              g.respawnTimer = 0;
              g.mode = 'chase';
              g.stuckCounter = 0;
              g.lastValidDirections = [];
            });
            
            // Clear power mode
            gameState.powerMode = false;
            gameState.powerModeTimer = 0;
          }
        }
      }
    });
  }, []);

  // Handle power mode timer with proper ghost state management
  useEffect(() => {
    if (!gameStateRef.current) return;

    const gameState = gameStateRef.current;
    
    if (gameState.powerMode && gameState.powerModeTimer > 0) {
      gameState.powerModeTimer--;
      
      // Handle blinking effect in last 60 frames (1 second)
      const isBlinkingPhase = gameState.powerModeTimer <= 60;
      
      if (gameState.powerModeTimer <= 0) {
        // Power mode expired - reset ALL ghosts
        gameState.powerMode = false;
        gameState.ghosts.forEach(ghost => {
          if (!ghost.eaten) {
            ghost.frightened = false;
            ghost.mode = 'chase';
            ghost.stuckCounter = 0;
            ghost.lastValidDirections = [];
            console.log('👻 Ghost returned to chase mode');
          }
        });
        console.log('💪 Power mode ended - all ghosts now chasing');
      }
    }
  });

  // Render game with improved graphics
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

    // Draw power pellets (💩) - larger and animated
    const time = Date.now() / 300;
    for (let y = 0; y < gameState.powerPellets.length; y++) {
      for (let x = 0; x < gameState.powerPellets[y].length; x++) {
        if (gameState.powerPellets[y][x]) {
          const size = CELL_SIZE - 4 + Math.sin(time) * 2;
          ctx.font = `${size}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            '💩',
            x * CELL_SIZE + CELL_SIZE / 2,
            y * CELL_SIZE + CELL_SIZE / 2
          );
        }
      }
    }

    // Draw improved ghosts
    gameState.ghosts.forEach(ghost => {
      if (ghost.eaten) return;

      const centerX = ghost.x * CELL_SIZE + CELL_SIZE / 2;
      const centerY = ghost.y * CELL_SIZE + CELL_SIZE / 2;
      
      if (ghost.frightened) {
        // Draw blue frightened ghost with blinking effect near end
        const isBlinking = gameState.powerModeTimer <= 60; // Last 1 second
        ctx.fillStyle = isBlinking && Math.floor(Date.now() / 200) % 2 ? 
                       '#FFFFFF' : '#0000FF';
        
        // Improved ghost body
        ctx.beginPath();
        ctx.arc(centerX, centerY - 3, CELL_SIZE / 2 - 1, Math.PI, 0, false);
        ctx.lineTo(centerX + CELL_SIZE / 2 - 1, centerY + CELL_SIZE / 2 - 1);
        ctx.lineTo(centerX + 4, centerY + CELL_SIZE / 2 - 1);
        ctx.lineTo(centerX + 2, centerY + 4);
        ctx.lineTo(centerX, centerY + CELL_SIZE / 2 - 1);
        ctx.lineTo(centerX - 2, centerY + 4);
        ctx.lineTo(centerX - 4, centerY + CELL_SIZE / 2 - 1);
        ctx.lineTo(centerX - CELL_SIZE / 2 + 1, centerY + CELL_SIZE / 2 - 1);
        ctx.closePath();
        ctx.fill();
        
        // Eyes for frightened ghost
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(centerX - 6, centerY - 6, 4, 4);
        ctx.fillRect(centerX + 2, centerY - 6, 4, 4);
        ctx.fillStyle = '#000000';
        ctx.fillRect(centerX - 5, centerY - 5, 2, 2);
        ctx.fillRect(centerX + 3, centerY - 5, 2, 2);
        
        // Mouth
        ctx.fillStyle = '#000000';
        ctx.fillRect(centerX - 4, centerY + 2, 2, 2);
        ctx.fillRect(centerX - 1, centerY + 2, 2, 2);
        ctx.fillRect(centerX + 2, centerY + 2, 2, 2);
      } else {
        // Draw normal colored ghost with better graphics
        ctx.fillStyle = ghost.color;
        
        // Improved ghost body with rounded top and wavy bottom
        ctx.beginPath();
        ctx.arc(centerX, centerY - 3, CELL_SIZE / 2 - 1, Math.PI, 0, false);
        ctx.lineTo(centerX + CELL_SIZE / 2 - 1, centerY + CELL_SIZE / 2 - 1);
        ctx.lineTo(centerX + 4, centerY + CELL_SIZE / 2 - 1);
        ctx.lineTo(centerX + 2, centerY + 4);
        ctx.lineTo(centerX, centerY + CELL_SIZE / 2 - 1);
        ctx.lineTo(centerX - 2, centerY + 4);
        ctx.lineTo(centerX - 4, centerY + CELL_SIZE / 2 - 1);
        ctx.lineTo(centerX - CELL_SIZE / 2 + 1, centerY + CELL_SIZE / 2 - 1);
        ctx.closePath();
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(centerX - 4, centerY - 4, 3, 0, Math.PI * 2);
        ctx.arc(centerX + 4, centerY - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils - look toward Pac-Man
        const pacman = gameState.pacman;
        const dx = pacman.x - ghost.x;
        const dy = pacman.y - ghost.y;
        const pupilOffsetX = Math.sign(dx) * 1;
        const pupilOffsetY = Math.sign(dy) * 1;
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(centerX - 4 + pupilOffsetX, centerY - 4 + pupilOffsetY, 1.5, 0, Math.PI * 2);
        ctx.arc(centerX + 4 + pupilOffsetX, centerY - 4 + pupilOffsetY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Pac-Man with animated mouth
    const pacman = gameState.pacman;
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    
    // Determine mouth direction and create animated mouth
    const mouthAnimation = Math.sin(Date.now() / 100) * 0.3 + 0.3;
    let startAngle = 0.2 * Math.PI * mouthAnimation;
    let endAngle = (2 - 0.2 * mouthAnimation) * Math.PI;
    
    if (pacman.direction === DIRECTIONS.RIGHT) {
      startAngle = 0.2 * Math.PI * mouthAnimation;
      endAngle = (2 - 0.2 * mouthAnimation) * Math.PI;
    } else if (pacman.direction === DIRECTIONS.LEFT) {
      startAngle = (1 + 0.2 * mouthAnimation) * Math.PI;
      endAngle = (1 - 0.2 * mouthAnimation) * Math.PI;
    } else if (pacman.direction === DIRECTIONS.UP) {
      startAngle = (1.5 + 0.2 * mouthAnimation) * Math.PI;
      endAngle = (1.5 - 0.2 * mouthAnimation) * Math.PI;
    } else if (pacman.direction === DIRECTIONS.DOWN) {
      startAngle = (0.5 + 0.2 * mouthAnimation) * Math.PI;
      endAngle = (0.5 - 0.2 * mouthAnimation) * Math.PI;
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

    console.log('🏁 Ending game...');
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
      console.error('❌ Error recording game session:', error);
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
    
    // Move every 150ms for smooth gameplay
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
      console.log('🎮 Starting game - spending 1 credit...');
      await spendCredits.mutateAsync({
        userId: user.id,
        amount: 1,
        description: "Miss POOPEE-Man game entry fee"
      });

      console.log('💳 Credit spent, initializing game...');
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
        {gameStateRef.current?.powerMode && (
          <div className="text-lg text-blue-400">
            POWER MODE! ({Math.ceil(gameStateRef.current.powerModeTimer / 60)}s)
          </div>
        )}
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
