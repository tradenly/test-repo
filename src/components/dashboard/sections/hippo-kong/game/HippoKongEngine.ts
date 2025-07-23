export interface HippoKongPlayer {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  onGround: boolean;
  onLadder: boolean;
  direction: 'left' | 'right' | 'up' | 'down';
}

export interface HippoKongBarrel {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  onLadder: boolean;
}

export interface HippoKongPlatform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HippoKongLadder {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class HippoKongEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isRunning = false;
  private animationId: number | null = null;
  private lastTime = 0;
  
  private player: HippoKongPlayer;
  private barrels: HippoKongBarrel[] = [];
  private platforms: HippoKongPlatform[] = [];
  private ladders: HippoKongLadder[] = [];
  
  private score = 0;
  private level = 1;
  private startTime = 0;
  private barrelSpawnTimer = 0;
  private barrelSpawnInterval = 3000; // 3 seconds
  
  private keys: { [key: string]: boolean } = {};
  
  // Callbacks
  private onGameEnd: (score: number, level: number, duration: number) => void;
  private onScoreUpdate: (score: number) => void;
  private onLevelUp: (level: number) => void;

  constructor(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    onGameEnd: (score: number, level: number, duration: number) => void,
    onScoreUpdate: (score: number) => void,
    onLevelUp: (level: number) => void
  ) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.onGameEnd = onGameEnd;
    this.onScoreUpdate = onScoreUpdate;
    this.onLevelUp = onLevelUp;

    this.setupLevel();
    this.bindEvents();
  }

  private setupLevel() {
    // Initialize player at bottom
    this.player = {
      x: 50,
      y: 520,
      width: 40,
      height: 40,
      velocityY: 0,
      onGround: true,
      onLadder: false,
      direction: 'right'
    };

    // Create platforms (bottom to top)
    this.platforms = [
      { x: 0, y: 560, width: 800, height: 40 },     // Bottom platform
      { x: 100, y: 450, width: 600, height: 20 },   // Level 1
      { x: 50, y: 340, width: 700, height: 20 },    // Level 2
      { x: 150, y: 230, width: 500, height: 20 },   // Level 3
      { x: 250, y: 120, width: 300, height: 20 },   // Top platform
    ];

    // Create ladders connecting platforms
    this.ladders = [
      { x: 200, y: 450, width: 30, height: 110 },   // Bottom to Level 1
      { x: 600, y: 340, width: 30, height: 110 },   // Level 1 to Level 2
      { x: 150, y: 230, width: 30, height: 110 },   // Level 2 to Level 3
      { x: 500, y: 120, width: 30, height: 110 },   // Level 3 to Top
    ];

    this.barrels = [];
    this.score = 0;
    this.level = 1;
    this.barrelSpawnTimer = 0;
  }

  private bindEvents() {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys and WASD to stop page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }
      this.keys[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Prevent default behavior for arrow keys and WASD
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }
      this.keys[e.key] = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startTime = Date.now();
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  pause() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.gameLoop(this.lastTime);
    }
  }

  reset() {
    this.pause();
    this.setupLevel();
  }

  cleanup() {
    this.pause();
    // Remove event listeners would be handled by component cleanup
  }

  private gameLoop(currentTime: number) {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  private update(deltaTime: number) {
    this.updatePlayer(deltaTime);
    this.updateBarrels(deltaTime);
    this.spawnBarrels(deltaTime);
    this.checkCollisions();
    this.updateScore();
    this.checkWinCondition();
  }

  private updatePlayer(deltaTime: number) {
    const speed = 200; // pixels per second
    const moveDistance = (speed * deltaTime) / 1000;

    // Handle horizontal movement
    if (this.keys['ArrowLeft'] || this.keys['a']) {
      this.player.x = Math.max(0, this.player.x - moveDistance);
      this.player.direction = 'left';
    }
    if (this.keys['ArrowRight'] || this.keys['d']) {
      this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + moveDistance);
      this.player.direction = 'right';
    }

    // Check if player is on a ladder
    this.player.onLadder = this.isOnLadder();

    // Handle vertical movement (ladders and jumping)
    if (this.player.onLadder) {
      // On ladder - can move up/down
      if (this.keys['ArrowUp'] || this.keys['w']) {
        this.player.y = Math.max(0, this.player.y - moveDistance);
        this.player.direction = 'up';
      }
      if (this.keys['ArrowDown'] || this.keys['s']) {
        this.player.y = Math.min(this.canvas.height - this.player.height, this.player.y + moveDistance);
        this.player.direction = 'down';
      }
      this.player.velocityY = 0; // No gravity on ladders
    } else {
      // Apply gravity
      this.player.velocityY += 800 * (deltaTime / 1000); // gravity
      this.player.y += this.player.velocityY * (deltaTime / 1000);
    }

    // Check platform collisions
    this.handlePlatformCollisions();
  }

  private isOnLadder(): boolean {
    return this.ladders.some(ladder => 
      this.player.x + this.player.width > ladder.x &&
      this.player.x < ladder.x + ladder.width &&
      this.player.y + this.player.height > ladder.y &&
      this.player.y < ladder.y + ladder.height
    );
  }

  private handlePlatformCollisions() {
    this.player.onGround = false;

    for (const platform of this.platforms) {
      if (this.player.x + this.player.width > platform.x &&
          this.player.x < platform.x + platform.width &&
          this.player.y + this.player.height > platform.y &&
          this.player.y < platform.y + platform.height) {
        
        // Landing on top of platform
        if (this.player.velocityY > 0) {
          this.player.y = platform.y - this.player.height;
          this.player.velocityY = 0;
          this.player.onGround = true;
        }
      }
    }

    // Prevent falling through bottom
    if (this.player.y + this.player.height > this.canvas.height) {
      this.player.y = this.canvas.height - this.player.height;
      this.player.velocityY = 0;
      this.player.onGround = true;
    }
  }

  private spawnBarrels(deltaTime: number) {
    this.barrelSpawnTimer += deltaTime;
    
    if (this.barrelSpawnTimer > this.barrelSpawnInterval) {
      this.barrelSpawnTimer = 0;
      
      // Spawn barrel from top platform
      this.barrels.push({
        x: 250 + Math.random() * 200, // Random position on top platform
        y: 80,
        width: 30,
        height: 30,
        velocityX: (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 100),
        velocityY: 0,
        onLadder: false
      });
    }
  }

  private updateBarrels(deltaTime: number) {
    for (let i = this.barrels.length - 1; i >= 0; i--) {
      const barrel = this.barrels[i];
      
      // Apply gravity
      barrel.velocityY += 600 * (deltaTime / 1000);
      
      // Update position
      barrel.x += barrel.velocityX * (deltaTime / 1000);
      barrel.y += barrel.velocityY * (deltaTime / 1000);
      
      // Check platform collisions for barrels
      let onPlatform = false;
      for (const platform of this.platforms) {
        // Check if barrel is falling onto this platform
        if (barrel.x + barrel.width > platform.x &&
            barrel.x < platform.x + platform.width &&
            barrel.y + barrel.height > platform.y &&
            barrel.y < platform.y + platform.height &&
            barrel.velocityY > 0) {
          
          // Land on platform
          barrel.y = platform.y - barrel.height;
          barrel.velocityY = 0;
          onPlatform = true;
          break;
        }
      }
      
      // If barrel is on a platform, check if it should fall off the edges
      if (onPlatform) {
        // Find which platform the barrel is on
        const currentPlatform = this.platforms.find(platform => 
          Math.abs(barrel.y + barrel.height - platform.y) < 5
        );
        
        if (currentPlatform) {
          // Check if barrel is past the platform edges - let it fall off!
          if (barrel.x + barrel.width < currentPlatform.x + 10 || 
              barrel.x > currentPlatform.x + currentPlatform.width - 10) {
            // Barrel is off the edge - start falling again
            barrel.velocityY = 50; // Small initial downward velocity
          } else {
            // Barrel is on platform - bounce off edges if hitting them
            if (barrel.x < currentPlatform.x + 10) {
              barrel.x = currentPlatform.x + 10;
              barrel.velocityX = Math.abs(barrel.velocityX);
            } else if (barrel.x + barrel.width > currentPlatform.x + currentPlatform.width - 10) {
              barrel.x = currentPlatform.x + currentPlatform.width - 10 - barrel.width;
              barrel.velocityX = -Math.abs(barrel.velocityX);
            }
          }
        }
      }
      
      // Remove barrels that fall off screen
      if (barrel.y > this.canvas.height + 100 || barrel.x < -100 || barrel.x > this.canvas.width + 100) {
        this.barrels.splice(i, 1);
      }
    }
  }

  private checkCollisions() {
    // Check player-barrel collisions
    for (const barrel of this.barrels) {
      if (this.player.x + this.player.width > barrel.x &&
          this.player.x < barrel.x + barrel.width &&
          this.player.y + this.player.height > barrel.y &&
          this.player.y < barrel.y + barrel.height) {
        
        // Game over
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        this.onGameEnd(this.score, this.level, duration);
        this.pause();
        return;
      }
    }
  }

  private updateScore() {
    // Award points for climbing (based on height)
    const heightScore = Math.floor((this.canvas.height - this.player.y) / 10);
    const newScore = heightScore + (this.level - 1) * 1000;
    
    if (newScore > this.score) {
      this.score = newScore;
      this.onScoreUpdate(this.score);
    }
  }

  private checkWinCondition() {
    // Check if player reached the top platform
    if (this.player.y <= 140) { // Near the top platform
      this.level++;
      this.onLevelUp(this.level);
      
      // Reset player position and increase difficulty
      this.player.x = 50;
      this.player.y = 520;
      this.barrelSpawnInterval = Math.max(1000, this.barrelSpawnInterval - 200); // Spawn barrels faster
      this.barrels = []; // Clear existing barrels
    }
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#1e293b'; // Dark blue background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw platforms
    this.ctx.fillStyle = '#8b4513'; // Brown
    for (const platform of this.platforms) {
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    // Draw ladders
    this.ctx.fillStyle = '#daa520'; // Gold
    for (const ladder of this.ladders) {
      this.ctx.fillRect(ladder.x, ladder.y, ladder.width, ladder.height);
      
      // Draw ladder rungs
      this.ctx.fillStyle = '#b8860b'; // Darker gold
      for (let y = ladder.y; y < ladder.y + ladder.height; y += 15) {
        this.ctx.fillRect(ladder.x, y, ladder.width, 3);
      }
      this.ctx.fillStyle = '#daa520';
    }

    // Draw player (gorilla emoji)
    this.ctx.font = '40px serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🦍', this.player.x + this.player.width / 2, this.player.y + this.player.height);

    // Draw barrels
    this.ctx.font = '30px serif';
    for (const barrel of this.barrels) {
      this.ctx.fillText('🛢️', barrel.x + barrel.width / 2, barrel.y + barrel.height);
    }

    // Draw princess at the top
    this.ctx.font = '40px serif';
    this.ctx.fillText('👸', 400, 110);

    // Draw UI
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    this.ctx.fillText(`Level: ${this.level}`, 10, 55);
    
    // Draw goal text
    this.ctx.textAlign = 'center';
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillText('Rescue the Princess!', 400, 90);
  }
}