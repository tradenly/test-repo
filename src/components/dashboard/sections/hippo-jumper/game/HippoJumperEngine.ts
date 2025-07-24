export interface HippoJumperPlayer {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  onGround: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Collectible {
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
}

interface GameCallbacks {
  onGameOver: () => void;
  onScoreUpdate: (score: number) => void;
  onJump: () => void;
  onCollectItem: () => void;
}

export class HippoJumperEngine {
  private canvas: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  private callbacks: GameCallbacks;
  
  private player: HippoJumperPlayer;
  private platforms: Platform[] = [];
  private collectibles: Collectible[] = [];
  private score = 0;
  private gameRunning = false;
  private animationId: number | null = null;
  
  private readonly gravity = 0.5;
  private readonly jumpPower = -12;
  private readonly playerSpeed = 3;

  constructor(
    canvas: CanvasRenderingContext2D,
    width: number,
    height: number,
    callbacks: GameCallbacks
  ) {
    this.canvas = canvas;
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.callbacks = callbacks;

    this.player = {
      x: 50,
      y: height - 150,
      width: 40,
      height: 40,
      velocityY: 0,
      isJumping: false,
      onGround: false
    };

    this.initializePlatforms();
    this.initializeCollectibles();
    this.setupControls();
    this.render();
  }

  private initializePlatforms() {
    this.platforms = [
      // Ground platform
      { x: 0, y: this.canvasHeight - 20, width: this.canvasWidth, height: 20 },
      // Jumping platforms
      { x: 200, y: this.canvasHeight - 120, width: 150, height: 20 },
      { x: 400, y: this.canvasHeight - 200, width: 150, height: 20 },
      { x: 600, y: this.canvasHeight - 280, width: 150, height: 20 },
      { x: 150, y: this.canvasHeight - 360, width: 150, height: 20 },
      { x: 450, y: this.canvasHeight - 440, width: 150, height: 20 },
    ];
  }

  private initializeCollectibles() {
    this.collectibles = [
      { x: 250, y: this.canvasHeight - 160, width: 20, height: 20, collected: false },
      { x: 450, y: this.canvasHeight - 240, width: 20, height: 20, collected: false },
      { x: 650, y: this.canvasHeight - 320, width: 20, height: 20, collected: false },
      { x: 200, y: this.canvasHeight - 400, width: 20, height: 20, collected: false },
      { x: 500, y: this.canvasHeight - 480, width: 20, height: 20, collected: false },
    ];
  }

  private setupControls() {
    const handleJump = () => {
      if (this.gameRunning && this.player.onGround) {
        this.jump();
      }
    };

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
      }
    });

    // Mouse/touch controls
    this.canvas.canvas.addEventListener('click', handleJump);
  }

  private jump() {
    if (this.player.onGround) {
      this.player.velocityY = this.jumpPower;
      this.player.isJumping = true;
      this.player.onGround = false;
      this.callbacks.onJump();
    }
  }

  start() {
    this.gameRunning = true;
    this.score = 0;
    this.callbacks.onScoreUpdate(this.score);
    this.gameLoop();
  }

  reset() {
    this.gameRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.player.x = 50;
    this.player.y = this.canvasHeight - 150;
    this.player.velocityY = 0;
    this.player.isJumping = false;
    this.player.onGround = false;
    this.score = 0;
    
    // Reset collectibles
    this.collectibles.forEach(collectible => {
      collectible.collected = false;
    });
    
    this.render();
  }

  private gameLoop() {
    if (!this.gameRunning) return;

    this.update();
    this.render();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private update() {
    // Handle player movement
    const keys = this.getKeys();
    if (keys.left && this.player.x > 0) {
      this.player.x -= this.playerSpeed;
    }
    if (keys.right && this.player.x < this.canvasWidth - this.player.width) {
      this.player.x += this.playerSpeed;
    }

    // Apply gravity
    this.player.velocityY += this.gravity;
    this.player.y += this.player.velocityY;

    // Platform collision detection
    this.player.onGround = false;
    
    for (const platform of this.platforms) {
      if (this.checkPlatformCollision(this.player, platform)) {
        if (this.player.velocityY > 0) { // Falling down
          this.player.y = platform.y - this.player.height;
          this.player.velocityY = 0;
          this.player.isJumping = false;
          this.player.onGround = true;
        }
      }
    }

    // Collectible collision detection
    for (const collectible of this.collectibles) {
      if (!collectible.collected && this.checkCollision(this.player, collectible)) {
        collectible.collected = true;
        this.score += 100;
        this.callbacks.onScoreUpdate(this.score);
        this.callbacks.onCollectItem();
      }
    }

    // Check if player fell off the screen
    if (this.player.y > this.canvasHeight) {
      this.callbacks.onGameOver();
      this.gameRunning = false;
    }

    // Win condition - collected all items
    if (this.collectibles.every(c => c.collected)) {
      // Add bonus points and reset collectibles for continuous play
      this.score += 500;
      this.callbacks.onScoreUpdate(this.score);
      this.collectibles.forEach(c => c.collected = false);
    }
  }

  private checkPlatformCollision(player: HippoJumperPlayer, platform: Platform): boolean {
    return player.x < platform.x + platform.width &&
           player.x + player.width > platform.x &&
           player.y < platform.y + platform.height &&
           player.y + player.height > platform.y;
  }

  private checkCollision(obj1: any, obj2: any): boolean {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  }

  private getKeys() {
    const keys = {
      left: false,
      right: false
    };

    // Simple arrow key detection
    document.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowLeft') keys.left = true;
      if (e.code === 'ArrowRight') keys.right = true;
    });

    document.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft') keys.left = false;
      if (e.code === 'ArrowRight') keys.right = false;
    });

    return keys;
  }

  private render() {
    // Clear canvas
    this.canvas.fillStyle = '#87CEEB'; // Sky blue
    this.canvas.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw platforms
    this.canvas.fillStyle = '#8B4513'; // Brown
    for (const platform of this.platforms) {
      this.canvas.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    // Draw collectibles
    for (const collectible of this.collectibles) {
      if (!collectible.collected) {
        this.canvas.fillStyle = '#FFD700'; // Gold
        this.canvas.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
        
        // Add a simple shine effect
        this.canvas.fillStyle = '#FFFF00'; // Bright yellow
        this.canvas.fillRect(collectible.x + 2, collectible.y + 2, 8, 8);
      }
    }

    // Draw player (hippo)
    this.canvas.fillStyle = '#DA70D6'; // Orchid (hippo color)
    this.canvas.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    
    // Add simple hippo features
    this.canvas.fillStyle = '#FF69B4'; // Hot pink for belly
    this.canvas.fillRect(this.player.x + 5, this.player.y + 15, this.player.width - 10, this.player.height - 20);
    
    // Eyes
    this.canvas.fillStyle = '#000000';
    this.canvas.fillRect(this.player.x + 8, this.player.y + 8, 4, 4);
    this.canvas.fillRect(this.player.x + 20, this.player.y + 8, 4, 4);
  }
}