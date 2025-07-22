export type SpeedLevel = 'novice' | 'intermediate' | 'advanced';

const SPEED_SETTINGS = {
  novice: { alienMoveInterval: 800, alienShootInterval: 1500, alienMoveSpeed: 15 },
  intermediate: { alienMoveInterval: 500, alienShootInterval: 1000, alienMoveSpeed: 20 },
  advanced: { alienMoveInterval: 300, alienShootInterval: 700, alienMoveSpeed: 25 }
};

export interface GameState {
  player: {
    x: number;
    y: number;
    width: number;
    height: number;
    isAlive: boolean;
    lives: number;
  };
  aliens: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    isAlive: boolean;
    type: number;
  }>;
  playerBullets: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
  }>;
  alienBullets: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
  }>;
  score: number;
  wave: number;
  gameStatus: 'playing' | 'paused' | 'gameOver' | 'victory';
  alienDirection: number;
  alienMoveTimer: number;
  alienShootTimer: number;
  currentSpeed: SpeedLevel;
}

export class SpaceInvadersEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private keys: { [key: string]: boolean } = {};
  private lastTime = 0;
  private isRunning = false;
  private animationFrame?: number;
  private speedSettings = SPEED_SETTINGS.intermediate;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;
    
    // Initialize game state
    this.gameState = this.createInitialState();
    
    // Set up event listeners
    this.setupEventListeners();
    
    console.log('🛸 Space Invaders Engine initialized successfully');
  }

  private createInitialState(): GameState {
    const aliens = [];
    const rows = 5;
    const cols = 13; // Increased from 10 to 13 columns
    const alienWidth = 32; // Slightly increased width
    const alienHeight = 24; // Slightly increased height
    const spacing = 10;
    const startX = 50;
    const startY = 50;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        aliens.push({
          x: startX + col * (alienWidth + spacing),
          y: startY + row * (alienHeight + spacing),
          width: alienWidth,
          height: alienHeight,
          isAlive: true,
          type: row < 2 ? 0 : row < 4 ? 1 : 2
        });
      }
    }

    return {
      player: {
        x: this.canvas.width / 2 - 20,
        y: this.canvas.height - 60,
        width: 40,
        height: 30,
        isAlive: true,
        lives: 3
      },
      aliens,
      playerBullets: [],
      alienBullets: [],
      score: 0,
      wave: 1,
      gameStatus: 'playing',
      alienDirection: 1,
      alienMoveTimer: 0,
      alienShootTimer: 0,
      currentSpeed: 'intermediate'
    };
  }

  setupEventListeners(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = true;
      
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        this.shoot();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  }

  // Public interface methods expected by SpaceInvadersGameArea
  startGame(): void {
    this.start();
  }

  pauseGame(): void {
    this.pause();
  }

  resumeGame(): void {
    this.resume();
  }

  resetGame(): void {
    this.reset();
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }

  destroy(): void {
    this.stop();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  start(speed: SpeedLevel = 'intermediate'): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.gameState.gameStatus = 'playing';
    this.gameState.currentSpeed = speed;
    this.speedSettings = SPEED_SETTINGS[speed];
    this.lastTime = performance.now();
    
    console.log('🚀 Starting Space Invaders game with speed:', speed);
    this.gameLoop();
  }

  pause(): void {
    this.gameState.gameStatus = 'paused';
    console.log('⏸️ Game paused');
  }

  resume(): void {
    this.gameState.gameStatus = 'playing';
    this.lastTime = performance.now();
    console.log('▶️ Game resumed');
  }

  stop(): void {
    this.isRunning = false;
    this.gameState.gameStatus = 'gameOver';
    console.log('🛑 Game stopped');
  }

  reset(): void {
    this.gameState = this.createInitialState();
    console.log('🔄 Game reset');
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (this.gameState.gameStatus === 'playing') {
      this.update(deltaTime);
    }
    
    this.render();
    this.animationFrame = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    this.updatePlayer(deltaTime);
    this.updateBullets(deltaTime);
    this.updateAliens(deltaTime);
    this.checkCollisions();
    this.checkGameEnd();
  }

  private updatePlayer(deltaTime: number): void {
    const { player } = this.gameState;
    if (!player.isAlive) return;

    const speed = 300;
    const moveDistance = speed * (deltaTime / 1000);

    if (this.keys['arrowleft'] || this.keys['a']) {
      player.x = Math.max(0, player.x - moveDistance);
    }
    if (this.keys['arrowright'] || this.keys['d']) {
      player.x = Math.min(this.canvas.width - player.width, player.x + moveDistance);
    }
  }

  private updateBullets(deltaTime: number): void {
    const speed = 400;
    const moveDistance = speed * (deltaTime / 1000);

    this.gameState.playerBullets = this.gameState.playerBullets.filter(bullet => {
      bullet.y -= moveDistance;
      return bullet.y > -bullet.height;
    });

    this.gameState.alienBullets = this.gameState.alienBullets.filter(bullet => {
      bullet.y += moveDistance;
      return bullet.y < this.canvas.height;
    });
  }

  private updateAliens(deltaTime: number): void {
    this.gameState.alienMoveTimer += deltaTime;
    this.gameState.alienShootTimer += deltaTime;

    if (this.gameState.alienMoveTimer > this.speedSettings.alienMoveInterval) {
      this.moveAliens();
      this.gameState.alienMoveTimer = 0;
    }

    if (this.gameState.alienShootTimer > this.speedSettings.alienShootInterval) {
      this.alienShoot();
      this.gameState.alienShootTimer = 0;
    }
  }

  private moveAliens(): void {
    const { aliens, alienDirection } = this.gameState;
    const speed = this.speedSettings.alienMoveSpeed;
    let shouldMoveDown = false;

    for (const alien of aliens) {
      if (!alien.isAlive) continue;
      
      if ((alienDirection > 0 && alien.x + alien.width + speed > this.canvas.width) ||
          (alienDirection < 0 && alien.x - speed < 0)) {
        shouldMoveDown = true;
        break;
      }
    }

    if (shouldMoveDown) {
      for (const alien of aliens) {
        if (alien.isAlive) {
          alien.y += 20;
        }
      }
      this.gameState.alienDirection *= -1;
    } else {
      for (const alien of aliens) {
        if (alien.isAlive) {
          alien.x += speed * alienDirection;
        }
      }
    }
  }

  private alienShoot(): void {
    const aliveAliens = this.gameState.aliens.filter(alien => alien.isAlive);
    if (aliveAliens.length === 0) return;

    const shootingAlien = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
    
    this.gameState.alienBullets.push({
      x: shootingAlien.x + shootingAlien.width / 2,
      y: shootingAlien.y + shootingAlien.height,
      width: 3,
      height: 8,
      speed: 200
    });
  }

  private shoot(): void {
    const { player, playerBullets } = this.gameState;
    if (!player.isAlive || playerBullets.length >= 3) return;

    playerBullets.push({
      x: player.x + player.width / 2,
      y: player.y,
      width: 3,
      height: 8,
      speed: 400
    });
  }

  private checkCollisions(): void {
    this.checkPlayerBulletCollisions();
    this.checkAlienBulletCollisions();
  }

  private checkPlayerBulletCollisions(): void {
    const { playerBullets, aliens } = this.gameState;

    for (let i = playerBullets.length - 1; i >= 0; i--) {
      const bullet = playerBullets[i];
      
      for (const alien of aliens) {
        if (!alien.isAlive) continue;
        
        if (this.isColliding(bullet, alien)) {
          alien.isAlive = false;
          playerBullets.splice(i, 1);
          this.gameState.score += (alien.type + 1) * 10;
          break;
        }
      }
    }
  }

  private checkAlienBulletCollisions(): void {
    const { alienBullets, player } = this.gameState;

    for (let i = alienBullets.length - 1; i >= 0; i--) {
      const bullet = alienBullets[i];
      
      if (this.isColliding(bullet, player)) {
        alienBullets.splice(i, 1);
        player.lives--;
        if (player.lives <= 0) {
          player.isAlive = false;
        }
        break;
      }
    }
  }

  private isColliding(obj1: any, obj2: any): boolean {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  }

  private checkGameEnd(): void {
    const { player, aliens } = this.gameState;
    
    if (!player.isAlive) {
      this.gameState.gameStatus = 'gameOver';
      return;
    }

    const aliveAliens = aliens.filter(alien => alien.isAlive);
    if (aliveAliens.length === 0) {
      this.gameState.wave++;
      this.gameState.aliens = this.createInitialState().aliens;
    }

    for (const alien of aliveAliens) {
      if (alien.y + alien.height >= player.y) {
        this.gameState.gameStatus = 'gameOver';
        player.isAlive = false;
        break;
      }
    }
  }

  private render(): void {
    this.ctx.fillStyle = '#000011';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.gameState.gameStatus !== 'gameOver') {
      this.renderPlayer();
      this.renderAliens();
      this.renderBullets();
    }

    this.renderUI();
  }

  private renderPlayer(): void {
    const { player } = this.gameState;
    if (!player.isAlive) return;

    // Draw white outlined rocket ship
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.fillStyle = 'transparent';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    
    const centerX = player.x + player.width / 2;
    const topY = player.y;
    const bottomY = player.y + player.height;
    
    // Draw rocket ship outline
    this.ctx.moveTo(centerX, topY); // Top point
    this.ctx.lineTo(centerX - 15, bottomY); // Bottom left
    this.ctx.lineTo(centerX - 5, bottomY - 8); // Inner left
    this.ctx.lineTo(centerX + 5, bottomY - 8); // Inner right  
    this.ctx.lineTo(centerX + 15, bottomY); // Bottom right
    this.ctx.closePath();
    
    this.ctx.stroke();
  }

  private renderAliens(): void {
    const { aliens } = this.gameState;
    const alienEmojis = ['👻', '💩', '👾'];

    this.ctx.font = '24px Arial'; // Increased from 20px to 24px
    this.ctx.textAlign = 'center';

    for (const alien of aliens) {
      if (!alien.isAlive) continue;
      
      this.ctx.fillText(
        alienEmojis[alien.type],
        alien.x + alien.width / 2,
        alien.y + alien.height
      );
    }
  }

  private renderBullets(): void {
    const { playerBullets, alienBullets } = this.gameState;

    this.ctx.fillStyle = '#00ff00';
    for (const bullet of playerBullets) {
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    this.ctx.fillStyle = '#ff0000';
    for (const bullet of alienBullets) {
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
  }

  private renderUI(): void {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    
    this.ctx.fillText(`Score: ${this.gameState.score}`, 10, 25);
    this.ctx.fillText(`Lives: ${this.gameState.player.lives}`, 10, 45);
    this.ctx.fillText(`Wave: ${this.gameState.wave}`, 10, 65);

    if (this.gameState.gameStatus === 'paused') {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '30px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }

    if (this.gameState.gameStatus === 'gameOver') {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '30px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
      this.ctx.fillText(`Final Score: ${this.gameState.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
  }
}
