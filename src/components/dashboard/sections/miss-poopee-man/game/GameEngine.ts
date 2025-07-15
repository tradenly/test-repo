
// Core game engine for Miss POOPEE-Man
export interface Position {
  x: number;
  y: number;
}

export interface Direction {
  x: number;
  y: number;
}

export interface Ghost {
  id: string;
  position: Position;
  direction: Direction;
  mode: 'chase' | 'scatter' | 'frightened';
  color: string;
  originalColor: string;
  target: Position;
}

export interface MazeCell {
  type: 'wall' | 'pellet' | 'powerPellet' | 'empty';
  visited?: boolean;
}

export interface GameState {
  player: {
    position: Position;
    direction: Direction;
  };
  ghosts: Ghost[];
  maze: MazeCell[][];
  score: number;
  lives: number;
  level: number;
  gameStatus: 'playing' | 'paused' | 'gameOver' | 'levelComplete';
  powerMode: {
    active: boolean;
    timeLeft: number;
  };
  pellets: {
    collected: number;
    total: number;
  };
}

// Game constants - INCREASED for better visibility
export const CELL_SIZE = 36; // Increased for better visibility 
export const MAZE_WIDTH = 25; // Increased maze size
export const MAZE_HEIGHT = 27;

// Direction constants
export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
  NONE: { x: 0, y: 0 }
};

// Larger maze layout (1=wall, 0=empty, 2=pellet, 3=power pellet) - 25x27
const MAZE_LAYOUT = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,1,2,1,1,2,1,2,1,2,1,2,1,2,1,1,2,1,1,1,3,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,1,2,2,1,2,2,1,2,2,1,2,2,1,2,2,2,2,2,1],
  [1,1,1,1,1,2,1,1,0,1,0,1,1,1,1,0,1,0,1,1,2,1,1,1,1],
  [0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0],
  [1,1,1,1,1,2,1,0,1,0,1,0,1,2,1,0,1,0,1,0,1,2,1,1,1],
  [0,0,0,0,0,2,0,0,1,0,1,0,0,2,0,0,1,0,1,0,0,2,0,0,0],
  [1,1,1,1,1,2,1,0,1,0,1,0,1,2,1,0,1,0,1,0,1,2,1,1,1],
  [0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0],
  [1,1,1,1,1,2,1,1,0,1,0,1,1,2,1,1,0,1,0,1,1,2,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1],
  [1,3,2,2,1,2,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,2,1,3,1],
  [1,1,1,2,1,2,1,2,1,1,1,2,1,2,1,2,1,1,1,2,1,2,1,1,1],
  [1,2,2,2,2,2,1,2,2,1,2,2,1,2,1,2,2,1,2,2,1,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,2,1,1,2,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,2,1,1,1,2,1,2,1,1,1],
  [1,2,2,2,2,2,1,2,2,1,2,2,1,2,1,2,2,1,2,2,1,2,2,2,1],
  [1,1,1,1,1,2,1,1,2,1,2,1,1,2,1,1,2,1,2,1,1,2,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

export class GameEngine {
  private gameState: GameState;
  private gameStartTime: number = 0;
  private lastUpdateTime: number = 0;

  constructor() {
    this.gameState = this.initializeGame();
  }

  private initializeGame(): GameState {
    const maze = this.createMaze();
    const pelletCount = this.countPellets(maze);
    
    return {
      player: {
        position: { x: 12, y: 20 }, // Center bottom for 25x27 maze
        direction: DIRECTIONS.NONE
      },
      ghosts: [
        {
          id: 'red',
          position: { x: 12, y: 12 },
          direction: DIRECTIONS.UP,
          mode: 'chase',
          color: '#FF0000',
          originalColor: '#FF0000',
          target: { x: 12, y: 20 }
        },
        {
          id: 'pink',
          position: { x: 11, y: 13 },
          direction: DIRECTIONS.LEFT,
          mode: 'chase',
          color: '#FFB8FF',
          originalColor: '#FFB8FF',
          target: { x: 12, y: 20 }
        },
        {
          id: 'cyan',
          position: { x: 13, y: 13 },
          direction: DIRECTIONS.RIGHT,
          mode: 'chase',
          color: '#00FFFF',
          originalColor: '#00FFFF',
          target: { x: 12, y: 20 }
        },
        {
          id: 'orange',
          position: { x: 12, y: 14 },
          direction: DIRECTIONS.DOWN,
          mode: 'chase',
          color: '#FFA500',
          originalColor: '#FFA500',
          target: { x: 12, y: 20 }
        }
      ],
      maze,
      score: 0,
      lives: 3,
      level: 1,
      gameStatus: 'playing',
      powerMode: {
        active: false,
        timeLeft: 0
      },
      pellets: {
        collected: 0,
        total: pelletCount
      }
    };
  }

  private createMaze(): MazeCell[][] {
    const maze: MazeCell[][] = [];
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      maze[y] = [];
      for (let x = 0; x < MAZE_WIDTH; x++) {
        const cell = MAZE_LAYOUT[y][x];
        maze[y][x] = {
          type: cell === 1 ? 'wall' : 
                cell === 2 ? 'pellet' : 
                cell === 3 ? 'powerPellet' : 'empty'
        };
      }
    }
    return maze;
  }

  private countPellets(maze: MazeCell[][]): number {
    let count = 0;
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        if (maze[y][x].type === 'pellet' || maze[y][x].type === 'powerPellet') {
          count++;
        }
      }
    }
    return count;
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public setPlayerDirection(direction: Direction): void {
    if (this.gameState.gameStatus === 'playing') {
      // Check if the new direction is valid
      const newPos = {
        x: this.gameState.player.position.x + direction.x,
        y: this.gameState.player.position.y + direction.y
      };
      
      if (this.isValidMove(newPos)) {
        this.gameState.player.direction = direction;
      }
    }
  }

  private isValidMove(position: Position): boolean {
    // Handle wrapping
    if (position.x < 0 || position.x >= MAZE_WIDTH) return true;
    if (position.y < 0 || position.y >= MAZE_HEIGHT) return false;
    
    return this.gameState.maze[position.y][position.x].type !== 'wall';
  }

  public update(): void {
    if (this.gameState.gameStatus !== 'playing') return;

    this.movePlayer();
    this.moveGhosts();
    this.checkCollisions();
    this.updatePowerMode();
    this.checkWinCondition();
  }

  private movePlayer(): void {
    const player = this.gameState.player;
    const newPos = {
      x: player.position.x + player.direction.x,
      y: player.position.y + player.direction.y
    };

    // Handle horizontal wrapping
    if (newPos.x < 0) newPos.x = MAZE_WIDTH - 1;
    if (newPos.x >= MAZE_WIDTH) newPos.x = 0;

    if (this.isValidMove(newPos)) {
      player.position = newPos;
      
      // Check for pellet collection
      const cell = this.gameState.maze[newPos.y][newPos.x];
      if (cell.type === 'pellet') {
        cell.type = 'empty';
        this.gameState.score += 10;
        this.gameState.pellets.collected++;
      } else if (cell.type === 'powerPellet') {
        cell.type = 'empty';
        this.gameState.score += 50;
        this.gameState.pellets.collected++;
        this.activatePowerMode();
      }
    }
  }

  private moveGhosts(): void {
    this.gameState.ghosts.forEach(ghost => {
      const directions = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT];
      const validDirections = directions.filter(dir => {
        const newPos = {
          x: ghost.position.x + dir.x,
          y: ghost.position.y + dir.y
        };
        return this.isValidMove(newPos);
      });

      if (validDirections.length > 0) {
        // Simple AI: choose random valid direction
        const randomDir = validDirections[Math.floor(Math.random() * validDirections.length)];
        ghost.direction = randomDir;
        
        const newPos = {
          x: ghost.position.x + ghost.direction.x,
          y: ghost.position.y + ghost.direction.y
        };
        
        if (this.isValidMove(newPos)) {
          ghost.position = newPos;
        }
      }
    });
  }

  private activatePowerMode(): void {
    this.gameState.powerMode.active = true;
    this.gameState.powerMode.timeLeft = 300; // 5 seconds at 60fps
    
    this.gameState.ghosts.forEach(ghost => {
      ghost.mode = 'frightened';
      ghost.color = '#0000FF';
      // Reverse direction
      ghost.direction = {
        x: -ghost.direction.x,
        y: -ghost.direction.y
      };
    });
  }

  private updatePowerMode(): void {
    if (this.gameState.powerMode.active) {
      this.gameState.powerMode.timeLeft--;
      
      if (this.gameState.powerMode.timeLeft <= 0) {
        this.gameState.powerMode.active = false;
        this.gameState.ghosts.forEach(ghost => {
          ghost.mode = 'chase';
          ghost.color = ghost.originalColor;
        });
      }
    }
  }

  private checkCollisions(): void {
    const player = this.gameState.player;
    
    this.gameState.ghosts.forEach(ghost => {
      if (player.position.x === ghost.position.x && player.position.y === ghost.position.y) {
        if (ghost.mode === 'frightened') {
          // Eat ghost
          this.gameState.score += 200;
          ghost.mode = 'chase';
          ghost.color = ghost.originalColor;
          ghost.position = { x: 9, y: 9 }; // Reset to center
        } else {
          // Player dies
          this.gameState.lives--;
          if (this.gameState.lives <= 0) {
            this.gameState.gameStatus = 'gameOver';
          } else {
            this.resetPositions();
          }
        }
      }
    });
  }

  private resetPositions(): void {
    this.gameState.player.position = { x: 12, y: 20 };
    this.gameState.player.direction = DIRECTIONS.NONE;
    
    this.gameState.ghosts.forEach((ghost, index) => {
      ghost.position = { x: 12 + (index - 1), y: 12 + Math.floor(index / 2) };
      ghost.mode = 'chase';
      ghost.color = ghost.originalColor;
    });
  }

  private checkWinCondition(): void {
    if (this.gameState.pellets.collected >= this.gameState.pellets.total) {
      this.gameState.gameStatus = 'levelComplete';
    }
  }

  public startGame(): void {
    this.gameStartTime = Date.now();
    this.gameState.gameStatus = 'playing';
  }

  public pauseGame(): void {
    this.gameState.gameStatus = 'paused';
  }

  public resumeGame(): void {
    this.gameState.gameStatus = 'playing';
  }

  public reset(): void {
    this.gameState = this.initializeGame();
  }

  public getGameDuration(): number {
    return Date.now() - this.gameStartTime;
  }
}
