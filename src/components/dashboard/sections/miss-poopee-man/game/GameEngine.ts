
// Core game engine for Miss POOPEE-Man
export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  player: {
    position: Position;
    direction: Direction;
    nextDirection: Direction | null;
    alive: boolean;
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
    ghostsEaten: number;
  };
  pellets: {
    total: number;
    collected: number;
  };
}

export interface Direction {
  x: number;
  y: number;
}

export interface Ghost {
  id: string;
  position: Position;
  direction: Direction;
  mode: 'chase' | 'scatter' | 'frightened' | 'dead';
  color: string;
  originalColor: string;
  target: Position;
  homePosition: Position;
  speed: number;
}

export interface MazeCell {
  type: 'wall' | 'pellet' | 'powerPellet' | 'empty' | 'ghostHouse';
  x: number;
  y: number;
}

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
  NONE: { x: 0, y: 0 }
} as const;

export const MAZE_WIDTH = 25;
export const MAZE_HEIGHT = 25;
export const CELL_SIZE = 20;

// Simplified maze layout - 1 = wall, 0 = pellet, 2 = power pellet, 3 = empty, 4 = ghost house
export const MAZE_LAYOUT = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,2,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,2,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,0,1,1,1,1,1,3,1,3,1,1,1,1,1,0,1,1,1,1,1],
  [1,1,1,1,1,0,1,3,3,3,3,3,3,3,3,3,3,3,1,0,1,1,1,1,1],
  [1,1,1,1,1,0,1,3,1,1,4,4,4,4,4,1,1,3,1,0,1,1,1,1,1],
  [3,3,3,3,3,0,3,3,1,4,4,4,4,4,4,4,1,3,3,0,3,3,3,3,3],
  [1,1,1,1,1,0,1,3,1,4,4,4,4,4,4,4,1,3,1,0,1,1,1,1,1],
  [1,1,1,1,1,0,1,3,1,1,1,1,1,1,1,1,1,3,1,0,1,1,1,1,1],
  [1,1,1,1,1,0,1,3,3,3,3,3,3,3,3,3,3,3,1,0,1,1,1,1,1],
  [1,1,1,1,1,0,1,1,1,1,1,3,1,3,1,1,1,1,1,0,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,0,1],
  [1,2,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,1],
  [1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

export class GameEngine {
  private gameState: GameState;
  private gameStartTime: number;

  constructor() {
    this.gameState = this.initializeGame();
    this.gameStartTime = Date.now();
  }

  private initializeGame(): GameState {
    const maze = this.createMaze();
    const pelletCount = this.countPellets(maze);

    return {
      player: {
        position: { x: 12, y: 18 },
        direction: DIRECTIONS.NONE,
        nextDirection: null,
        alive: true
      },
      ghosts: this.createGhosts(),
      maze,
      score: 0,
      lives: 3,
      level: 1,
      gameStatus: 'playing',
      powerMode: {
        active: false,
        timeLeft: 0,
        ghostsEaten: 0
      },
      pellets: {
        total: pelletCount,
        collected: 0
      }
    };
  }

  private createMaze(): MazeCell[][] {
    return MAZE_LAYOUT.map((row, y) =>
      row.map((cell, x) => ({
        type: this.getCellType(cell),
        x,
        y
      }))
    );
  }

  private getCellType(cell: number): MazeCell['type'] {
    switch (cell) {
      case 1: return 'wall';
      case 0: return 'pellet';
      case 2: return 'powerPellet';
      case 3: return 'empty';
      case 4: return 'ghostHouse';
      default: return 'wall';
    }
  }

  private countPellets(maze: MazeCell[][]): number {
    return maze.flat().filter(cell => 
      cell.type === 'pellet' || cell.type === 'powerPellet'
    ).length;
  }

  private createGhosts(): Ghost[] {
    return [
      {
        id: 'red',
        position: { x: 12, y: 9 },
        direction: DIRECTIONS.UP,
        mode: 'scatter',
        color: '#FF0000',
        originalColor: '#FF0000',
        target: { x: 23, y: 1 },
        homePosition: { x: 12, y: 9 },
        speed: 1
      },
      {
        id: 'pink',
        position: { x: 12, y: 10 },
        direction: DIRECTIONS.DOWN,
        mode: 'scatter',
        color: '#FFB8FF',
        originalColor: '#FFB8FF',
        target: { x: 1, y: 1 },
        homePosition: { x: 12, y: 10 },
        speed: 1
      },
      {
        id: 'cyan',
        position: { x: 11, y: 10 },
        direction: DIRECTIONS.UP,
        mode: 'scatter',
        color: '#00FFFF',
        originalColor: '#00FFFF',
        target: { x: 23, y: 23 },
        homePosition: { x: 11, y: 10 },
        speed: 1
      },
      {
        id: 'orange',
        position: { x: 13, y: 10 },
        direction: DIRECTIONS.UP,
        mode: 'scatter',
        color: '#FFB852',
        originalColor: '#FFB852',
        target: { x: 1, y: 23 },
        homePosition: { x: 13, y: 10 },
        speed: 1
      }
    ];
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public setPlayerDirection(direction: Direction): void {
    if (this.gameState.gameStatus !== 'playing') return;
    
    this.gameState.player.nextDirection = direction;
  }

  public update(): void {
    if (this.gameState.gameStatus !== 'playing') return;

    this.updatePlayer();
    this.updateGhosts();
    this.updatePowerMode();
    this.checkCollisions();
    this.checkWinCondition();
  }

  private updatePlayer(): void {
    const player = this.gameState.player;
    
    // Try to change direction
    if (player.nextDirection && this.canMove(player.position, player.nextDirection)) {
      player.direction = player.nextDirection;
      player.nextDirection = null;
    }

    // Move player
    if (this.canMove(player.position, player.direction)) {
      player.position.x += player.direction.x;
      player.position.y += player.direction.y;
      
      // Handle tunnel effect
      if (player.position.x < 0) player.position.x = MAZE_WIDTH - 1;
      if (player.position.x >= MAZE_WIDTH) player.position.x = 0;

      this.handlePelletCollection(player.position);
    }
  }

  private canMove(position: Position, direction: Direction): boolean {
    const newX = position.x + direction.x;
    const newY = position.y + direction.y;

    if (newY < 0 || newY >= MAZE_HEIGHT) return false;
    if (newX < 0 || newX >= MAZE_WIDTH) return true; // Allow tunnel

    const cell = this.gameState.maze[newY][newX];
    return cell.type !== 'wall';
  }

  private handlePelletCollection(position: Position): void {
    const cell = this.gameState.maze[position.y][position.x];
    
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

  private activatePowerMode(): void {
    this.gameState.powerMode = {
      active: true,
      timeLeft: 300, // 5 seconds at 60fps
      ghostsEaten: 0
    };

    // Make all ghosts frightened
    this.gameState.ghosts.forEach(ghost => {
      if (ghost.mode !== 'dead') {
        ghost.mode = 'frightened';
        ghost.color = '#0000FF';
        ghost.direction = this.getOppositeDirection(ghost.direction);
      }
    });
  }

  private updatePowerMode(): void {
    if (this.gameState.powerMode.active) {
      this.gameState.powerMode.timeLeft--;
      
      if (this.gameState.powerMode.timeLeft <= 0) {
        this.gameState.powerMode.active = false;
        this.gameState.ghosts.forEach(ghost => {
          if (ghost.mode === 'frightened') {
            ghost.mode = 'chase';
            ghost.color = ghost.originalColor;
          }
        });
      }
    }
  }

  private updateGhosts(): void {
    this.gameState.ghosts.forEach(ghost => {
      this.updateGhostTarget(ghost);
      this.moveGhost(ghost);
    });
  }

  private updateGhostTarget(ghost: Ghost): void {
    const player = this.gameState.player;
    
    switch (ghost.mode) {
      case 'chase':
        ghost.target = { ...player.position };
        break;
      case 'scatter':
        // Use predefined scatter targets
        break;
      case 'frightened':
        // Random movement
        ghost.target = { 
          x: Math.floor(Math.random() * MAZE_WIDTH),
          y: Math.floor(Math.random() * MAZE_HEIGHT)
        };
        break;
      case 'dead':
        ghost.target = { ...ghost.homePosition };
        break;
    }
  }

  private moveGhost(ghost: Ghost): void {
    const validDirections = this.getValidDirections(ghost.position);
    const bestDirection = this.getBestDirection(ghost.position, ghost.target, validDirections, ghost.direction);
    
    if (bestDirection && this.canMove(ghost.position, bestDirection)) {
      ghost.direction = bestDirection;
      ghost.position.x += bestDirection.x;
      ghost.position.y += bestDirection.y;
    }
  }

  private getValidDirections(position: Position): Direction[] {
    return [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT]
      .filter(dir => this.canMove(position, dir));
  }

  private getBestDirection(
    position: Position, 
    target: Position, 
    validDirections: Direction[], 
    currentDirection: Direction
  ): Direction | null {
    if (validDirections.length === 0) return null;

    // Filter out reverse direction unless it's the only option
    const nonReverseDirections = validDirections.filter(dir => {
      const opposite = this.getOppositeDirection(currentDirection);
      return !(dir.x === opposite.x && dir.y === opposite.y);
    });

    const directionsToCheck = nonReverseDirections.length > 0 ? nonReverseDirections : validDirections;

    // Find direction that minimizes distance to target
    return directionsToCheck.reduce((best, dir) => {
      const newPos = {
        x: position.x + dir.x,
        y: position.y + dir.y
      };
      const distance = Math.abs(newPos.x - target.x) + Math.abs(newPos.y - target.y);
      const bestDistance = Math.abs(position.x + best.x - target.x) + Math.abs(position.y + best.y - target.y);
      
      return distance < bestDistance ? dir : best;
    }, directionsToCheck[0]);
  }

  private getOppositeDirection(direction: Direction): Direction {
    return { x: -direction.x, y: -direction.y };
  }

  private checkCollisions(): void {
    const player = this.gameState.player;
    
    this.gameState.ghosts.forEach(ghost => {
      if (ghost.position.x === player.position.x && ghost.position.y === player.position.y) {
        if (ghost.mode === 'frightened') {
          // Player eats ghost
          ghost.mode = 'dead';
          ghost.color = '#888888';
          const points = 200 * Math.pow(2, this.gameState.powerMode.ghostsEaten);
          this.gameState.score += points;
          this.gameState.powerMode.ghostsEaten++;
        } else if (ghost.mode !== 'dead') {
          // Ghost eats player
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
    this.gameState.player.position = { x: 12, y: 18 };
    this.gameState.player.direction = DIRECTIONS.NONE;
    this.gameState.player.nextDirection = null;
    
    this.gameState.ghosts.forEach(ghost => {
      ghost.position = { ...ghost.homePosition };
      ghost.mode = 'scatter';
      ghost.color = ghost.originalColor;
    });
    
    this.gameState.powerMode.active = false;
  }

  private checkWinCondition(): void {
    if (this.gameState.pellets.collected >= this.gameState.pellets.total) {
      this.gameState.gameStatus = 'levelComplete';
    }
  }

  public getGameDuration(): number {
    return Date.now() - this.gameStartTime;
  }

  public pauseGame(): void {
    if (this.gameState.gameStatus === 'playing') {
      this.gameState.gameStatus = 'paused';
    }
  }

  public resumeGame(): void {
    if (this.gameState.gameStatus === 'paused') {
      this.gameState.gameStatus = 'playing';
    }
  }
}
