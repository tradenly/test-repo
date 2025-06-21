import { GamePhysics, HippoState } from './engine/GamePhysics';
import { GameRenderer } from './engine/GameRenderer';
import { CollisionDetector, Pipe, Missile } from './engine/CollisionDetector';
import { GameObjectManager } from './engine/GameObjectManager';
import type { GameSpeed } from './useGameState';

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private physics: GamePhysics;
  private renderer: GameRenderer;
  private collisionDetector: CollisionDetector;
  private objectManager: GameObjectManager;

  private hippo: HippoState;
  private pipes: Pipe[] = [];
  private missiles: Missile[] = [];
  
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
    onScoreUpdate: (score: number) => void
  ) {
    this.ctx = context;
    this.canvas = canvasElement;
    this.onGameEnd = onGameEnd;
    this.onScoreUpdate = onScoreUpdate;
    
    // Initialize modules
    this.physics = new GamePhysics();
    this.renderer = new GameRenderer(context, canvasElement);
    this.collisionDetector = new CollisionDetector();
    this.objectManager = new GameObjectManager(canvasElement);
    
    this.reset();
    this.bindEvents();
    this.render();
    console.log("🎮 Game engine initialized successfully");
  }

  private getSpeedMultiplier(): number {
    switch (this.gameSpeed) {
      case 'beginner': return 0.5; // 2px per frame
      case 'moderate': return 1.0; // 4px per frame (current)
      case 'advanced': return 1.5; // 6px per frame
      default: return 1.0;
    }
  }

  setGameSpeed(speed: GameSpeed) {
    console.log("🏃 Game engine: Speed changed to", speed);
    this.gameSpeed = speed;
  }

  bindEvents() {
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
  }

  flap() {
    if (this.gameRunning) {
      this.hippo = this.physics.flap(this.hippo);
    }
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
    console.log("🛡️ Game engine: Updating shields to", newShields);
    this.pipeHitsRemaining = newShields;
    this.maxShields = newShields;
    console.log("🛡️ Game engine: Updated - pipeHitsRemaining:", this.pipeHitsRemaining, "maxShields:", this.maxShields);
  }

  reset(startingShields = 3) {
    console.log("🔄 Game engine reset with shields:", startingShields);
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
    this.gameRunning = false;
    this.score = 0;
    this.pipesPassedCount = 0;
    this.pipeHitsRemaining = startingShields;
    this.maxShields = startingShields;
    this.invincibilityTime = 0;
    this.hitEffectTime = 0;
    this.gameStartTime = 0;
    this.lastMissileTime = 0;
    this.missileWarningTime = 0;
    this.pipes.push(this.objectManager.createPipe());
    if (!this.gameRunning) {
      this.render();
    }
  }

  start() {
    console.log("🎯 Game engine starting with shields:", this.pipeHitsRemaining, "/", this.maxShields, "and speed:", this.gameSpeed);
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

    this.renderer.updateParallax();

    // Update timers
    if (this.invincibilityTime > 0) this.invincibilityTime--;
    if (this.hitEffectTime > 0) this.hitEffectTime--;
    if (this.missileWarningTime > 0) this.missileWarningTime--;

    // Missile system - changed to 15 seconds
    this.handleMissileSystem(gameTimeElapsed);

    // Update hippo physics
    this.hippo = this.physics.updateHippo(this.hippo, this.canvas.height);
    this.hippo = this.physics.handleCeilingBounce(this.hippo);

    // Update game objects
    this.updateGameObjects();
    this.checkCollisions();
  }

  private handleMissileSystem(gameTimeElapsed: number) {
    // Spawn missiles every 15 seconds (changed from 45)
    if (gameTimeElapsed >= 15000 && this.lastMissileTime === 0) {
      this.missiles.push(this.objectManager.createMissile());
      this.lastMissileTime = gameTimeElapsed;
      console.log("🚀 First missile spawned at 15 seconds");
    } else if (this.lastMissileTime > 0 && gameTimeElapsed - this.lastMissileTime >= 15000) {
      this.missiles.push(this.objectManager.createMissile());
      this.lastMissileTime = gameTimeElapsed;
      console.log("🚀 Missile spawned at", gameTimeElapsed / 1000, "seconds");
    }

    // Missile warning - 2 seconds before missile (proportional to new timing)
    const timeSinceLastMissile = gameTimeElapsed - this.lastMissileTime;
    const timeToNextMissile = 15000 - timeSinceLastMissile;
    if (timeToNextMissile <= 2000 && timeToNextMissile > 0 && this.missileWarningTime <= 0) {
      this.missileWarningTime = 120; // 2 seconds at 60fps
      console.log("⚠️ Missile warning activated");
    }
  }

  private updateGameObjects() {
    const speedMultiplier = this.getSpeedMultiplier();
    
    // Update pipes with speed-adjusted movement
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

  getCurrentShields() {
    return this.pipeHitsRemaining;
  }

  render() {
    try {
      this.renderer.renderBackground(this.missileWarningTime, this.hitEffectTime);
      this.renderer.renderClouds();
      this.pipes.forEach(pipe => this.renderer.renderPipe(pipe));
      this.missiles.forEach(missile => this.renderer.renderMissile(missile));
      this.renderer.renderGround();
      this.renderer.renderHippo(this.hippo, this.invincibilityTime);
      this.renderer.renderScore(this.score);
      this.renderer.renderShieldCounter(this.pipeHitsRemaining, this.maxShields);
      this.renderer.restoreContext(this.hitEffectTime);
    } catch (error) {
      console.error("❌ Error in render:", error);
    }
  }
}
