
export interface Position {
  x: number;
  y: number;
}

export interface GameConfig {
  CELL_SIZE: number;
  MAZE_WIDTH: number;
  MAZE_HEIGHT: number;
  GAME_SPEED: number;
  POWER_MODE_DURATION: number;
  SCATTER_DURATION: number;
  CHASE_DURATION: number;
}

export interface Ghost {
  id: string;
  position: Position;
  direction: Direction;
  nextDirection: Direction | null;
  mode: GhostMode;
  color: string;
  baseColor: string;
  target: Position;
  modeTimer: number;
  homeCorner: Position;
  isInHouse: boolean;
  exitDelay: number;
  stuckCounter: number;
  lastPositions: Position[];
}

export interface Player {
  position: Position;
  direction: Direction;
  nextDirection: Direction | null;
  isMoving: boolean;
  animationFrame: number;
}

export interface GameState {
  player: Player;
  ghosts: Ghost[];
  pellets: boolean[][];
  powerPellets: boolean[][];
  score: number;
  level: number;
  lives: number;
  gameStatus: GameStatus;
  powerMode: boolean;
  powerModeTimer: number;
  pelletsRemaining: number;
  gameTime: number;
  lastMoveTime: number;
  ghostEatenCount: number;
  modeTimer: number;
  currentMode: 'scatter' | 'chase';
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  NONE = 'NONE'
}

export enum GhostMode {
  CHASE = 'chase',
  SCATTER = 'scatter',
  FRIGHTENED = 'frightened',
  EATEN = 'eaten',
  IN_HOUSE = 'in_house',
  EXITING_HOUSE = 'exiting_house'
}

export enum GameStatus {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
  LEVEL_COMPLETE = 'level_complete'
}

export enum CellType {
  WALL = 1,           // Blue walls
  PELLET = 0,         // Regular pellets (yellow dots)
  POWER_PELLET = 2,   // Power pellets (💩)
  EMPTY = 3,          // Empty space (no pellet)
  GHOST_HOUSE = 4     // Ghost house area
}

export const GAME_CONFIG: GameConfig = {
  CELL_SIZE: 20,
  MAZE_WIDTH: 33,
  MAZE_HEIGHT: 23,
  GAME_SPEED: 120, // milliseconds per move
  POWER_MODE_DURATION: 3000, // 3 seconds
  SCATTER_DURATION: 7000, // 7 seconds
  CHASE_DURATION: 20000, // 20 seconds
};
