export interface Position {
  x: number;
  y: number;
}

export interface Alien {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isAlive: boolean;
  type: 'basic' | 'medium' | 'boss';
  points: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  isPlayerBullet: boolean;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  lives: number;
  isAlive: boolean;
}

export interface GameState {
  player: Player;
  aliens: Alien[];
  bullets: Bullet[];
  score: number;
  wave: number;
  gameStatus: 'playing' | 'gameOver' | 'victory' | 'paused';
  alienDirection: number;
  alienSpeed: number;
  lastAlienFireTime: number;
}

export class SpaceInvadersEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private keys: Set<string> = new Set();
  private lastPlayerFireTime = 0;
  private readonly PLAYER_FIRE_COOLDOWN = 200;
  private readonly ALIEN_FIRE_COOLDOWN = 1500;
  private keyDownHandler: (e: KeyboardEvent) => void;
  private keyUpHandler: (e: KeyboardEvent) => void;
  private isRunning = false;
  private animationId: number | null = null;
  private lastTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = context;
    
    // Ensure canvas has proper dimensions - reduced height to eliminate scrolling
    this.canvas.width = 800;
    this.canvas.height = 500; // Reduced from 600 to 500
    
    this.gameState = this.initializeGame();
    this.setupEventListeners();
    
    // Initial render to show the game immediately
    this.render();
    
    console.log("🛸 Space Invaders Engine initialized successfully");
  }

  private initializeGame(): GameState {
    const player: Player = {
      x: this.canvas.width / 2 - 20,
      y: this.canvas.height - 60,
      width: 40,
      height: 30,
      lives: 3,
      isAlive: true
    };

    const aliens = this.createAlienFormation();

    return {
      player,
      aliens,
      bullets: [],
      score: 0,
      wave: 1,
      gameStatus: 'playing',
      alienDirection: 1,
      alienSpeed: 1,
      lastAlienFireTime: 0
    };
  }

  private createAlienFormation(): Alien[] {
    const aliens: Alien[] = [];
    const rows = 5;
    const cols = 10;
    const alienWidth = 35;
    const alienHeight = 25;
    const spacing = 45;
    const startX = (this.canvas.width - (cols * spacing)) / 2;
    const startY = 60; // Adjusted for smaller canvas

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const type = row === 0 ? 'boss' : row <= 2 ? 'medium' : 'basic';
        const points = type === 'boss' ? 30 : type === 'medium' ? 20 : 10;
        
        aliens.push({
          id: `alien-${row}-${col}`,
          x: startX + col * spacing,
          y: startY + row * spacing,
          width: alienWidth,
          height: alienHeight,
          isAlive: true,
          type,
          points
        });
      }
    }

    console.log(`👾 Created ${aliens.length} aliens in formation`);
    return aliens;
  }

  private setupEventListeners(): void {
    this.keyDownHandler = (e: KeyboardEvent) => {
      this.keys.add(e.code);
      this.keys.add(e.key);
      console.log("🎮 Key pressed:", e.code, e.key);
      e.preventDefault();
    };

    this.keyUpHandler = (e: KeyboardEvent) => {
      this.keys.delete(e.code);
      this.keys.delete(e.key);
      e.preventDefault();
    };

    // Use document for global key events
    document.addEventListener('keydown', this.keyDownHandler);
    document.addEventListener('keyup', this.keyUpHandler);
    
    console.log("🎮 Event listeners attached to document");
  }

  public startGame(): void {
    console.log("🚀 Starting Space Invaders game...");
    this.isRunning = true;
    this.gameState.gameStatus = 'playing';
    this.lastTime = performance.now();
    this.gameLoop();
  }

  private gameLoop = (): void => {
    if (!this.isRunning || this.gameState.gameStatus !== 'playing') {
      console.log("⏸️ Game loop stopped - isRunning:", this.isRunning, "status:", this.gameState.gameStatus);
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    try {
      this.update(deltaTime);
      this.render();
      this.animationId = requestAnimationFrame(this.gameLoop);
    } catch (error) {
      console.error("❌ Game loop error:", error);
      this.isRunning = false;
    }
  };

  public update(deltaTime: number): void {
    if (this.gameState.gameStatus !== 'playing') return;

    this.updatePlayer(deltaTime);
    this.updateAliens(deltaTime);
    this.updateBullets(deltaTime);
    this.handleCollisions();
    this.checkGameState();
  }

  private updatePlayer(deltaTime: number): void {
    const player = this.gameState.player;
    const speed = 300; // pixels per second

    // Handle movement
    if (this.keys.has('ArrowLeft') || this.keys.has('KeyA') || this.keys.has('a')) {
      player.x = Math.max(0, player.x - speed * deltaTime / 1000);
    }
    if (this.keys.has('ArrowRight') || this.keys.has('KeyD') || this.keys.has('d')) {
      player.x = Math.min(this.canvas.width - player.width, player.x + speed * deltaTime / 1000);
    }
    
    // Handle shooting
    if ((this.keys.has('Space') || this.keys.has('KeyW') || this.keys.has('w') || this.keys.has(' ')) && 
        Date.now() - this.lastPlayerFireTime > this.PLAYER_FIRE_COOLDOWN) {
      this.firePlayerBullet();
      this.lastPlayerFireTime = Date.now();
    }
  }

  private updateAliens(deltaTime: number): void {
    const { aliens, alienDirection, alienSpeed } = this.gameState;
    const speed = alienSpeed * 50; // pixels per second
    let shouldDropDown = false;

    // Move aliens horizontally
    const aliveAliens = aliens.filter(a => a.isAlive);
    
    if (aliveAliens.length === 0) return;

    for (const alien of aliveAliens) {
      alien.x += alienDirection * speed * deltaTime / 1000;
      
      // Check if any alien hits the edge
      if (alien.x <= 0 || alien.x >= this.canvas.width - alien.width) {
        shouldDropDown = true;
      }
    }

    // Drop down and reverse direction if needed
    if (shouldDropDown) {
      this.gameState.alienDirection *= -1;
      for (const alien of aliveAliens) {
        alien.y += 25;
      }
      console.log("👾 Aliens dropped down and changed direction");
    }

    // Random alien firing
    if (Date.now() - this.gameState.lastAlienFireTime > this.ALIEN_FIRE_COOLDOWN) {
      this.fireAlienBullet();
      this.gameState.lastAlienFireTime = Date.now();
    }
  }

  private updateBullets(deltaTime: number): void {
    for (const bullet of this.gameState.bullets) {
      bullet.y += bullet.speed * deltaTime / 1000;
    }

    // Remove bullets that are off-screen
    this.gameState.bullets = this.gameState.bullets.filter(
      bullet => bullet.y > -bullet.height && bullet.y < this.canvas.height + bullet.height
    );
  }

  private firePlayerBullet(): void {
    const player = this.gameState.player;
    this.gameState.bullets.push({
      id: `bullet-${Date.now()}`,
      x: player.x + player.width / 2 - 2,
      y: player.y,
      width: 4,
      height: 10,
      speed: -400,
      isPlayerBullet: true
    });
    console.log("🔫 Player fired bullet");
  }

  private fireAlienBullet(): void {
    const aliveAliens = this.gameState.aliens.filter(a => a.isAlive);
    if (aliveAliens.length === 0) return;

    const randomAlien = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
    this.gameState.bullets.push({
      id: `alien-bullet-${Date.now()}`,
      x: randomAlien.x + randomAlien.width / 2 - 2,
      y: randomAlien.y + randomAlien.height,
      width: 4,
      height: 10,
      speed: 200,
      isPlayerBullet: false
    });
    console.log("👾 Alien fired bullet");
  }

  private handleCollisions(): void {
    const { player, aliens, bullets } = this.gameState;

    // Player bullets vs aliens
    for (const bullet of bullets.filter(b => b.isPlayerBullet)) {
      for (const alien of aliens.filter(a => a.isAlive)) {
        if (this.checkCollision(bullet, alien)) {
          alien.isAlive = false;
          bullet.width = 0; // Mark bullet for removal
          this.gameState.score += alien.points;
          console.log(`💥 Alien destroyed! Score: ${this.gameState.score}`);
          break;
        }
      }
    }

    // Alien bullets vs player
    for (const bullet of bullets.filter(b => !b.isPlayerBullet)) {
      if (this.checkCollision(bullet, player)) {
        bullet.width = 0; // Mark bullet for removal
        player.lives--;
        console.log(`💔 Player hit! Lives remaining: ${player.lives}`);
        if (player.lives <= 0) {
          player.isAlive = false;
        }
        break;
      }
    }

    // Remove destroyed bullets
    this.gameState.bullets = this.gameState.bullets.filter(b => b.width > 0);
  }

  private checkCollision(rect1: { x: number; y: number; width: number; height: number }, 
                        rect2: { x: number; y: number; width: number; height: number }): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  private checkGameState(): void {
    const { player, aliens } = this.gameState;

    if (!player.isAlive) {
      this.gameState.gameStatus = 'gameOver';
      this.isRunning = false;
      console.log("💀 Game Over - Player defeated");
      return;
    }

    const aliveAliens = aliens.filter(a => a.isAlive);
    if (aliveAliens.length === 0) {
      this.gameState.gameStatus = 'victory';
      this.isRunning = false;
      console.log("🎉 Victory - All aliens defeated!");
      return;
    }

    // Check if aliens reached the bottom
    for (const alien of aliveAliens) {
      if (alien.y + alien.height >= player.y) {
        this.gameState.gameStatus = 'gameOver';
        this.isRunning = false;
        console.log("💀 Game Over - Aliens reached Earth!");
        return;
      }
    }
  }

  public render(): void {
    // Clear canvas with dark space background
    this.ctx.fillStyle = '#000011';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Add stars background
    this.renderStars();

    this.renderPlayer();
    this.renderAliens();
    this.renderBullets();
    this.renderGameOverlay();
  }

  private renderStars(): void {
    // Simple star field background
    this.ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 37) % this.canvas.width;
      const y = (i * 73) % this.canvas.height;
      if (Math.random() > 0.7) { // Make stars twinkle
        this.ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  private renderPlayer(): void {
    const { player } = this.gameState;
    if (!player.isAlive) return;

    // Use a straight up rocket - save context for rotation
    this.ctx.save();
    this.ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    this.ctx.rotate(-Math.PI / 4); // Rotate to make rocket face straight up
    this.ctx.font = '30px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🚀', 0, 0);
    this.ctx.restore();
  }

  private renderAliens(): void {
    this.ctx.font = '25px Arial';
    this.ctx.textAlign = 'center';
    
    for (const alien of this.gameState.aliens.filter(a => a.isAlive)) {
      let emoji = '💩';
      
      // Different emojis for different types
      if (alien.type === 'boss') {
        emoji = '👾'; // Boss aliens get special treatment
      } else if (alien.type === 'medium') {
        emoji = '💩'; // Medium aliens stay as poop
      } else {
        emoji = '👻'; // Basic aliens are now ghosts instead of brown circles
      }
      
      this.ctx.fillText(emoji, alien.x + alien.width / 2, alien.y + alien.height);
    }
  }

  private renderBullets(): void {
    for (const bullet of this.gameState.bullets) {
      if (bullet.isPlayerBullet) {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      } else {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      }
    }
  }

  private renderGameOverlay(): void {
    // Show game over or victory message
    if (this.gameState.gameStatus === 'gameOver') {
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
      
      this.ctx.font = '24px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText('Press Reset to try again', this.canvas.width / 2, this.canvas.height / 2 + 40);
    } else if (this.gameState.gameStatus === 'victory') {
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#00ff00';
      this.ctx.fillText('VICTORY!', this.canvas.width / 2, this.canvas.height / 2);
      
      this.ctx.font = '24px Arial';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText('All aliens defeated!', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public resetGame(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.gameState = this.initializeGame();
    this.render();
    console.log("🔄 Game reset");
  }

  public pauseGame(): void {
    this.isRunning = false;
    this.gameState.gameStatus = 'paused';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    console.log("⏸️ Game paused");
  }

  public resumeGame(): void {
    if (this.gameState.gameStatus === 'paused') {
      this.gameState.gameStatus = 'playing';
      this.isRunning = true;
      this.lastTime = performance.now();
      this.gameLoop();
      console.log("▶️ Game resumed");
    }
  }

  public destroy(): void {
    console.log("🧹 Destroying Space Invaders engine...");
    this.isRunning = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    if (this.keyDownHandler) {
      document.removeEventListener('keydown', this.keyDownHandler);
    }
    if (this.keyUpHandler) {
      document.removeEventListener('keyup', this.keyUpHandler);
    }
  }
}
