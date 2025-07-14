
export interface Position {
  x: number;
  y: number;
}

export interface Ghost {
  id: string;
  position: Position;
  direction: Direction;
  mode: 'chase' | 'scatter' | 'frightened' | 'eaten';
  color: string;
  target: Position;
  modeTimer: number;
}

export interface GameState {
  player: {
    position: Position;
    direction: Direction;
    nextDirection: Direction;
    isMoving: boolean;
  };
  ghosts: Ghost[];
  pellets: boolean[][];
  powerPellets: Position[];
  score: number;
  level: number;
  lives: number;
  gameStatus: 'playing' | 'paused' | 'game-over' | 'level-complete';
  powerModeTimer: number;
  pelletsRemaining: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  NONE = 'NONE'
}

export enum CellType {
  WALL = 0,
  PELLET = 1,
  POWER_PELLET = 2,
  EMPTY = 3,
  GHOST_HOUSE = 4
}

// Classic Pac-Man inspired maze (19x21 grid)
export const MAZE_LAYOUT = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
  [0,2,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,2,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1,0],
  [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
  [0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0],
  [3,3,3,0,1,0,1,1,1,1,1,1,1,0,1,0,3,3,3],
  [0,0,0,0,1,0,1,0,4,4,4,0,1,0,1,0,0,0,0],
  [1,1,1,1,1,1,1,0,4,4,4,0,1,1,1,1,1,1,1],
  [0,0,0,0,1,0,1,0,4,4,4,0,1,0,1,0,0,0,0],
  [3,3,3,0,1,0,1,1,1,1,1,1,1,0,1,0,3,3,3],
  [0,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0],
  [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
  [0,1,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,2,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,2,0],
  [0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

export const CELL_SIZE = 20;
export const MAZE_WIDTH = 19;
export const MAZE_HEIGHT = 19;

export class MissPacManEngine {
  private gameState: GameState;
  private animationId: number | null = null;
  private lastUpdateTime = 0;
  private updateInterval = 1000 / 60; // 60 FPS
  private moveSpeed = 100; // milliseconds per cell
  private lastMoveTime = 0;

  constructor() {
    this.gameState = this.initializeGameState();
  }

  private initializeGameState(): GameState {
    const pellets = this.initializePellets();
    const powerPellets = this.initializePowerPellets();
    
    return {
      player: {
        position: { x: 9, y: 15 }, // Starting position
        direction: Direction.NONE,
        nextDirection: Direction.NONE,
        isMoving: false
      },
      ghosts: this.initializeGhosts(),
      pellets,
      powerPellets,
      score: 0,
      level: 1,
      lives: 3,
      gameStatus: 'playing',
      powerModeTimer: 0,
      pelletsRemaining: this.countTotalPellets(pellets)
    };
  }

  private initializePellets(): boolean[][] {
    const pellets: boolean[][] = [];
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      pellets[y] = [];
      for (let x = 0; x < MAZE_WIDTH; x++) {
        pellets[y][x] = MAZE_LAYOUT[y][x] === CellType.PELLET;
      }
    }
    return pellets;
  }

  private initializePowerPellets(): Position[] {
    const powerPellets: Position[] = [];
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        if (MAZE_LAYOUT[y][x] === CellType.POWER_PELLET) {
          powerPellets.push({ x, y });
        }
      }
    }
    return powerPellets;
  }

  private initializeGhosts(): Ghost[] {
    return [
      {
        id: 'red',
        position: { x: 9, y: 9 },
        direction: Direction.UP,
        mode: 'scatter',
        color: '#FF0000',
        target: { x: 0, y: 0 },
        modeTimer: 7000
      },
      {
        id: 'pink',
        position: { x: 8, y: 9 },
        direction: Direction.UP,
        mode: 'scatter',
        color: '#FFB8FF',
        target: { x: 18, y: 0 },
        modeTimer: 7000
      },
      {
        id: 'cyan',
        position: { x: 10, y: 9 },
        direction: Direction.UP,
        mode: 'scatter',
        color: '#00FFFF',
        target: { x: 0, y: 18 },
        modeTimer: 7000
      },
      {
        id: 'orange',
        position: { x: 9, y: 10 },
        direction: Direction.UP,
        mode: 'scatter',
        color: '#FFB852',
        target: { x: 18, y: 18 },
        modeTimer: 7000
      }
    ];
  }

  private countTotalPellets(pellets: boolean[][]): number {
    let count = 0;
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        if (pellets[y][x]) count++;
      }
    }
    return count + this.gameState?.powerPellets?.length || 4;
  }

  public setPlayerDirection(direction: Direction): void {
    if (this.gameState.gameStatus === 'playing') {
      this.gameState.player.nextDirection = direction;
    }
  }

  public start(): void {
    if (this.gameState.gameStatus === 'paused') {
      this.gameState.gameStatus = 'playing';
      this.gameLoop();
    }
  }

  public pause(): void {
    this.gameState.gameStatus = 'paused';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public reset(): void {
    this.gameState = this.initializeGameState();
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  private gameLoop = (timestamp: number = 0): void => {
    if (this.gameState.gameStatus !== 'playing') return;

    if (timestamp - this.lastUpdateTime >= this.updateInterval) {
      this.update(timestamp);
      this.lastUpdateTime = timestamp;
    }

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  private update(timestamp: number): void {
    if (timestamp - this.lastMoveTime >= this.moveSpeed) {
      this.updatePlayer();
      this.updateGhosts();
      this.checkCollisions();
      this.updatePowerMode();
      this.checkWinCondition();
      this.lastMoveTime = timestamp;
    }
  }

  private updatePlayer(): void {
    const { player } = this.gameState;
    
    // Try to change direction if requested
    if (player.nextDirection !== Direction.NONE) {
      if (this.canMove(player.position, player.nextDirection)) {
        player.direction = player.nextDirection;
        player.nextDirection = Direction.NONE;
      }
    }

    // Move in current direction
    if (player.direction !== Direction.NONE && this.canMove(player.position, player.direction)) {
      const newPosition = this.getNextPosition(player.position, player.direction);
      player.position = newPosition;
      player.isMoving = true;

      // Handle tunnel wrapping
      if (newPosition.x < 0) {
        player.position.x = MAZE_WIDTH - 1;
      } else if (newPosition.x >= MAZE_WIDTH) {
        player.position.x = 0;
      }

      // Eat pellets
      if (this.gameState.pellets[player.position.y][player.position.x]) {
        this.gameState.pellets[player.position.y][player.position.x] = false;
        this.gameState.score += 10;
        this.gameState.pelletsRemaining--;
      }

      // Eat power pellets
      const powerPelletIndex = this.gameState.powerPellets.findIndex(
        p => p.x === player.position.x && p.y === player.position.y
      );
      if (powerPelletIndex !== -1) {
        this.gameState.powerPellets.splice(powerPelletIndex, 1);
        this.gameState.score += 50;
        this.gameState.pelletsRemaining--;
        this.activatePowerMode();
      }
    } else {
      player.isMoving = false;
    }
  }

  private updateGhosts(): void {
    this.gameState.ghosts.forEach(ghost => {
      // Update AI and movement logic here
      this.updateGhostAI(ghost);
      this.moveGhost(ghost);
    });
  }

  private updateGhostAI(ghost: Ghost): void {
    // Simple AI - more sophisticated AI can be added later
    const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
    const validDirections = directions.filter(dir => 
      this.canMove(ghost.position, dir) && this.getOppositeDirection(dir) !== ghost.direction
    );

    if (validDirections.length > 0) {
      ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
    }
  }

  private moveGhost(ghost: Ghost): void {
    if (this.canMove(ghost.position, ghost.direction)) {
      ghost.position = this.getNextPosition(ghost.position, ghost.direction);
    }
  }

  private activatePowerMode(): void {
    this.gameState.powerModeTimer = 8000; // 8 seconds
    this.gameState.ghosts.forEach(ghost => {
      if (ghost.mode !== 'eaten') {
        ghost.mode = 'frightened';
      }
    });
  }

  private updatePowerMode(): void {
    if (this.gameState.powerModeTimer > 0) {
      this.gameState.powerModeTimer -= this.updateInterval;
      if (this.gameState.powerModeTimer <= 0) {
        this.gameState.ghosts.forEach(ghost => {
          if (ghost.mode === 'frightened') {
            ghost.mode = 'chase';
          }
        });
      }
    }
  }

  private checkCollisions(): void {
    const { player, ghosts } = this.gameState;
    
    ghosts.forEach(ghost => {
      if (player.position.x === ghost.position.x && player.position.y === ghost.position.y) {
        if (ghost.mode === 'frightened') {
          // Eat ghost
          ghost.mode = 'eaten';
          this.gameState.score += 200;
        } else if (ghost.mode !== 'eaten') {
          // Player dies
          this.gameState.lives--;
          if (this.gameState.lives <= 0) {
            this.gameState.gameStatus = 'game-over';
          } else {
            this.resetPositions();
          }
        }
      }
    });
  }

  private checkWinCondition(): void {
    if (this.gameState.pelletsRemaining <= 0) {
      this.gameState.gameStatus = 'level-complete';
    }
  }

  private resetPositions(): void {
    // Reset player and ghost positions
    this.gameState.player.position = { x: 9, y: 15 };
    this.gameState.player.direction = Direction.NONE;
    this.gameState.ghosts = this.initializeGhosts();
  }

  private canMove(position: Position, direction: Direction): boolean {
    const nextPos = this.getNextPosition(position, direction);
    
    // Handle tunnel wrapping
    if (nextPos.x < 0 || nextPos.x >= MAZE_WIDTH) {
      return true;
    }
    
    if (nextPos.y < 0 || nextPos.y >= MAZE_HEIGHT) {
      return false;
    }

    return MAZE_LAYOUT[nextPos.y][nextPos.x] !== CellType.WALL;
  }

  private getNextPosition(position: Position, direction: Direction): Position {
    const moves = {
      [Direction.UP]: { x: 0, y: -1 },
      [Direction.DOWN]: { x: 0, y: 1 },
      [Direction.LEFT]: { x: -1, y: 0 },
      [Direction.RIGHT]: { x: 1, y: 0 },
      [Direction.NONE]: { x: 0, y: 0 }
    };

    const move = moves[direction];
    return {
      x: position.x + move.x,
      y: position.y + move.y
    };
  }

  private getOppositeDirection(direction: Direction): Direction {
    const opposites = {
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT,
      [Direction.NONE]: Direction.NONE
    };
    return opposites[direction];
  }

  public startGame(): void {
    this.gameState.gameStatus = 'playing';
    this.gameLoop();
  }

  public endGame(): GameState {
    this.gameState.gameStatus = 'game-over';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    return this.getGameState();
  }
}
