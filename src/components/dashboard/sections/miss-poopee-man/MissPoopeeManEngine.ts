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
  private powerPelletMaxTime = 600; // 10 seconds at 60fps
  private eventListeners: (() => void)[] = [];
  private lastMoveTime = 0;
  private moveInterval = 150; // milliseconds between moves
  private ghostsEaten = 0;
  
  private cellSize = 20;
  private maze: number[][] = [];
  private mazeWidth = 21;
  private mazeHeight = 21;
  
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
    // Set canvas size to fit the maze
    this.canvas.width = this.mazeWidth * this.cellSize;
    this.canvas.height = this.mazeHeight * this.cellSize;
    
    this.createMaze();
    this.createPlayer();
    this.createGhosts();
    this.createPellets();
  }

  private createMaze() {
    // Classic Pac-Man style maze layout
    // 0 = empty path, 1 = wall, 2 = pellet, 3 = power pellet, 4 = ghost house
    const mazeLayout = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,3,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,3,1],
      [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1],
      [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
      [1,1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1,1],
      [1,1,1,1,1,2,1,0,0,0,0,0,0,0,1,2,1,1,1,1,1],
      [1,1,1,1,1,2,1,0,1,4,4,4,1,0,1,2,1,1,1,1,1],
      [0,0,0,0,0,2,0,0,1,4,4,4,1,0,0,2,0,0,0,0,0],
      [1,1,1,1,1,2,1,0,1,4,4,4,1,0,1,2,1,1,1,1,1],
      [1,1,1,1,1,2,1,0,0,0,0,0,0,0,1,2,1,1,1,1,1],
      [1,1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,2,1],
      [1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
      [1,1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1,1],
      [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
      [1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1],
      [1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
    
    this.maze = mazeLayout.map(row => [...row]);
  }

  private createPlayer() {
    // Place player in bottom center of maze
    this.player = {
      x: 10,
      y: 15,
      direction: 'right',
      nextDirection: 'right',
      moving: false
    };
  }

  private createGhosts() {
    const ghostData = [
      { color: '#FF0000', emoji: '👻', name: 'Blinky' }, // Red
      { color: '#FFB8FF', emoji: '👻', name: 'Pinky' }, // Pink
      { color: '#00FFFF', emoji: '👻', name: 'Inky' }, // Cyan
      { color: '#FFB852', emoji: '👻', name: 'Clyde' } // Orange
    ];
    
    this.ghosts = ghostData.map((ghost, index) => ({
      x: 9 + index,
      y: 9,
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
    // Handle tunnel wraparound
    if (y === 9 && (x < 0 || x >= this.mazeWidth)) {
      return true;
    }
    
    return x >= 0 && x < this.mazeWidth && y >= 0 && y < this.mazeHeight && this.maze[y][x] !== 1;
  }

  private updatePlayer() {
    const currentTime = Date.now();
    if (currentTime - this.lastMoveTime < this.moveInterval) {
      return;
    }
    
    // Try to change direction if possible
    const nextX = this.player.x + (this.player.nextDirection === 'left' ? -1 : this.player.nextDirection === 'right' ? 1 : 0);
    const nextY = this.player.y + (this.player.nextDirection === 'up' ? -1 : this.player.nextDirection === 'down' ? 1 : 0);
    
    if (this.isValidMove(nextX, nextY)) {
      this.player.direction = this.player.nextDirection;
    }
    
    // Move in current direction
    let moveX = this.player.x + (this.player.direction === 'left' ? -1 : this.player.direction === 'right' ? 1 : 0);
    let moveY = this.player.y + (this.player.direction === 'up' ? -1 : this.player.direction === 'down' ? 1 : 0);
    
    // Handle tunnel wraparound
    if (moveY === 9 && moveX < 0) {
      moveX = this.mazeWidth - 1;
    } else if (moveY === 9 && moveX >= this.mazeWidth) {
      moveX = 0;
    }
    
    if (this.isValidMove(moveX, moveY)) {
      this.player.x = moveX;
      this.player.y = moveY;
      this.player.moving = true;
      this.lastMoveTime = currentTime;
    } else {
      this.player.moving = false;
    }
  }

  private updateGhosts() {
    const currentTime = Date.now();
    if (currentTime - this.lastMoveTime < this.moveInterval) {
      return;
    }
    
    this.ghosts.forEach((ghost, index) => {
      // Better AI: choose direction based on player position when not vulnerable
      if (!ghost.vulnerable && Math.random() < 0.3) {
        const directions: ('up' | 'down' | 'left' | 'right')[] = [];
        
        // Add directions that move towards player
        if (this.player.x > ghost.x) directions.push('right');
        if (this.player.x < ghost.x) directions.push('left');
        if (this.player.y > ghost.y) directions.push('down');
        if (this.player.y < ghost.y) directions.push('up');
        
        if (directions.length > 0) {
          ghost.direction = directions[Math.floor(Math.random() * directions.length)];
        }
      } else if (ghost.vulnerable && Math.random() < 0.2) {
        // Run away from player when vulnerable
        const directions: ('up' | 'down' | 'left' | 'right')[] = [];
        
        if (this.player.x > ghost.x) directions.push('left');
        if (this.player.x < ghost.x) directions.push('right');
        if (this.player.y > ghost.y) directions.push('up');
        if (this.player.y < ghost.y) directions.push('down');
        
        if (directions.length > 0) {
          ghost.direction = directions[Math.floor(Math.random() * directions.length)];
        }
      }
      
      // Move ghost
      let moveX = ghost.x + (ghost.direction === 'left' ? -1 : ghost.direction === 'right' ? 1 : 0);
      let moveY = ghost.y + (ghost.direction === 'up' ? -1 : ghost.direction === 'down' ? 1 : 0);
      
      // Handle tunnel wraparound
      if (moveY === 9 && moveX < 0) {
        moveX = this.mazeWidth - 1;
      } else if (moveY === 9 && moveX >= this.mazeWidth) {
        moveX = 0;
      }
      
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
          this.powerPelletTime = this.powerPelletMaxTime;
          this.ghostsEaten = 0;
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
          // Eat ghost with increasing points
          this.ghostsEaten++;
          const points = 200 * Math.pow(2, this.ghostsEaten - 1);
          this.score += points;
          this.onScoreUpdate(this.score);
          ghost.vulnerable = false;
          // Respawn ghost in ghost house
          ghost.x = 10;
          ghost.y = 9;
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
        if (pellet.isPowerPellet) {
          // Draw power pellet as 💩 emoji
          this.ctx.font = `${this.cellSize - 4}px Arial`;
          this.ctx.textAlign = 'center';
          this.ctx.fillText(
            '💩',
            pellet.x * this.cellSize + this.cellSize / 2,
            pellet.y * this.cellSize + this.cellSize - 2
          );
        } else {
          // Draw regular pellet as small white dot
          this.ctx.fillStyle = '#FFFFFF';
          this.ctx.beginPath();
          this.ctx.arc(
            pellet.x * this.cellSize + this.cellSize / 2,
            pellet.y * this.cellSize + this.cellSize / 2,
            2,
            0,
            Math.PI * 2
          );
          this.ctx.fill();
        }
      }
    });
    
    // Draw ghosts
    this.ghosts.forEach(ghost => {
      if (ghost.vulnerable) {
        // Show blinking effect when power pellet is about to end
        const blinkThreshold = 120; // 2 seconds
        if (this.powerPelletTime > blinkThreshold || Math.floor(this.powerPelletTime / 10) % 2 === 0) {
          this.ctx.fillStyle = '#0000FF';
        } else {
          this.ctx.fillStyle = '#FFFFFF';
        }
      } else {
        this.ctx.fillStyle = ghost.color;
      }
      
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