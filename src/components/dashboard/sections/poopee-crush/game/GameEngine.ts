
import { TileType, TILE_TYPES } from "./TileTypes";

export interface AnimationEvent {
  type: 'match' | 'drop' | 'swap' | 'invalid';
  tiles?: {row: number, col: number}[];
  fromTile?: {row: number, col: number};
  toTile?: {row: number, col: number};
  id: string;
}

export class GameEngine {
  private board: TileType[][];
  private score: number;
  private boardSize: number;
  private animationQueue: AnimationEvent[] = [];
  private currentAnimationId = 0;

  constructor(boardSize: number = 8) {
    this.boardSize = boardSize;
    this.board = [];
    this.score = 0;
    // Don't auto-initialize - let the calling code manage this
  }

  // Set the board from external state (for resuming games)
  public setBoard(board: TileType[][]): void {
    console.log("🎮 GameEngine: Setting board from external state");
    this.board = board.map(row => [...row]); // Deep copy
    console.log("🎮 GameEngine: Board set, size:", this.board.length, "x", this.board[0]?.length);
  }

  // Set the score from external state (for resuming games)
  public setScore(score: number): void {
    console.log("🎮 GameEngine: Setting score to", score);
    this.score = score;
  }

  public generateInitialBoard(): TileType[][] {
    console.log("🎮 GameEngine: Generating new initial board");
    const board: TileType[][] = [];
    
    // Generate random board
    for (let row = 0; row < this.boardSize; row++) {
      board[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        board[row][col] = this.getRandomTileType();
      }
    }

    // Ensure no initial matches
    this.removeInitialMatches(board);
    
    // Set this as our internal board
    this.board = board.map(row => [...row]); // Deep copy
    console.log("🎮 GameEngine: Initial board generated and set");
    
    return board;
  }

  private getRandomTileType(): TileType {
    return TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
  }

  private removeInitialMatches(board: TileType[][]): void {
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        // Check horizontal matches
        if (col >= 2 && 
            board[row][col] === board[row][col-1] && 
            board[row][col] === board[row][col-2]) {
          board[row][col] = this.getDifferentTileType(board[row][col]);
        }
        
        // Check vertical matches
        if (row >= 2 && 
            board[row][col] === board[row-1][col] && 
            board[row][col] === board[row-2][col]) {
          board[row][col] = this.getDifferentTileType(board[row][col]);
        }
      }
    }
  }

  private getDifferentTileType(currentType: TileType): TileType {
    let newType: TileType;
    do {
      newType = this.getRandomTileType();
    } while (newType === currentType);
    return newType;
  }

  public areAdjacent(row1: number, col1: number, row2: number, col2: number): boolean {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    const isAdjacent = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    console.log(`🎮 Checking adjacency: (${row1},${col1}) -> (${row2},${col2}): ${isAdjacent}`);
    return isAdjacent;
  }

  public makeMove(row1: number, col1: number, row2: number, col2: number): boolean {
    console.log(`🎮 GameEngine: Attempting move: (${row1},${col1}) -> (${row2},${col2})`);
    console.log(`🎮 Current board state:`, this.board.map(row => row.join(' ')));
    
    // Validate coordinates
    if (!this.isValidPosition(row1, col1) || !this.isValidPosition(row2, col2)) {
      console.log(`❌ Invalid coordinates`);
      return false;
    }
    
    // Add swap animation
    this.addAnimation({
      type: 'swap',
      fromTile: {row: row1, col: col1},
      toTile: {row: row2, col: col2},
      id: `swap-${this.currentAnimationId++}`
    });

    // Swap tiles
    this.swapTiles(row1, col1, row2, col2);
    console.log(`🔄 Tiles swapped, new board:`, this.board.map(row => row.join(' ')));
    
    // Check for matches
    const matches = this.findMatches();
    console.log(`🔍 Found ${matches.length} matches:`, matches);
    
    if (matches.length > 0) {
      // Add match animation
      this.addAnimation({
        type: 'match',
        tiles: matches,
        id: `match-${this.currentAnimationId++}`
      });

      // Process matches and cascade
      this.processMatches(matches);
      this.dropTiles();
      this.fillEmptySpaces();
      
      // Continue processing cascading matches
      this.processCascadingMatches();
      
      console.log(`✅ Move successful! New score: ${this.score}`);
      return true;
    } else {
      // No matches, revert swap and add invalid animation
      console.log(`❌ No matches found, reverting swap`);
      this.swapTiles(row1, col1, row2, col2);
      this.addAnimation({
        type: 'invalid',
        fromTile: {row: row1, col: col1},
        toTile: {row: row2, col: col2},
        id: `invalid-${this.currentAnimationId++}`
      });
      return false;
    }
  }

  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
  }

  private addAnimation(animation: AnimationEvent): void {
    this.animationQueue.push(animation);
  }

  public getAnimations(): AnimationEvent[] {
    const animations = [...this.animationQueue];
    this.animationQueue = [];
    return animations;
  }

  private swapTiles(row1: number, col1: number, row2: number, col2: number): void {
    const temp = this.board[row1][col1];
    this.board[row1][col1] = this.board[row2][col2];
    this.board[row2][col2] = temp;
    console.log(`🔄 Swapped (${row1},${col1}) with (${row2},${col2})`);
  }

  private findMatches(): {row: number, col: number}[] {
    const matches: {row: number, col: number}[] = [];
    const checked: boolean[][] = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(false));

    // Check horizontal matches (3 or more)
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize - 2; col++) {
        const currentTile = this.board[row][col];
        if (currentTile === TileType.EMPTY) continue;
        
        if (this.board[row][col] === this.board[row][col + 1] && 
            this.board[row][col] === this.board[row][col + 2]) {
          
          let matchLength = 3;
          while (col + matchLength < this.boardSize && 
                 this.board[row][col] === this.board[row][col + matchLength]) {
            matchLength++;
          }
          
          for (let i = 0; i < matchLength; i++) {
            if (!checked[row][col + i]) {
              matches.push({row, col: col + i});
              checked[row][col + i] = true;
            }
          }
        }
      }
    }

    // Check vertical matches (3 or more)
    for (let col = 0; col < this.boardSize; col++) {
      for (let row = 0; row < this.boardSize - 2; row++) {
        const currentTile = this.board[row][col];
        if (currentTile === TileType.EMPTY) continue;
        
        if (this.board[row][col] === this.board[row + 1][col] && 
            this.board[row][col] === this.board[row + 2][col]) {
          
          let matchLength = 3;
          while (row + matchLength < this.boardSize && 
                 this.board[row][col] === this.board[row + matchLength][col]) {
            matchLength++;
          }
          
          for (let i = 0; i < matchLength; i++) {
            if (!checked[row + i][col]) {
              matches.push({row: row + i, col});
              checked[row + i][col] = true;
            }
          }
        }
      }
    }

    return matches;
  }

  private processMatches(matches: {row: number, col: number}[]): void {
    // Award points based on match count
    const basePoints = 100;
    const matchBonus = matches.length > 3 ? (matches.length - 3) * 50 : 0;
    const scoreIncrease = basePoints * matches.length + matchBonus;
    this.score += scoreIncrease;

    console.log(`💰 Score increased by ${scoreIncrease} (${matches.length} tiles matched)`);

    // Remove matched tiles (set to empty)
    matches.forEach(match => {
      this.board[match.row][match.col] = TileType.EMPTY;
    });
  }

  private dropTiles(): void {
    const droppedTiles: {row: number, col: number}[] = [];
    
    for (let col = 0; col < this.boardSize; col++) {
      let writeIndex = this.boardSize - 1;
      
      for (let row = this.boardSize - 1; row >= 0; row--) {
        if (this.board[row][col] !== TileType.EMPTY) {
          if (writeIndex !== row) {
            this.board[writeIndex][col] = this.board[row][col];
            this.board[row][col] = TileType.EMPTY;
            droppedTiles.push({row: writeIndex, col});
          }
          writeIndex--;
        }
      }
    }

    // Add drop animation if tiles moved
    if (droppedTiles.length > 0) {
      this.addAnimation({
        type: 'drop',
        tiles: droppedTiles,
        id: `drop-${this.currentAnimationId++}`
      });
    }
  }

  private fillEmptySpaces(): void {
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.board[row][col] === TileType.EMPTY) {
          this.board[row][col] = this.getRandomTileType();
        }
      }
    }
  }

  private processCascadingMatches(): void {
    let hasMatches = true;
    while (hasMatches) {
      const matches = this.findMatches();
      if (matches.length > 0) {
        console.log(`🔄 Cascading matches found: ${matches.length}`);
        
        this.addAnimation({
          type: 'match',
          tiles: matches,
          id: `cascade-${this.currentAnimationId++}`
        });
        
        this.processMatches(matches);
        this.dropTiles();
        this.fillEmptySpaces();
      } else {
        hasMatches = false;
      }
    }
  }

  public getBoard(): TileType[][] {
    // Return a deep copy to prevent external mutations
    return this.board.map(row => [...row]);
  }

  public getScore(): number {
    return this.score;
  }
}
