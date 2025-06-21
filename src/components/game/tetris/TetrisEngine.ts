
import { TetrisPiece, createEmptyBoard, getRandomPieceType, createPiece, rotatePiece, BOARD_WIDTH, BOARD_HEIGHT } from './TetrisPieces';

export interface TetrisGameState {
  board: number[][];
  currentPiece: TetrisPiece | null;
  nextPiece: TetrisPiece | null;
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export type GameSpeed = 'beginner' | 'moderate' | 'advanced';

const SPEED_SETTINGS = {
  beginner: { baseInterval: 1500, levelDecrease: 80 },
  moderate: { baseInterval: 1000, levelDecrease: 60 },
  advanced: { baseInterval: 600, levelDecrease: 40 }
};

export class TetrisEngine {
  private gameState: TetrisGameState;
  private dropTimer: number = 0;
  private dropInterval: number = 1000;
  private baseDropInterval: number = 1000;
  private levelDecrease: number = 60;
  private lastTime: number = 0;
  private animationId: number | null = null;
  private onStateChange?: (state: TetrisGameState) => void;
  private onGameOver?: (score: number, level: number, lines: number) => void;

  constructor() {
    this.gameState = this.createInitialState();
  }

  private createInitialState(): TetrisGameState {
    return {
      board: createEmptyBoard(),
      currentPiece: null,
      nextPiece: null,
      score: 0,
      level: 1,
      lines: 0,
      isGameOver: false,
      isPaused: false
    };
  }

  public setCallbacks(
    onStateChange: (state: TetrisGameState) => void,
    onGameOver: (score: number, level: number, lines: number) => void
  ) {
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
  }

  public start(speed: GameSpeed = 'moderate'): void {
    console.log("🎯 Starting Tetris game with speed:", speed);
    const speedSetting = SPEED_SETTINGS[speed];
    this.baseDropInterval = speedSetting.baseInterval;
    this.levelDecrease = speedSetting.levelDecrease;
    this.dropInterval = this.baseDropInterval;
    
    this.gameState = this.createInitialState();
    
    // Properly initialize both current and next pieces
    this.gameState.nextPiece = createPiece(getRandomPieceType());
    this.spawnNewPiece();
    
    this.dropTimer = 0;
    this.lastTime = performance.now();
    this.gameLoop();
    this.notifyStateChange();
  }

  public pause(): void {
    this.gameState.isPaused = !this.gameState.isPaused;
    if (!this.gameState.isPaused) {
      this.lastTime = performance.now();
      this.gameLoop();
    } else if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.notifyStateChange();
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public moveLeft(): void {
    if (this.gameState.currentPiece && !this.gameState.isPaused && !this.gameState.isGameOver) {
      const newPiece = { ...this.gameState.currentPiece, x: this.gameState.currentPiece.x - 1 };
      if (this.isValidPosition(newPiece)) {
        this.gameState.currentPiece = newPiece;
        this.notifyStateChange();
      }
    }
  }

  public moveRight(): void {
    if (this.gameState.currentPiece && !this.gameState.isPaused && !this.gameState.isGameOver) {
      const newPiece = { ...this.gameState.currentPiece, x: this.gameState.currentPiece.x + 1 };
      if (this.isValidPosition(newPiece)) {
        this.gameState.currentPiece = newPiece;
        this.notifyStateChange();
      }
    }
  }

  public moveDown(): void {
    if (this.gameState.currentPiece && !this.gameState.isPaused && !this.gameState.isGameOver) {
      const newPiece = { ...this.gameState.currentPiece, y: this.gameState.currentPiece.y + 1 };
      if (this.isValidPosition(newPiece)) {
        this.gameState.currentPiece = newPiece;
        this.notifyStateChange();
      } else {
        this.placePiece();
      }
    }
  }

  public rotate(): void {
    if (this.gameState.currentPiece && !this.gameState.isPaused && !this.gameState.isGameOver) {
      const rotatedPiece = rotatePiece(this.gameState.currentPiece);
      if (this.isValidPosition(rotatedPiece)) {
        this.gameState.currentPiece = rotatedPiece;
        this.notifyStateChange();
      }
    }
  }

  public drop(): void {
    if (this.gameState.currentPiece && !this.gameState.isPaused && !this.gameState.isGameOver) {
      while (this.isValidPosition({ ...this.gameState.currentPiece, y: this.gameState.currentPiece.y + 1 })) {
        this.gameState.currentPiece.y++;
      }
      this.placePiece();
      this.notifyStateChange();
    }
  }

  private gameLoop(): void {
    if (this.gameState.isPaused || this.gameState.isGameOver) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.dropTimer += deltaTime;
    
    if (this.dropTimer >= this.dropInterval) {
      this.automaticDrop();
      this.dropTimer = 0;
    }

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private automaticDrop(): void {
    if (!this.gameState.currentPiece) return;

    const newPiece = { ...this.gameState.currentPiece, y: this.gameState.currentPiece.y + 1 };
    
    if (this.isValidPosition(newPiece)) {
      this.gameState.currentPiece = newPiece;
    } else {
      this.placePiece();
    }
    
    this.notifyStateChange();
  }

  private isValidPosition(piece: TetrisPiece): boolean {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = piece.x + x;
          const boardY = piece.y + y;

          if (boardX < 0 || boardX >= BOARD_WIDTH || 
              boardY >= BOARD_HEIGHT || 
              (boardY >= 0 && this.gameState.board[boardY][boardX])) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private placePiece(): void {
    if (!this.gameState.currentPiece) return;

    console.log("🔧 Placing piece, current score:", this.gameState.score, "lines:", this.gameState.lines);

    // Place piece on board
    for (let y = 0; y < this.gameState.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.gameState.currentPiece.shape[y].length; x++) {
        if (this.gameState.currentPiece.shape[y][x]) {
          const boardY = this.gameState.currentPiece.y + y;
          const boardX = this.gameState.currentPiece.x + x;
          if (boardY >= 0) {
            this.gameState.board[boardY][boardX] = 1;
          }
        }
      }
    }

    // Clear completed lines
    const linesCleared = this.clearLines();
    console.log("🧹 Lines cleared:", linesCleared);
    
    // Update score and level
    this.updateScore(linesCleared);
    console.log("📊 After update - score:", this.gameState.score, "lines:", this.gameState.lines, "level:", this.gameState.level);
    
    // Spawn next piece
    this.spawnNewPiece();

    // Check game over
    if (this.gameState.currentPiece && !this.isValidPosition(this.gameState.currentPiece)) {
      this.gameState.isGameOver = true;
      this.stop();
      console.log("🏁 Game Over! Final score:", this.gameState.score, "lines:", this.gameState.lines);
      this.onGameOver?.(this.gameState.score, this.gameState.level, this.gameState.lines);
    }
  }

  private clearLines(): number {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.gameState.board[y].every(cell => cell !== 0)) {
        // Remove the completed line
        this.gameState.board.splice(y, 1);
        // Add new empty line at top
        this.gameState.board.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        y++; // Check same row again since we removed a line
      }
    }
    
    return linesCleared;
  }

  private updateScore(linesCleared: number): void {
    if (linesCleared > 0) {
      // Tetris scoring system
      const linePoints = [0, 40, 100, 300, 1200];
      const points = linePoints[Math.min(linesCleared, 4)] * this.gameState.level;
      
      this.gameState.score += points;
      this.gameState.lines += linesCleared;
      
      console.log("💯 Score update - added:", points, "total score:", this.gameState.score, "total lines:", this.gameState.lines);
      
      // Level up every 10 lines
      const newLevel = Math.floor(this.gameState.lines / 10) + 1;
      if (newLevel > this.gameState.level) {
        this.gameState.level = newLevel;
        // Increase drop speed
        this.dropInterval = Math.max(50, this.baseDropInterval - (this.gameState.level - 1) * this.levelDecrease);
        console.log("🆙 Level up! New level:", this.gameState.level, "new drop interval:", this.dropInterval);
      }
    }
  }

  private spawnNewPiece(): void {
    console.log("🚀 Spawning new piece. Current piece type:", this.gameState.currentPiece?.type, "Next piece type:", this.gameState.nextPiece?.type);
    
    // Move next piece to current
    this.gameState.currentPiece = this.gameState.nextPiece;
    
    // Generate new next piece
    this.gameState.nextPiece = createPiece(getRandomPieceType());
    
    console.log("✅ New pieces set. Current piece type:", this.gameState.currentPiece?.type, "Next piece type:", this.gameState.nextPiece?.type);
  }

  private notifyStateChange(): void {
    console.log("🔄 State change notification - score:", this.gameState.score, "lines:", this.gameState.lines, "level:", this.gameState.level);
    this.onStateChange?.(this.gameState);
  }

  public getState(): TetrisGameState {
    return { ...this.gameState };
  }
}
