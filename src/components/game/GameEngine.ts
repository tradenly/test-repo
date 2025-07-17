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
  mode: 'scatter' | 'chase' | 'frightened' | 'eaten' | 'leaving_house';
  modeTimer: number;
  homeX: number;
  homeY: number;
  releaseTimer: number;
  isInBox: boolean;
  id: number;
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
  private blinkTimer = 0;
  private cellSize = 20;
  private keys: { [key: string]: boolean } = {};
  
  // SIMPLIFIED: Basic movement timing
  private moveTimer = 0;
  private framesBetweenMoves = 6; // Slightly faster movement
  private ghostMoveTimer = 0;
  private framesBetweenGhostMoves = 8; // Ghost movement timing
  
  // SIMPLIFIED: Global mode system
  private globalModeTimer = 0;
  private currentGlobalMode: 'scatter' | 'chase' = 'scatter';
  private scatterTime = 420; // 7 seconds at 60fps
  private chaseTime = 1200; // 20 seconds at 60fps
  
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
      case 'beginner': return 0.75; // 3px per frame (slower than original)
      case 'moderate': return 1.5; // 6px per frame (original fast pace)
      case 'advanced': return 2.25; // 9px per frame (very fast)
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
      // Miss POOPEE-Man controls
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
      
      // CRITICAL: Always reset to the provided starting shields
      this.pipeHitsRemaining = startingShields;
      this.maxShields = startingShields;
      console.log("🔄 Reset complete - shields set to:", this.pipeHitsRemaining, "/", this.maxShields);
      
      this.invincibilityTime = 0;
      this.hitEffectTime = 0;
      this.lastMissileTime = 0;
      this.missileWarningTime = 0;
    } else {
      // Miss POOPEE-Man reset
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
    
    // CRITICAL: Ensure shields are in sync at start
    console.log("🛡️ Pre-start shield sync - pipeHitsRemaining:", this.pipeHitsRemaining, "maxShields:", this.maxShields);
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

      // Update timers
      if (this.invincibilityTime > 0) this.invincibilityTime--;
      if (this.hitEffectTime > 0) this.hitEffectTime--;
      if (this.missileWarningTime > 0) this.missileWarningTime--;

      // Missile system - 15 seconds
      this.handleMissileSystem(gameTimeElapsed);

      // Update hippo physics
      this.hippo = this.physics.updateHippo(this.hippo, this.canvas.height);
      this.hippo = this.physics.handleCeilingBounce(this.hippo);

      // Update game objects
      this.updateGameObjects();
      this.checkCollisions();
    } else {
      // Miss POOPEE-Man update
      this.updateMissPoopeeMan();
    }
  }

  private handleMissileSystem(gameTimeElapsed: number) {
    // Spawn missiles every 15 seconds
    if (gameTimeElapsed >= 15000 && this.lastMissileTime === 0) {
      this.missiles.push(this.objectManager.createMissile());
      this.lastMissileTime = gameTimeElapsed;
      console.log("🚀 First missile spawned at 15 seconds, gameTime:", gameTimeElapsed / 1000, "s");
    } else if (this.lastMissileTime > 0 && gameTimeElapsed - this.lastMissileTime >= 15000) {
      this.missiles.push(this.objectManager.createMissile());
      this.lastMissileTime = gameTimeElapsed;
      console.log("🚀 Missile spawned at", gameTimeElapsed / 1000, "seconds, total missiles:", this.missiles.length);
    }

    // Missile warning - 2 seconds before missile
    const timeSinceLastMissile = gameTimeElapsed - this.lastMissileTime;
    const timeToNextMissile = 15000 - timeSinceLastMissile;
    if (timeToNextMissile <= 2000 && timeToNextMissile > 0 && this.missileWarningTime <= 0) {
      this.missileWarningTime = 120; // 2 seconds at 60fps
      console.log("⚠️ Missile warning activated - next missile in", timeToNextMissile / 1000, "seconds");
    }
  }

  private updateGameObjects() {
    const speedMultiplier = this.getSpeedMultiplier();
    console.log("🏃 Updating objects with speed multiplier:", speedMultiplier, "for speed:", this.gameSpeed);
    
    // Update pipes with speed-adjusted movement (base speed 4px)
    this.pipes.forEach(pipe => {
      pipe.x -= 4 * speedMultiplier;
      
      if (this.collisionDetector.checkPipeScored(this.hippo, pipe) && !pipe.hit) {
        this.score += 1;
        this.pipesPassedCount += 1;
        this.onScoreUpdate(this.score);
        pipe.hit = true; // Mark as scored to prevent double counting
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
    // Ground collision - instant death
    if (this.physics.isGroundCollision(this.hippo, this.canvas.height)) {
      console.log("💥 Ground collision detected");
      this.gameOver();
      return;
    }

    // Missile collision - instant death regardless of shields
    for (let missile of this.missiles) {
      if (this.collisionDetector.checkMissileCollision(this.hippo, missile)) {
        console.log("💥 Missile collision - instant death!");
        this.gameOver();
        return;
      }
    }

    // Pipe collision - only if not invincible
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
    console.log("🎮 FIXED: Initializing Miss POOPEE-Man with working ghost AI");
    this.cellSize = 20;
    this.vulnerabilityTimer = 0;
    this.blinkTimer = 0;
    
    // Reset global mode system
    this.globalModeTimer = 0;
    this.currentGlobalMode = 'scatter';
    
    // Reset movement timers
    this.moveTimer = 0;
    this.ghostMoveTimer = 0;
    
    // Create simple maze layout
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
    
    // Initialize Pac-Man
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
    
    // FIXED: Initialize ghosts with proper release sequence and clear exit strategy
    this.ghosts = [
      {
        id: 0,
        x: 19 * this.cellSize, y: 9 * this.cellSize, // START OUTSIDE THE BOX!
        width: this.cellSize, height: this.cellSize,
        gridX: 19, gridY: 9, direction: 'left', color: '#FF0000', 
        isVulnerable: false, isBlinking: false,
        isInBox: false, releaseTimer: 0, // Blinky starts outside immediately
        homeX: 38, homeY: 1, // Top-right corner for scatter
        mode: 'scatter', modeTimer: this.scatterTime
      },
      {
        id: 1,
        x: 19 * this.cellSize, y: 11 * this.cellSize, // In the box center
        width: this.cellSize, height: this.cellSize,
        gridX: 19, gridY: 11, direction: 'up', color: '#FFB6C1', 
        isVulnerable: false, isBlinking: false,
        isInBox: true, releaseTimer: 180, // Pinky - 3 seconds
        homeX: 1, homeY: 1, // Top-left corner for scatter
        mode: 'leaving_house', modeTimer: 0
      },
      {
        id: 2,
        x: 18 * this.cellSize, y: 11 * this.cellSize, // Left side of box
        width: this.cellSize, height: this.cellSize,
        gridX: 18, gridY: 11, direction: 'up', color: '#00FFFF', 
        isVulnerable: false, isBlinking: false,
        isInBox: true, releaseTimer: 360, // Inky - 6 seconds
        homeX: 38, homeY: 21, // Bottom-right corner for scatter
        mode: 'leaving_house', modeTimer: 0
      },
      {
        id: 3,
        x: 20 * this.cellSize, y: 11 * this.cellSize, // Right side of box
        width: this.cellSize, height: this.cellSize,
        gridX: 20, gridY: 11, direction: 'up', color: '#FFA500', 
        isVulnerable: false, isBlinking: false,
        isInBox: true, releaseTimer: 540, // Clyde - 9 seconds
        homeX: 1, homeY: 21, // Bottom-left corner for scatter
        mode: 'leaving_house', modeTimer: 0
      }
    ];
    
    console.log("👻 FIXED Ghosts initialized:", this.ghosts.map((g, i) => `Ghost ${i}: box=${g.isInBox}, timer=${g.releaseTimer}, pos=(${g.gridX},${g.gridY})`));
    
    // Initialize pellets
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
    this.updateGhostsFixed();
    this.checkMissPoopeeManCollisions();
    
    // Global mode system
    this.globalModeTimer++;
    
    if (this.currentGlobalMode === 'scatter' && this.globalModeTimer >= this.scatterTime) {
      console.log("🔄 FIXED: Switching to CHASE mode");
      this.currentGlobalMode = 'chase';
      this.globalModeTimer = 0;
      // Update all active ghosts
      this.ghosts.forEach((ghost, index) => {
        if (!ghost.isInBox && ghost.mode !== 'frightened' && ghost.mode !== 'eaten') {
          ghost.mode = 'chase';
          ghost.modeTimer = this.chaseTime;
          console.log(`👻 Ghost ${index} switched to CHASE mode`);
        }
      });
    } else if (this.currentGlobalMode === 'chase' && this.globalModeTimer >= this.chaseTime) {
      console.log("🔄 FIXED: Switching to SCATTER mode");
      this.currentGlobalMode = 'scatter';
      this.globalModeTimer = 0;
      // Update all active ghosts
      this.ghosts.forEach((ghost, index) => {
        if (!ghost.isInBox && ghost.mode !== 'frightened' && ghost.mode !== 'eaten') {
          ghost.mode = 'scatter';
          ghost.modeTimer = this.scatterTime;
          console.log(`👻 Ghost ${index} switched to SCATTER mode`);
        }
      });
    }
    
    // Update power pellet timers
    if (this.vulnerabilityTimer > 0) {
      this.vulnerabilityTimer--;
      if (this.vulnerabilityTimer <= 180) { // Last 3 seconds
        this.blinkTimer++;
        if (this.blinkTimer > 30) { // Blink every 0.5 seconds
          this.blinkTimer = 0;
          this.ghosts.forEach(ghost => {
            if (ghost.isVulnerable) {
              ghost.isBlinking = !ghost.isBlinking;
            }
          });
        }
      }
      
      if (this.vulnerabilityTimer <= 0) {
        console.log("⏰ FIXED: Vulnerability timer expired");
        this.ghosts.forEach((ghost, index) => {
          if (ghost.mode === 'frightened') {
            ghost.isVulnerable = false;
            ghost.isBlinking = false;
            ghost.mode = this.currentGlobalMode;
            ghost.modeTimer = this.currentGlobalMode === 'scatter' ? this.scatterTime : this.chaseTime;
            console.log(`👻 Ghost ${index} returned to ${this.currentGlobalMode} mode`);
          }
        });
      }
    }
  }

  // COMPLETELY REWRITTEN: Working ghost update system
  private updateGhostsFixed() {
    this.ghostMoveTimer++;
    
    // Only move ghosts if enough time has passed
    if (this.ghostMoveTimer >= this.framesBetweenGhostMoves) {
      this.ghostMoveTimer = 0;
      
      this.ghosts.forEach((ghost, index) => {
        // FIXED: Handle release from box with clear exit path
        if (ghost.isInBox) {
          if (ghost.releaseTimer > 0) {
            ghost.releaseTimer--;
            console.log(`👻 Ghost ${index} release timer: ${ghost.releaseTimer}`);
            return;
          } else {
            // FIXED: Release the ghost by moving them up to exit position
            console.log(`👻 FIXED: Ghost ${index} being released from box`);
            ghost.isInBox = false;
            ghost.gridY = 9; // Move to the exit row above the box
            ghost.y = ghost.gridY * this.cellSize;
            ghost.mode = this.currentGlobalMode;
            ghost.modeTimer = this.currentGlobalMode === 'scatter' ? this.scatterTime : this.chaseTime;
            ghost.direction = 'left'; // Start moving left after exit
          }
        }
        
        // FIXED: Move ghost with working logic
        this.moveGhostFixed(ghost);
      });
    }
  }

  // COMPLETELY REWRITTEN: Working ghost movement
  private moveGhostFixed(ghost: Ghost) {
    // Determine target based on mode
    let targetX: number, targetY: number;
    
    switch (ghost.mode) {
      case 'leaving_house':
        // Simple: just move up to exit the house
        targetX = 19; // Center column
        targetY = 9; // Exit row
        if (ghost.gridX === 19 && ghost.gridY === 9) {
          ghost.mode = this.currentGlobalMode;
          console.log(`👻 FIXED: Ghost ${ghost.id} has left the house, switching to ${this.currentGlobalMode}`);
        }
        break;
        
      case 'scatter':
        targetX = ghost.homeX;
        targetY = ghost.homeY;
        break;
        
      case 'chase':
        targetX = this.pacman.gridX;
        targetY = this.pacman.gridY;
        break;
        
      case 'frightened':
        // Move away from Pac-Man
        const diffX = this.pacman.gridX - ghost.gridX;
        const diffY = this.pacman.gridY - ghost.gridY;
        targetX = ghost.gridX - Math.sign(diffX) * 10;
        targetY = ghost.gridY - Math.sign(diffY) * 10;
        // Keep in bounds
        targetX = Math.max(1, Math.min(targetX, 38));
        targetY = Math.max(1, Math.min(targetY, 21));
        break;
        
      case 'eaten':
        // Return to center
        targetX = 19;
        targetY = 11;
        if (ghost.gridX === 19 && ghost.gridY === 11) {
          ghost.mode = this.currentGlobalMode;
          ghost.isVulnerable = false;
          console.log(`👻 FIXED: Ghost ${ghost.id} returned to house`);
        }
        break;
        
      default:
        targetX = ghost.homeX;
        targetY = ghost.homeY;
    }
    
    // FIXED: Simple but working pathfinding
    const possibleMoves = [
      { dx: 0, dy: -1, direction: 'up' as const },
      { dx: 0, dy: 1, direction: 'down' as const },
      { dx: -1, dy: 0, direction: 'left' as const },
      { dx: 1, dy: 0, direction: 'right' as const }
    ];
    
    let bestMove = null;
    let bestDistance = Infinity;
    
    for (const move of possibleMoves) {
      let newGridX = ghost.gridX + move.dx;
      let newGridY = ghost.gridY + move.dy;
      
      // Handle tunnel wraparound
      if (newGridX < 0) newGridX = this.maze[0].length - 1;
      if (newGridX >= this.maze[0].length) newGridX = 0;
      
      // Check if move is valid
      if (this.isValidMove(newGridX, newGridY)) {
        // Calculate distance to target
        const distance = Math.abs(newGridX - targetX) + Math.abs(newGridY - targetY);
        
        // Avoid reversing direction unless it's the only option
        const isReverse = this.getOppositeDirection(ghost.direction) === move.direction;
        const finalDistance = isReverse ? distance + 0.5 : distance;
        
        if (finalDistance < bestDistance) {
          bestDistance = finalDistance;
          bestMove = { ...move, newGridX, newGridY };
        }
      }
    }
    
    // Execute the move
    if (bestMove) {
      ghost.gridX = bestMove.newGridX;
      ghost.gridY = bestMove.newGridY;
      ghost.x = bestMove.newGridX * this.cellSize;
      ghost.y = bestMove.newGridY * this.cellSize;
      ghost.direction = bestMove.direction;
    }
  }

  private getOppositeDirection(direction: string): string {
    switch (direction) {
      case 'up': return 'down';
      case 'down': return 'up';
      case 'left': return 'right';
      case 'right': return 'left';
      default: return '';
    }
  }

  private updatePacMan() {
    // Increment movement timer
    this.moveTimer++;
    
    // Check if we can change direction
    if (this.pacman.nextDirection) {
      const newGridX = this.pacman.gridX + (this.pacman.nextDirection === 'right' ? 1 : this.pacman.nextDirection === 'left' ? -1 : 0);
      const newGridY = this.pacman.gridY + (this.pacman.nextDirection === 'down' ? 1 : this.pacman.nextDirection === 'up' ? -1 : 0);
      
      if (this.isValidMove(newGridX, newGridY)) {
        this.pacman.direction = this.pacman.nextDirection;
        this.pacman.nextDirection = null;
      }
    }
    
    // Only move if enough time has passed
    if (this.moveTimer >= this.framesBetweenMoves) {
      this.moveTimer = 0; // Reset timer
      
      // Move in current direction
      let newGridX = this.pacman.gridX;
      let newGridY = this.pacman.gridY;
      
      switch (this.pacman.direction) {
        case 'right': newGridX++; break;
        case 'left': newGridX--; break;
        case 'down': newGridY++; break;
        case 'up': newGridY--; break;
      }
      
      // Handle tunnel wraparound
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
    // Check pellet collection
    this.pellets.forEach(pellet => {
      if (!pellet.collected && pellet.gridX === this.pacman.gridX && pellet.gridY === this.pacman.gridY) {
        pellet.collected = true;
        
        if (pellet.isPowerPellet) {
          this.score += 25;
          this.vulnerabilityTimer = 600; // 10 seconds at 60fps
          console.log("💊 FIXED: Power pellet eaten! Ghosts frightened for 10 seconds");
          
          this.ghosts.forEach((ghost, index) => {
            if (!ghost.isInBox && ghost.mode !== 'eaten') {
              ghost.isVulnerable = true;
              ghost.isBlinking = false;
              ghost.mode = 'frightened';
              ghost.modeTimer = 600;
              console.log(`👻 FIXED: Ghost ${index} is now frightened`);
            }
          });
        } else {
          this.score += 5;
        }
        
        this.onScoreUpdate(this.score);
      }
    });
    
    // Update invulnerability timer
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer--;
    }
    
    // Check ghost collisions (only if not invulnerable)
    if (this.invulnerabilityTimer <= 0) {
      this.ghosts.forEach((ghost, index) => {
        if (ghost.gridX === this.pacman.gridX && ghost.gridY === this.pacman.gridY && !ghost.isInBox) {
          if (ghost.isVulnerable && ghost.mode === 'frightened') {
            // Eat ghost
            this.score += 100;
            this.onScoreUpdate(this.score);
            console.log(`👻 FIXED: Ghost ${index} eaten! Score +100`);
            
            // Send ghost back to house
            ghost.gridX = 19;
            ghost.gridY = 11;
            ghost.x = 19 * this.cellSize;
            ghost.y = 11 * this.cellSize;
            ghost.isVulnerable = false;
            ghost.isBlinking = false;
            ghost.mode = 'eaten';
            ghost.modeTimer = 300;
          } else if (ghost.mode !== 'eaten') {
            // Lose a life
            this.lives--;
            this.invulnerabilityTimer = 120; // 2 seconds of invulnerability
            console.log(`💀 FIXED: Pac-Man hit by ghost ${index}! Lives remaining: ${this.lives}`);
            
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
    
    // Check if all pellets collected
    const remainingPellets = this.pellets.filter(p => !p.collected);
    if (remainingPellets.length === 0) {
      this.nextLevel();
    }
  }
  
  private resetPositions() {
    // Reset Pac-Man position
    this.pacman.gridX = 19;
    this.pacman.gridY = 21;
    this.pacman.x = 19 * this.cellSize;
    this.pacman.y = 21 * this.cellSize;
    this.pacman.direction = 'right';
    this.pacman.nextDirection = null;
    
    // FIXED: Reset ghosts with proper positions
    this.ghosts.forEach((ghost, index) => {
      if (index === 0) {
        // Blinky starts outside
        ghost.gridX = 19;
        ghost.gridY = 9;
        ghost.isInBox = false;
        ghost.releaseTimer = 0;
        ghost.mode = this.currentGlobalMode;
      } else {
        // Others start in box with staggered release
        ghost.gridX = index === 2 ? 18 : (index === 3 ? 20 : 19);
        ghost.gridY = 11;
        ghost.isInBox = true;
        ghost.releaseTimer = index * 180; // 3, 6, 9 seconds
        ghost.mode = 'leaving_house';
      }
      
      ghost.x = ghost.gridX * this.cellSize;
      ghost.y = ghost.gridY * this.cellSize;
      ghost.isVulnerable = false;
      ghost.isBlinking = false;
      ghost.modeTimer = 0;
    });
    
    // Reset timers
    this.vulnerabilityTimer = 0;
    this.globalModeTimer = 0;
    this.currentGlobalMode = 'scatter';
    
    console.log("🔄 FIXED: Positions reset, ghosts properly re-initialized");
  }
  
  private nextLevel() {
    this.level++;
    console.log("🎉 Level complete! Moving to level", this.level);
    
    // Add level complete bonus
    this.score += 1000;
    this.onScoreUpdate(this.score);
    
    // Keep current state and re-initialize
    const currentScore = this.score;
    const currentLevel = this.level;
    const currentLives = this.lives;
    
    this.initializeMissPoopeeMan();
    this.score = currentScore;
    this.level = currentLevel;
    this.lives = currentLives;
  }
  
  // Override getCurrentShields for Miss POOPEE-Man to return lives
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
        // Miss POOPEE-Man render
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
