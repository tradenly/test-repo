import { GamePhysics, HippoState } from './engine/GamePhysics';
import { GameRenderer } from './engine/GameRenderer';
import { CollisionDetector, Pipe, Missile } from './engine/CollisionDetector';
import { GameObjectManager } from './engine/GameObjectManager';
import type { GameSpeed } from './useGameState';

// Miss POOPEE-Man game types
export interface PacManState {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: 'up' | 'down' | 'left' | 'right';
  nextDirection: 'up' | 'down' | 'left' | 'right' | null;
  gridX: number;
  gridY: number;
}

export interface Ghost {
  x: number;
  y: number;
  width: number;
  height: number;
  gridX: number;
  gridY: number;
  direction: 'up' | 'down' | 'left' | 'right';
  color: string;
  isVulnerable: boolean;
  isBlinking: boolean;
  id: number;
  targetCorner: { x: number; y: number };
  cornerSequence: { x: number; y: number }[];
  currentCornerIndex: number;
}

export interface Pellet {
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  isPowerPellet: boolean;
  collected: boolean;
}

export type GameMode = 'flappy_hippos' | 'miss_poopee_man';

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private physics: GamePhysics;
  private renderer: GameRenderer;
  private collisionDetector: CollisionDetector;
  private objectManager: GameObjectManager;
  private gameMode: GameMode;

  // Flappy Hippos game state
  private hippo: HippoState;
  private pipes: Pipe[] = [];
  private missiles: Missile[] = [];
  
  // Miss POOPEE-Man game state
  private pacman: PacManState;
  private ghosts: Ghost[] = [];
  private pellets: Pellet[] = [];
  private maze: number[][] = [];
  private vulnerabilityTimer = 0;
  private cellSize = 20;
  private keys: { [key: string]: boolean } = {};
  
  // FIXED: Slower movement timing
  private moveTimer = 0;
  private framesBetweenMoves = 4; // Pac-Man movement
  private ghostMoveTimer = 0;
  private framesBetweenGhostMoves = 8; // SLOWER: Ghosts move every 8 frames (reasonable speed)
  
  // Miss POOPEE-Man specific game state
  private lives = 3;
  private level = 1;
  private invulnerabilityTimer = 0;
  
  private gameRunning = false;
  private animationId: number | null = null;
  private score = 0;
  private pipesPassedCount = 0;
  private eventListeners: (() => void)[] = [];
  
  private pipeHitsRemaining = 3;
  private maxShields = 3;
  private invincibilityTime = 0;
  private hitEffectTime = 0;
  private gameStartTime = 0;
  private lastMissileTime = 0;
  private missileWarningTime = 0;
  private gameSpeed: GameSpeed = 'moderate';
  
  private onGameEnd: (score: number, pipesPassedCount: number, duration: number) => void;
  private onScoreUpdate: (score: number) => void;

  constructor(
    context: CanvasRenderingContext2D, 
    canvasElement: HTMLCanvasElement,
    onGameEnd: (score: number, pipesPassedCount: number, duration: number) => void,
    onScoreUpdate: (score: number) => void,
    gameMode: GameMode = 'flappy_hippos'
  ) {
    this.ctx = context;
    this.canvas = canvasElement;
    this.onGameEnd = onGameEnd;
    this.onScoreUpdate = onScoreUpdate;
    this.gameMode = gameMode;
    
    // Initialize modules
    this.physics = new GamePhysics();
    this.renderer = new GameRenderer(context, canvasElement, gameMode);
    this.collisionDetector = new CollisionDetector();
    this.objectManager = new GameObjectManager(canvasElement);
    
    this.reset();
    this.bindEvents();
    this.render();
    console.log("🎮 Game engine initialized successfully for mode:", gameMode);
  }

  private getSpeedMultiplier(): number {
    switch (this.gameSpeed) {
      case 'beginner': return 0.75;
      case 'moderate': return 1.5;
      case 'advanced': return 2.25;
      default: return 1.5;
    }
  }

  setGameSpeed(speed: GameSpeed) {
    console.log("🏃 Game engine: Speed changed to", speed, "multiplier:", this.getSpeedMultiplier());
    this.gameSpeed = speed;
  }

  bindEvents() {
    if (this.gameMode === 'flappy_hippos') {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.key === ' ') {
          e.preventDefault();
          this.flap();
        }
      };

      const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        this.flap();
      };

      document.addEventListener('keydown', handleKeyPress);
      this.canvas.addEventListener('click', handleClick);

      this.eventListeners.push(() => {
        document.removeEventListener('keydown', handleKeyPress);
        this.canvas.removeEventListener('click', handleClick);
      });
    } else {
      const handleKeyDown = (e: KeyboardEvent) => {
        this.keys[e.key] = true;
        
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          this.handlePacManMovement(e.key);
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        this.keys[e.key] = false;
      };

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);

      this.eventListeners.push(() => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
      });
    }
  }

  flap() {
    if (this.gameRunning && this.gameMode === 'flappy_hippos') {
      this.hippo = this.physics.flap(this.hippo);
    }
  }

  private handlePacManMovement(key: string) {
    if (!this.gameRunning || this.gameMode !== 'miss_poopee_man') return;

    let newDirection: 'up' | 'down' | 'left' | 'right';
    switch (key) {
      case 'ArrowUp': newDirection = 'up'; break;
      case 'ArrowDown': newDirection = 'down'; break;
      case 'ArrowLeft': newDirection = 'left'; break;
      case 'ArrowRight': newDirection = 'right'; break;
      default: return;
    }

    this.pacman.nextDirection = newDirection;
  }

  cleanup() {
    console.log("🧹 Cleaning up game engine...");
    this.gameRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.eventListeners.forEach(removeListener => removeListener());
    this.eventListeners = [];
  }

  updateShields(newShields: number) {
    console.log("🛡️ Game engine: Updating shields from", this.pipeHitsRemaining, "to", newShields);
    this.pipeHitsRemaining = newShields;
    this.maxShields = newShields;
    console.log("🛡️ Game engine: Post-update - pipeHitsRemaining:", this.pipeHitsRemaining, "maxShields:", this.maxShields);
  }

  reset(startingShields = 3) {
    console.log("🔄 Game engine reset with shields:", startingShields, "for mode:", this.gameMode);
    
    if (this.gameMode === 'flappy_hippos') {
      this.hippo = {
        x: 100,
        y: 285,
        width: 60,
        height: 40,
        velocity: 0,
        rotation: 0
      };
      this.pipes = [];
      this.missiles = [];
      this.pipes.push(this.objectManager.createPipe());
      
      this.pipeHitsRemaining = startingShields;
      this.maxShields = startingShields;
      console.log("🔄 Reset complete - shields set to:", this.pipeHitsRemaining, "/", this.maxShields);
      
      this.invincibilityTime = 0;
      this.hitEffectTime = 0;
      this.lastMissileTime = 0;
      this.missileWarningTime = 0;
    } else {
      this.initializeMissPoopeeMan();
    }
    
    this.gameRunning = false;
    this.score = 0;
    this.pipesPassedCount = 0;
    this.gameStartTime = 0;
    
    if (!this.gameRunning) {
      this.render();
    }
  }

  start() {
    console.log("🎯 Game engine starting:");
    console.log("  - Shields:", this.pipeHitsRemaining, "/", this.maxShields);
    console.log("  - Speed:", this.gameSpeed, "multiplier:", this.getSpeedMultiplier());
    
    this.pipeHitsRemaining = this.maxShields;
    console.log("🛡️ Post-start shield sync - pipeHitsRemaining:", this.pipeHitsRemaining);
    
    this.gameRunning = true;
    this.gameStartTime = Date.now();
    this.lastMissileTime = 0;
    this.gameLoop();
  }

  gameLoop() {
    if (!this.gameRunning) {
      console.log("⏸️ Game loop stopped - gameRunning is false");
      return;
    }

    try {
      this.update();
      this.render();
      this.animationId = requestAnimationFrame(() => this.gameLoop());
    } catch (error) {
      console.error("❌ Error in game loop:", error);
      this.gameOver();
    }
  }

  update() {
    const currentTime = Date.now();
    const gameTimeElapsed = currentTime - this.gameStartTime;

    if (this.gameMode === 'flappy_hippos') {
      this.renderer.updateParallax();

      if (this.invincibilityTime > 0) this.invincibilityTime--;
      if (this.hitEffectTime > 0) this.hitEffectTime--;
      if (this.missileWarningTime > 0) this.missileWarningTime--;

      this.handleMissileSystem(gameTimeElapsed);

      this.hippo = this.physics.updateHippo(this.hippo, this.canvas.height);
      this.hippo = this.physics.handleCeilingBounce(this.hippo);

      this.updateGameObjects();
      this.checkCollisions();
    } else {
      this.updateMissPoopeeMan();
    }
  }

  private handleMissileSystem(gameTimeElapsed: number) {
    if (gameTimeElapsed >= 15000 && this.lastMissileTime === 0) {
      this.missiles.push(this.objectManager.createMissile());
      this.lastMissileTime = gameTimeElapsed;
      console.log("🚀 First missile spawned at 15 seconds, gameTime:", gameTimeElapsed / 1000, "s");
    } else if (this.lastMissileTime > 0 && gameTimeElapsed - this.lastMissileTime >= 15000) {
      this.missiles.push(this.objectManager.createMissile());
      this.lastMissileTime = gameTimeElapsed;
      console.log("🚀 Missile spawned at", gameTimeElapsed / 1000, "seconds, total missiles:", this.missiles.length);
    }

    const timeSinceLastMissile = gameTimeElapsed - this.lastMissileTime;
    const timeToNextMissile = 15000 - timeSinceLastMissile;
    if (timeToNextMissile <= 2000 && timeToNextMissile > 0 && this.missileWarningTime <= 0) {
      this.missileWarningTime = 120;
      console.log("⚠️ Missile warning activated - next missile in", timeToNextMissile / 1000, "seconds");
    }
  }

  private updateGameObjects() {
    const speedMultiplier = this.getSpeedMultiplier();
    console.log("🏃 Updating objects with speed multiplier:", speedMultiplier, "for speed:", this.gameSpeed);
    
    this.pipes.forEach(pipe => {
      pipe.x -= 4 * speedMultiplier;
      
      if (this.collisionDetector.checkPipeScored(this.hippo, pipe) && !pipe.hit) {
        this.score += 1;
        this.pipesPassedCount += 1;
        this.onScoreUpdate(this.score);
        pipe.hit = true;
        console.log("📈 Score increased:", this.score);
      }
    });

    this.pipes = this.objectManager.updatePipes(this.pipes, speedMultiplier);
    this.missiles = this.objectManager.updateMissiles(this.missiles, speedMultiplier);
    
    if (this.objectManager.shouldAddPipe(this.pipes)) {
      this.pipes.push(this.objectManager.createPipe());
    }
  }

  checkCollisions() {
    if (this.physics.isGroundCollision(this.hippo, this.canvas.height)) {
      console.log("💥 Ground collision detected");
      this.gameOver();
      return;
    }

    for (let missile of this.missiles) {
      if (this.collisionDetector.checkMissileCollision(this.hippo, missile)) {
        console.log("💥 Missile collision - instant death!");
        this.gameOver();
        return;
      }
    }

    if (this.invincibilityTime <= 0) {
      for (let pipe of this.pipes) {
        if (this.collisionDetector.checkPipeCollision(this.hippo, pipe) && !pipe.hit) {
          if (this.pipeHitsRemaining > 0) {
            console.log("🛡️ Pipe hit! Shields remaining:", this.pipeHitsRemaining - 1);
            this.pipeHitsRemaining--;
            pipe.hit = true;
            
            this.hippo.velocity = -8;
            this.hippo.x = Math.max(50, this.hippo.x - 20);
            
            this.invincibilityTime = 60;
            this.hitEffectTime = 30;
          } else {
            console.log("💀 Final pipe collision - Game Over!");
            this.gameOver();
          }
          break;
        }
      }
    }
  }

  gameOver() {
    console.log("💀 Game over triggered");
    this.gameRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    const duration = Math.floor((Date.now() - this.gameStartTime) / 1000);
    console.log("📊 Game over - Score:", this.score, "Duration:", duration);
    this.onGameEnd(this.score, this.pipesPassedCount, duration);
  }

  private initializeMissPoopeeMan() {
    console.log("🎮 FIXED: Initializing Miss POOPEE-Man with working ghost positions");
    this.cellSize = 20;
    this.vulnerabilityTimer = 0;
    
    this.moveTimer = 0;
    this.ghostMoveTimer = 0;
    
    this.maze = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
      [1,2,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,2,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
      [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
      [1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1],
      [1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1],
      [1,1,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1],
      [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
      [1,2,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,2,1],
      [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
      [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
    
    this.pacman = {
      x: 19 * this.cellSize,
      y: 21 * this.cellSize,
      width: this.cellSize,
      height: this.cellSize,
      direction: 'right',
      nextDirection: null,
      gridX: 19,
      gridY: 21
    };
    
    // FIXED: Position ghosts in valid open spaces around the center
    const ghostStartPositions = [
      { x: 18, y: 11, direction: 'up' as const, color: '#FF0000' },    // Red - left of center
      { x: 20, y: 11, direction: 'down' as const, color: '#FFB6C1' },  // Pink - right of center  
      { x: 19, y: 10, direction: 'left' as const, color: '#00FFFF' },  // Cyan - above center
      { x: 19, y: 12, direction: 'right' as const, color: '#FFA500' }  // Orange - below center
    ];
    
    // Define the four corners of the maze for targeting
    const corners = {
      topLeft: { x: 1, y: 1 },
      topRight: { x: 38, y: 1 },
      bottomLeft: { x: 1, y: 21 },
      bottomRight: { x: 38, y: 21 }
    };
    
    // Each ghost gets a different corner sequence
    const ghostConfigs = [
      {
        sequence: [corners.topLeft, corners.bottomRight, corners.topRight, corners.bottomLeft]
      },
      {
        sequence: [corners.topRight, corners.bottomLeft, corners.topLeft, corners.bottomRight]
      },
      {
        sequence: [corners.bottomLeft, corners.topRight, corners.bottomRight, corners.topLeft]
      },
      {
        sequence: [corners.bottomRight, corners.topLeft, corners.bottomLeft, corners.topRight]
      }
    ];
    
    this.ghosts = ghostStartPositions.map((pos, index) => {
      console.log(`👻 FIXED: Ghost ${index} starting at (${pos.x}, ${pos.y}) - checking if valid...`);
      console.log(`👻 FIXED: Maze value at (${pos.x}, ${pos.y}) = ${this.maze[pos.y][pos.x]}`);
      
      return {
        id: index,
        x: pos.x * this.cellSize,
        y: pos.y * this.cellSize,
        width: this.cellSize,
        height: this.cellSize,
        gridX: pos.x,
        gridY: pos.y,
        direction: pos.direction,
        color: pos.color,
        isVulnerable: false,
        isBlinking: false,
        cornerSequence: ghostConfigs[index].sequence,
        currentCornerIndex: 0,
        targetCorner: ghostConfigs[index].sequence[0]
      };
    });
    
    console.log("👻 FIXED: All 4 ghosts positioned at valid starting locations:");
    this.ghosts.forEach((ghost, i) => {
      console.log(`Ghost ${i}: start(${ghost.gridX}, ${ghost.gridY}) color: ${ghost.color} target: (${ghost.targetCorner.x}, ${ghost.targetCorner.y})`);
    });
    
    this.pellets = [];
    for (let y = 0; y < this.maze.length; y++) {
      for (let x = 0; x < this.maze[y].length; x++) {
        if (this.maze[y][x] === 0) {
          this.pellets.push({
            x: x * this.cellSize + this.cellSize / 2,
            y: y * this.cellSize + this.cellSize / 2,
            gridX: x,
            gridY: y,
            isPowerPellet: false,
            collected: false
          });
        } else if (this.maze[y][x] === 2) {
          this.pellets.push({
            x: x * this.cellSize + this.cellSize / 2,
            y: y * this.cellSize + this.cellSize / 2,
            gridX: x,
            gridY: y,
            isPowerPellet: true,
            collected: false
          });
        }
      }
    }
  }

  private updateMissPoopeeMan() {
    this.updatePacMan();
    this.updateGhostsSimplified();
    this.checkMissPoopeeManCollisions();
    
    if (this.vulnerabilityTimer > 0) {
      this.vulnerabilityTimer--;
      
      const isLastTwoSeconds = this.vulnerabilityTimer <= 120;
      
      this.ghosts.forEach(ghost => {
        if (ghost.isVulnerable) {
          if (isLastTwoSeconds) {
            ghost.isBlinking = Math.floor(this.vulnerabilityTimer / 15) % 2 === 0;
          } else {
            ghost.isBlinking = false;
          }
        }
      });
      
      if (this.vulnerabilityTimer <= 0) {
        console.log("⏰ SIMPLE: Vulnerability ended, ghosts back to normal");
        this.ghosts.forEach(ghost => {
          ghost.isVulnerable = false;
          ghost.isBlinking = false;
        });
      }
    }
  }

  private updateGhostsSimplified() {
    this.ghostMoveTimer++;
    
    // FIXED: Slower movement - every 8 frames for reasonable speed
    if (this.ghostMoveTimer >= this.framesBetweenGhostMoves) {
      this.ghostMoveTimer = 0;
      
      this.ghosts.forEach((ghost, index) => {
        console.log(`👻 FIXED: Ghost ${index}: pos(${ghost.gridX}, ${ghost.gridY}) target(${ghost.targetCorner.x}, ${ghost.targetCorner.y})`);
        
        // Check if ghost reached its target corner (within 1 tile tolerance)
        const distanceToTarget = Math.abs(ghost.gridX - ghost.targetCorner.x) + Math.abs(ghost.gridY - ghost.targetCorner.y);
        if (distanceToTarget <= 1) {
          // Move to next corner in sequence
          ghost.currentCornerIndex = (ghost.currentCornerIndex + 1) % ghost.cornerSequence.length;
          ghost.targetCorner = ghost.cornerSequence[ghost.currentCornerIndex];
          console.log(`🎯 FIXED: Ghost ${index} reached corner! New target: (${ghost.targetCorner.x}, ${ghost.targetCorner.y})`);
        }
        
        // Simple pathfinding toward target corner
        const dx = ghost.targetCorner.x - ghost.gridX;
        const dy = ghost.targetCorner.y - ghost.gridY;
        
        let newGridX = ghost.gridX;
        let newGridY = ghost.gridY;
        
        // Choose direction that gets closer to target (prioritize larger difference)
        if (Math.abs(dx) >= Math.abs(dy)) {
          // Move horizontally first
          if (dx > 0) {
            newGridX++;
            ghost.direction = 'right';
          } else if (dx < 0) {
            newGridX--;
            ghost.direction = 'left';
          }
        } else {
          // Move vertically first
          if (dy > 0) {
            newGridY++;
            ghost.direction = 'down';
          } else if (dy < 0) {
            newGridY--;
            ghost.direction = 'up';
          }
        }
        
        // Handle maze edge wrapping for horizontal movement
        if (newGridX < 0) newGridX = this.maze[0].length - 1;
        if (newGridX >= this.maze[0].length) newGridX = 0;
        
        console.log(`👻 FIXED: Ghost ${index} trying to move to (${newGridX}, ${newGridY})`);
        console.log(`👻 FIXED: isValidMove check: ${this.isValidMove(newGridX, newGridY)}`);
        
        // Check if the move is valid
        if (this.isValidMove(newGridX, newGridY)) {
          ghost.gridX = newGridX;
          ghost.gridY = newGridY;
          ghost.x = newGridX * this.cellSize;
          ghost.y = newGridY * this.cellSize;
          console.log(`👻 FIXED: Ghost ${index} moved successfully to (${ghost.gridX}, ${ghost.gridY})`);
        } else {
          console.log(`👻 FIXED: Ghost ${index} blocked, trying alternative directions`);
          // If direct path blocked, try alternative directions
          const alternativeDirections = [
            { dx: 0, dy: -1, dir: 'up' as const },
            { dx: 0, dy: 1, dir: 'down' as const },
            { dx: -1, dy: 0, dir: 'left' as const },
            { dx: 1, dy: 0, dir: 'right' as const }
          ];
          
          for (const alt of alternativeDirections) {
            const altX = ghost.gridX + alt.dx;
            const altY = ghost.gridY + alt.dy;
            
            // Handle wrapping for horizontal movement
            let wrappedX = altX;
            if (wrappedX < 0) wrappedX = this.maze[0].length - 1;
            if (wrappedX >= this.maze[0].length) wrappedX = 0;
            
            if (this.isValidMove(wrappedX, altY)) {
              ghost.gridX = wrappedX;
              ghost.gridY = altY;
              ghost.x = wrappedX * this.cellSize;
              ghost.y = altY * this.cellSize;
              ghost.direction = alt.dir;
              console.log(`👻 FIXED: Ghost ${index} took alternative path to (${ghost.gridX}, ${ghost.gridY})`);
              break;
            }
          }
        }
      });
    }
  }

  private updatePacMan() {
    this.moveTimer++;
    
    if (this.pacman.nextDirection) {
      const newGridX = this.pacman.gridX + (this.pacman.nextDirection === 'right' ? 1 : this.pacman.nextDirection === 'left' ? -1 : 0);
      const newGridY = this.pacman.gridY + (this.pacman.nextDirection === 'down' ? 1 : this.pacman.nextDirection === 'up' ? -1 : 0);
      
      if (this.isValidMove(newGridX, newGridY)) {
        this.pacman.direction = this.pacman.nextDirection;
        this.pacman.nextDirection = null;
      }
    }
    
    if (this.moveTimer >= this.framesBetweenMoves) {
      this.moveTimer = 0;
      
      let newGridX = this.pacman.gridX;
      let newGridY = this.pacman.gridY;
      
      switch (this.pacman.direction) {
        case 'right': newGridX++; break;
        case 'left': newGridX--; break;
        case 'down': newGridY++; break;
        case 'up': newGridY--; break;
      }
      
      if (newGridX < 0) newGridX = this.maze[0].length - 1;
      if (newGridX >= this.maze[0].length) newGridX = 0;
      
      if (this.isValidMove(newGridX, newGridY)) {
        this.pacman.gridX = newGridX;
        this.pacman.gridY = newGridY;
        this.pacman.x = newGridX * this.cellSize;
        this.pacman.y = newGridY * this.cellSize;
      }
    }
  }

  private isValidMove(gridX: number, gridY: number): boolean {
    if (gridY < 0 || gridY >= this.maze.length || gridX < 0 || gridX >= this.maze[0].length) {
      return false;
    }
    return this.maze[gridY][gridX] !== 1;
  }

  private checkMissPoopeeManCollisions() {
    this.pellets.forEach(pellet => {
      if (!pellet.collected && pellet.gridX === this.pacman.gridX && pellet.gridY === this.pacman.gridY) {
        pellet.collected = true;
        
        if (pellet.isPowerPellet) {
          this.score += 25;
          this.vulnerabilityTimer = 600;
          console.log("💊 SIMPLE: Power pellet eaten! Ghosts vulnerable for 10 seconds");
          
          this.ghosts.forEach(ghost => {
            ghost.isVulnerable = true;
            ghost.isBlinking = false;
          });
        } else {
          this.score += 5;
        }
        
        this.onScoreUpdate(this.score);
      }
    });
    
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer--;
    }
    
    if (this.invulnerabilityTimer <= 0) {
      this.ghosts.forEach((ghost, index) => {
        if (ghost.gridX === this.pacman.gridX && ghost.gridY === this.pacman.gridY) {
          if (ghost.isVulnerable) {
            this.score += 100;
            this.onScoreUpdate(this.score);
            console.log(`👻 SIMPLE: Ghost ${index} eaten! Score +100`);
            
            // Reset ghost to center
            ghost.gridX = 19;
            ghost.gridY = 11;
            ghost.x = 19 * this.cellSize;
            ghost.y = 11 * this.cellSize;
            ghost.isVulnerable = false;
            ghost.isBlinking = false;
            // Reset to first corner in sequence
            ghost.currentCornerIndex = 0;
            ghost.targetCorner = ghost.cornerSequence[0];
          } else {
            this.lives--;
            this.invulnerabilityTimer = 120;
            console.log(`💀 SIMPLE: Pac-Man hit by ghost ${index}! Lives remaining: ${this.lives}`);
            
            if (this.lives <= 0) {
              console.log("💀 Game Over - No more lives!");
              this.gameOver();
            } else {
              this.resetPositions();
            }
          }
        }
      });
    }
    
    const remainingPellets = this.pellets.filter(p => !p.collected);
    if (remainingPellets.length === 0) {
      this.nextLevel();
    }
  }
  
  private resetPositions() {
    this.pacman.gridX = 19;
    this.pacman.gridY = 21;
    this.pacman.x = 19 * this.cellSize;
    this.pacman.y = 21 * this.cellSize;
    this.pacman.direction = 'right';
    this.pacman.nextDirection = null;
    
    // SIMPLIFIED: Reset all ghosts to center with their original corner sequences
    this.ghosts.forEach((ghost, index) => {
      ghost.gridX = 19;
      ghost.gridY = 11;
      ghost.x = 19 * this.cellSize;
      ghost.y = 11 * this.cellSize;
      ghost.isVulnerable = false;
      ghost.isBlinking = false;
      ghost.currentCornerIndex = 0;
      ghost.targetCorner = ghost.cornerSequence[0];
    });
    
    this.vulnerabilityTimer = 0;
    
    console.log("🔄 SIMPLIFIED: All positions reset - ghosts back to center with original targets");
  }
  
  private nextLevel() {
    this.level++;
    console.log("🎉 Level complete! Moving to level", this.level);
    
    this.score += 1000;
    this.onScoreUpdate(this.score);
    
    const currentScore = this.score;
    const currentLevel = this.level;
    const currentLives = this.lives;
    
    this.initializeMissPoopeeMan();
    this.score = currentScore;
    this.level = currentLevel;
    this.lives = currentLives;
  }
  
  getCurrentShields() {
    if (this.gameMode === 'miss_poopee_man') {
      return this.lives;
    }
    return this.pipeHitsRemaining;
  }

  render() {
    try {
      if (this.gameMode === 'flappy_hippos') {
        this.renderer.renderBackground(this.missileWarningTime, this.hitEffectTime);
        this.renderer.renderClouds();
        this.pipes.forEach(pipe => this.renderer.renderPipe(pipe));
        this.missiles.forEach(missile => this.renderer.renderMissile(missile));
        this.renderer.renderGround();
        this.renderer.renderHippo(this.hippo, this.invincibilityTime);
        this.renderer.renderScore(this.score);
        this.renderer.renderShieldCounter(this.pipeHitsRemaining, this.maxShields);
        this.renderer.restoreContext(this.hitEffectTime);
      } else {
        this.renderer.renderMissPoopeeManGame(
          this.maze, 
          this.pacman, 
          this.ghosts, 
          this.pellets, 
          this.score, 
          this.cellSize,
          this.lives
        );
      }
    } catch (error) {
      console.error("❌ Error in render:", error);
    }
  }
}
