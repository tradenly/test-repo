
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
  private readonly ALIEN_FIRE_COOLDOWN = 1000;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameState = this.initializeGame();
    this.setupEventListeners();
  }

  private initializeGame(): GameState {
    const player: Player = {
      x: this.canvas.width / 2 - 20,
      y: this.canvas.height - 50,
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
      alienSpeed: 0.5,
      lastAlienFireTime: 0
    };
  }

  private createAlienFormation(): Alien[] {
    const aliens: Alien[] = [];
    const rows = 5;
    const cols = 10;
    const alienWidth = 30;
    const alienHeight = 20;
    const spacing = 40;
    const startX = (this.canvas.width - (cols * spacing)) / 2;
    const startY = 50;

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

    return aliens;
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

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
    const speed = 300;

    if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) {
      player.x = Math.max(0, player.x - speed * deltaTime / 1000);
    }
    if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) {
      player.x = Math.min(this.canvas.width - player.width, player.x + speed * deltaTime / 1000);
    }
    if ((this.keys.has('Space') || this.keys.has('KeyW')) && Date.now() - this.lastPlayerFireTime > this.PLAYER_FIRE_COOLDOWN) {
      this.firePlayerBullet();
      this.lastPlayerFireTime = Date.now();
    }
  }

  private updateAliens(deltaTime: number): void {
    const { aliens, alienDirection, alienSpeed } = this.gameState;
    const speed = alienSpeed * 60;
    let shouldDropDown = false;

    // Move aliens horizontally
    for (const alien of aliens.filter(a => a.isAlive)) {
      alien.x += alienDirection * speed * deltaTime / 1000;
      
      // Check if any alien hits the edge
      if (alien.x <= 0 || alien.x >= this.canvas.width - alien.width) {
        shouldDropDown = true;
      }
    }

    // Drop down and reverse direction if needed
    if (shouldDropDown) {
      this.gameState.alienDirection *= -1;
      for (const alien of aliens.filter(a => a.isAlive)) {
        alien.y += 20;
      }
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
          break;
        }
      }
    }

    // Alien bullets vs player
    for (const bullet of bullets.filter(b => !b.isPlayerBullet)) {
      if (this.checkCollision(bullet, player)) {
        bullet.width = 0; // Mark bullet for removal
        player.lives--;
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
      return;
    }

    const aliveAliens = aliens.filter(a => a.isAlive);
    if (aliveAliens.length === 0) {
      this.gameState.gameStatus = 'victory';
      return;
    }

    // Check if aliens reached the bottom
    for (const alien of aliveAliens) {
      if (alien.y + alien.height >= player.y) {
        this.gameState.gameStatus = 'gameOver';
        return;
      }
    }
  }

  public render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#000011';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderPlayer();
    this.renderAliens();
    this.renderBullets();
    this.renderUI();
  }

  private renderPlayer(): void {
    const { player } = this.gameState;
    if (!player.isAlive) return;

    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Player gun
    this.ctx.fillStyle = '#ffff00';
    this.ctx.fillRect(player.x + player.width / 2 - 3, player.y - 5, 6, 8);
  }

  private renderAliens(): void {
    for (const alien of this.gameState.aliens.filter(a => a.isAlive)) {
      const colors = { basic: '#ff0000', medium: '#ff8800', boss: '#ff00ff' };
      this.ctx.fillStyle = colors[alien.type];
      this.ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
    }
  }

  private renderBullets(): void {
    for (const bullet of this.gameState.bullets) {
      this.ctx.fillStyle = bullet.isPlayerBullet ? '#ffff00' : '#ff0000';
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
  }

  private renderUI(): void {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Score: ${this.gameState.score}`, 10, 25);
    this.ctx.fillText(`Lives: ${this.gameState.player.lives}`, 10, 45);
    this.ctx.fillText(`Wave: ${this.gameState.wave}`, 10, 65);
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public resetGame(): void {
    this.gameState = this.initializeGame();
  }

  public pauseGame(): void {
    this.gameState.gameStatus = 'paused';
  }

  public resumeGame(): void {
    this.gameState.gameStatus = 'playing';
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.setupEventListeners);
    window.removeEventListener('keyup', this.setupEventListeners);
  }
}
