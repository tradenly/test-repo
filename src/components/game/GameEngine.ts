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
  
  // SIMPLIFIED: Faster movement timing
  private moveTimer = 0;
  private framesBetweenMoves = 4; // Pac-Man movement
  private ghostMoveTimer = 0;
  private framesBetweenGhostMoves = 3; // FASTER: Ghosts move every 3 frames (faster than Pac-Man)
  
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
    console.log("🎮 FIXED: Initializing Miss POOPEE-Man with proper ghost positioning");
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
    
    // FIXED: Position ghosts in OPEN areas with guaranteed movement options
    const ghostStartPositions = [
      { x: 1, y: 1, direction: 'right' as const, color: '#FF0000' },   // Red - top-left corner
      { x: 38, y: 1, direction: 'left' as const, color: '#FFB6C1' },  // Pink - top-right corner  
      { x: 1, y: 21, direction: 'right' as const, color: '#00FFFF' }, // Cyan - bottom-left corner
      { x: 38, y: 21, direction: 'left' as const, color: '#FFA500' }  // Orange - bottom-right corner
    ];
    
    this.ghosts = ghostStartPositions.map((pos, index) => ({
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
      isBlinking: false
    }));
    
    console.log("👻 FIXED: All 4 ghosts starting in open corners:");
    this.ghosts.forEach((ghost, i) => {
      console.log(`Ghost ${i}: pos(${ghost.gridX}, ${ghost.gridY}) direction: ${ghost.direction} - maze value: ${this.maze[ghost.gridY][ghost.gridX]}`);
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
    
    // FIXED: Faster movement - every 2 frames instead of 3
    if (this.ghostMoveTimer >= 2) {
      this.ghostMoveTimer = 0;
      
      this.ghosts.forEach((ghost, index) => {
        console.log(`👻 Moving Ghost ${index}: pos(${ghost.gridX}, ${ghost.gridY}) direction: ${ghost.direction}`);
        
        let newGridX = ghost.gridX;
        let newGridY = ghost.gridY;
        
        switch (ghost.direction) {
          case 'right': newGridX++; break;
          case 'left': newGridX--; break;
          case 'down': newGridY++; break;
          case 'up': newGridY--; break;
        }
        
        // Handle wrapping at maze edges
        if (newGridX < 0) newGridX = this.maze[0].length - 1;
        if (newGridX >= this.maze[0].length) newGridX = 0;
        
        if (this.isValidMove(newGridX, newGridY)) {
          ghost.gridX = newGridX;
          ghost.gridY = newGridY;
          ghost.x = newGridX * this.cellSize;
          ghost.y = newGridY * this.cellSize;
          console.log(`👻 Ghost ${index} moved to (${ghost.gridX}, ${ghost.gridY})`);
        } else {
          // FIXED: Smarter direction finding - try all directions systematically
          const directions: ('right' | 'down' | 'left' | 'up')[] = ['right', 'down', 'left', 'up'];
          let foundDirection = false;
          
          // Try each direction in order
          for (const direction of directions) {
            // Skip opposite direction to avoid immediate reversals
            if ((ghost.direction === 'right' && direction === 'left') ||
                (ghost.direction === 'left' && direction === 'right') ||
                (ghost.direction === 'up' && direction === 'down') ||
                (ghost.direction === 'down' && direction === 'up')) {
              continue;
            }
            
            let testX = ghost.gridX;
            let testY = ghost.gridY;
            
            switch (direction) {
              case 'right': testX++; break;
              case 'left': testX--; break;
              case 'down': testY++; break;
              case 'up': testY--; break;
            }
            
            // Handle wrapping
            if (testX < 0) testX = this.maze[0].length - 1;
            if (testX >= this.maze[0].length) testX = 0;
            
            if (this.isValidMove(testX, testY)) {
              ghost.direction = direction;
              foundDirection = true;
              console.log(`👻 Ghost ${index} changed direction to: ${direction}`);
              break;
            }
          }
          
          // If no direction found, try opposite direction as last resort
          if (!foundDirection) {
            const oppositeDirections = {
              'right': 'left' as const,
              'left': 'right' as const,
              'up': 'down' as const,
              'down': 'up' as const
            };
            
            const oppositeDir = oppositeDirections[ghost.direction];
            let testX = ghost.gridX;
            let testY = ghost.gridY;
            
            switch (oppositeDir) {
              case 'right': testX++; break;
              case 'left': testX--; break;
              case 'down': testY++; break;
              case 'up': testY--; break;
            }
            
            if (testX < 0) testX = this.maze[0].length - 1;
            if (testX >= this.maze[0].length) testX = 0;
            
            if (this.isValidMove(testX, testY)) {
              ghost.direction = oppositeDir;
              console.log(`👻 Ghost ${index} forced to reverse direction to: ${oppositeDir}`);
            } else {
              console.log(`❌ Ghost ${index} completely stuck at (${ghost.gridX}, ${ghost.gridY})`);
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
            
            ghost.gridX = 19;
            ghost.gridY = 11;
            ghost.x = 19 * this.cellSize;
            ghost.y = 11 * this.cellSize;
            ghost.isVulnerable = false;
            ghost.isBlinking = false;
            const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
            ghost.direction = directions[Math.floor(Math.random() * directions.length)];
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
    
    // FIXED: Reset ghosts to corner positions, not center
    const ghostStartPositions = [
      { x: 1, y: 1, direction: 'right' as const },   // Red - top-left
      { x: 38, y: 1, direction: 'left' as const },  // Pink - top-right
      { x: 1, y: 21, direction: 'right' as const }, // Cyan - bottom-left
      { x: 38, y: 21, direction: 'left' as const }  // Orange - bottom-right
    ];
    
    this.ghosts.forEach((ghost, index) => {
      const pos = ghostStartPositions[index];
      ghost.gridX = pos.x;
      ghost.gridY = pos.y;
      ghost.x = pos.x * this.cellSize;
      ghost.y = pos.y * this.cellSize;
      ghost.direction = pos.direction;
      ghost.isVulnerable = false;
      ghost.isBlinking = false;
    });
    
    this.vulnerabilityTimer = 0;
    
    console.log("🔄 FIXED: Positions reset with ghosts in open corners");
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
