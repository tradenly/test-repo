export interface Player {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  nextDirection: 'up' | 'down' | 'left' | 'right';
  moving: boolean;
}

export interface Ghost {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  vulnerable: boolean;
  color: string;
  emoji: string;
}

export interface Pellet {
  x: number;
  y: number;
  isPowerPellet: boolean;
  collected: boolean;
}

export class MissPoopeeManEngine {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private player: Player;
  private ghosts: Ghost[] = [];
  private pellets: Pellet[] = [];
  
  private gameRunning = false;
  private animationId: number | null = null;
  private score = 0;
  private pelletsCollected = 0;
  private gameStartTime = 0;
  private powerPelletTime = 0;
  private eventListeners: (() => void)[] = [];
  
  private cellSize = 20;
  private maze: number[][] = [];
  private mazeWidth = 0;
  private mazeHeight = 0;
  
  private onGameEnd: (score: number, pelletsCount: number, duration: number) => void;
  private onScoreUpdate: (score: number) => void;

  constructor(
    context: CanvasRenderingContext2D,
    canvasElement: HTMLCanvasElement,
    onGameEnd: (score: number, pelletsCount: number, duration: number) => void,
    onScoreUpdate: (score: number) => void
  ) {
    this.ctx = context;
    this.canvas = canvasElement;
    this.onGameEnd = onGameEnd;
    this.onScoreUpdate = onScoreUpdate;
    
    this.initializeGame();
    this.bindEvents();
    this.render();
    console.log("🎮 Miss POOPEE-Man engine initialized successfully");
  }

  private initializeGame() {
    this.mazeWidth = Math.floor(this.canvas.width / this.cellSize);
    this.mazeHeight = Math.floor(this.canvas.height / this.cellSize);
    
    this.createMaze();
    this.createPlayer();
    this.createGhosts();
    this.createPellets();
  }

  private createMaze() {
    // Create a simple maze pattern
    // 0 = empty path, 1 = wall, 2 = pellet, 3 = power pellet
    this.maze = Array(this.mazeHeight).fill(null).map(() => Array(this.mazeWidth).fill(0));
    
    // Create border walls
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        if (x === 0 || x === this.mazeWidth - 1 || y === 0 || y === this.mazeHeight - 1) {
          this.maze[y][x] = 1;
        }
      }
    }
    
    // Add some internal walls
    for (let y = 2; y < this.mazeHeight - 2; y += 3) {
      for (let x = 2; x < this.mazeWidth - 2; x += 4) {
        this.maze[y][x] = 1;
        this.maze[y][x + 1] = 1;
        this.maze[y + 1][x] = 1;
      }
    }
    
    // Add pellets to empty spaces
    for (let y = 1; y < this.mazeHeight - 1; y++) {
      for (let x = 1; x < this.mazeWidth - 1; x++) {
        if (this.maze[y][x] === 0) {
          // Add power pellets at corners
          if ((x === 1 || x === this.mazeWidth - 2) && (y === 1 || y === this.mazeHeight - 2)) {
            this.maze[y][x] = 3;
          } else if (Math.random() < 0.7) {
            this.maze[y][x] = 2;
          }
        }
      }
    }
  }

  private createPlayer() {
    // Place player in a safe spot
    this.player = {
      x: Math.floor(this.mazeWidth / 2),
      y: Math.floor(this.mazeHeight / 2),
      direction: 'right',
      nextDirection: 'right',
      moving: false
    };
    
    // Clear the starting position
    this.maze[this.player.y][this.player.x] = 0;
  }

  private createGhosts() {
    const ghostData = [
      { color: '#FF0000', emoji: '👻' },
      { color: '#FFB8FF', emoji: '👻' },
      { color: '#00FFFF', emoji: '👻' },
      { color: '#FFB852', emoji: '👻' }
    ];
    
    this.ghosts = ghostData.map((ghost, index) => ({
      x: Math.floor(this.mazeWidth / 2) + index - 2,
      y: Math.floor(this.mazeHeight / 2) - 2,
      direction: ['up', 'down', 'left', 'right'][index] as 'up' | 'down' | 'left' | 'right',
      vulnerable: false,
      color: ghost.color,
      emoji: ghost.emoji
    }));
  }

  private createPellets() {
    this.pellets = [];
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        if (this.maze[y][x] === 2 || this.maze[y][x] === 3) {
          this.pellets.push({
            x,
            y,
            isPowerPellet: this.maze[y][x] === 3,
            collected: false
          });
        }
      }
    }
  }

  private bindEvents() {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (this.gameRunning) {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            this.player.nextDirection = 'up';
            break;
          case 'ArrowDown':
            e.preventDefault();
            this.player.nextDirection = 'down';
            break;
          case 'ArrowLeft':
            e.preventDefault();
            this.player.nextDirection = 'left';
            break;
          case 'ArrowRight':
            e.preventDefault();
            this.player.nextDirection = 'right';
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    this.eventListeners.push(() => {
      document.removeEventListener('keydown', handleKeyPress);
    });
  }

  private isValidMove(x: number, y: number): boolean {
    return x >= 0 && x < this.mazeWidth && y >= 0 && y < this.mazeHeight && this.maze[y][x] !== 1;
  }

  private updatePlayer() {
    // Try to change direction if possible
    const nextX = this.player.x + (this.player.nextDirection === 'left' ? -1 : this.player.nextDirection === 'right' ? 1 : 0);
    const nextY = this.player.y + (this.player.nextDirection === 'up' ? -1 : this.player.nextDirection === 'down' ? 1 : 0);
    
    if (this.isValidMove(nextX, nextY)) {
      this.player.direction = this.player.nextDirection;
    }
    
    // Move in current direction
    const moveX = this.player.x + (this.player.direction === 'left' ? -1 : this.player.direction === 'right' ? 1 : 0);
    const moveY = this.player.y + (this.player.direction === 'up' ? -1 : this.player.direction === 'down' ? 1 : 0);
    
    if (this.isValidMove(moveX, moveY)) {
      this.player.x = moveX;
      this.player.y = moveY;
      this.player.moving = true;
    } else {
      this.player.moving = false;
    }
  }

  private updateGhosts() {
    this.ghosts.forEach(ghost => {
      // Simple AI: random direction changes
      if (Math.random() < 0.1) {
        const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
        ghost.direction = directions[Math.floor(Math.random() * directions.length)];
      }
      
      // Move ghost
      const moveX = ghost.x + (ghost.direction === 'left' ? -1 : ghost.direction === 'right' ? 1 : 0);
      const moveY = ghost.y + (ghost.direction === 'up' ? -1 : ghost.direction === 'down' ? 1 : 0);
      
      if (this.isValidMove(moveX, moveY)) {
        ghost.x = moveX;
        ghost.y = moveY;
      } else {
        // Change direction if hit wall
        const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];
        ghost.direction = directions[Math.floor(Math.random() * directions.length)];
      }
    });
  }

  private checkCollisions() {
    // Check pellet collection
    this.pellets.forEach(pellet => {
      if (!pellet.collected && pellet.x === this.player.x && pellet.y === this.player.y) {
        pellet.collected = true;
        this.pelletsCollected++;
        
        if (pellet.isPowerPellet) {
          this.score += 50;
          this.powerPelletTime = 300; // 5 seconds at 60fps
          this.ghosts.forEach(ghost => {
            ghost.vulnerable = true;
          });
        } else {
          this.score += 10;
        }
        
        this.onScoreUpdate(this.score);
      }
    });
    
    // Check ghost collisions
    this.ghosts.forEach(ghost => {
      if (ghost.x === this.player.x && ghost.y === this.player.y) {
        if (ghost.vulnerable) {
          // Eat ghost
          this.score += 200;
          this.onScoreUpdate(this.score);
          ghost.vulnerable = false;
          // Respawn ghost (simple implementation)
          ghost.x = Math.floor(this.mazeWidth / 2);
          ghost.y = Math.floor(this.mazeHeight / 2) - 2;
        } else {
          // Game over
          this.gameOver();
        }
      }
    });
    
    // Check win condition
    if (this.pellets.every(pellet => pellet.collected)) {
      this.gameOver();
    }
  }

  private update() {
    if (this.powerPelletTime > 0) {
      this.powerPelletTime--;
      if (this.powerPelletTime === 0) {
        this.ghosts.forEach(ghost => {
          ghost.vulnerable = false;
        });
      }
    }
    
    this.updatePlayer();
    this.updateGhosts();
    this.checkCollisions();
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw maze
    this.ctx.fillStyle = '#0000FF';
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        if (this.maze[y][x] === 1) {
          this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }
      }
    }
    
    // Draw pellets
    this.pellets.forEach(pellet => {
      if (!pellet.collected) {
        this.ctx.fillStyle = pellet.isPowerPellet ? '#FFFF00' : '#FFFFFF';
        const radius = pellet.isPowerPellet ? 6 : 2;
        this.ctx.beginPath();
        this.ctx.arc(
          pellet.x * this.cellSize + this.cellSize / 2,
          pellet.y * this.cellSize + this.cellSize / 2,
          radius,
          0,
          Math.PI * 2
        );
        this.ctx.fill();
      }
    });
    
    // Draw ghosts
    this.ghosts.forEach(ghost => {
      this.ctx.fillStyle = ghost.vulnerable ? '#0000FF' : ghost.color;
      this.ctx.font = `${this.cellSize - 2}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        ghost.emoji,
        ghost.x * this.cellSize + this.cellSize / 2,
        ghost.y * this.cellSize + this.cellSize - 2
      );
    });
    
    // Draw player
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.font = `${this.cellSize - 2}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      '💩',
      this.player.x * this.cellSize + this.cellSize / 2,
      this.player.y * this.cellSize + this.cellSize - 2
    );
  }

  start() {
    console.log("🎯 Miss POOPEE-Man game starting");
    this.gameRunning = true;
    this.gameStartTime = Date.now();
    this.gameLoop();
  }

  reset() {
    console.log("🔄 Miss POOPEE-Man game reset");
    this.gameRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    this.score = 0;
    this.pelletsCollected = 0;
    this.powerPelletTime = 0;
    this.initializeGame();
    this.render();
  }

  cleanup() {
    console.log("🧹 Cleaning up Miss POOPEE-Man game engine...");
    this.gameRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.eventListeners.forEach(removeListener => removeListener());
    this.eventListeners = [];
  }

  private gameLoop() {
    if (!this.gameRunning) {
      return;
    }

    try {
      this.update();
      this.render();
      this.animationId = requestAnimationFrame(() => this.gameLoop());
    } catch (error) {
      console.error("❌ Error in Miss POOPEE-Man game loop:", error);
      this.gameOver();
    }
  }

  private gameOver() {
    console.log("💀 Miss POOPEE-Man game over");
    this.gameRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    const duration = Math.floor((Date.now() - this.gameStartTime) / 1000);
    console.log("📊 Game over - Score:", this.score, "Duration:", duration);
    this.onGameEnd(this.score, this.pelletsCollected, duration);
  }
}