
import { TileType, TILE_TYPES } from "./TileTypes";

export class GameEngine {
  private board: TileType[][];
  private score: number;
  private boardSize: number;

  constructor(boardSize: number = 8) {
    this.boardSize = boardSize;
    this.board = [];
    this.score = 0;
    this.initializeBoard();
  }

  private initializeBoard(): void {
    this.board = this.generateInitialBoard();
  }

  public generateInitialBoard(): TileType[][] {
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
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  public makeMove(row1: number, col1: number, row2: number, col2: number): boolean {
    // Swap tiles
    this.swapTiles(row1, col1, row2, col2);
    
    // Check for matches
    const matches = this.findMatches();
    
    if (matches.length > 0) {
      // Process matches and cascade
      this.processMatches(matches);
      this.dropTiles();
      this.fillEmptySpaces();
      
      // Continue processing cascading matches
      this.processCascadingMatches();
      
      return true;
    } else {
      // No matches, revert swap
      this.swapTiles(row1, col1, row2, col2);
      return false;
    }
  }

  private swapTiles(row1: number, col1: number, row2: number, col2: number): void {
    const temp = this.board[row1][col1];
    this.board[row1][col1] = this.board[row2][col2];
    this.board[row2][col2] = temp;
  }

  private findMatches(): {row: number, col: number}[] {
    const matches: {row: number, col: number}[] = [];
    const checked: boolean[][] = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(false));

    // Check horizontal matches
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize - 2; col++) {
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

    // Check vertical matches
    for (let col = 0; col < this.boardSize; col++) {
      for (let row = 0; row < this.boardSize - 2; row++) {
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
    this.score += basePoints * matches.length + matchBonus;

    // Remove matched tiles (set to empty)
    matches.forEach(match => {
      this.board[match.row][match.col] = TileType.EMPTY;
    });
  }

  private dropTiles(): void {
    for (let col = 0; col < this.boardSize; col++) {
      let writeIndex = this.boardSize - 1;
      
      for (let row = this.boardSize - 1; row >= 0; row--) {
        if (this.board[row][col] !== TileType.EMPTY) {
          this.board[writeIndex][col] = this.board[row][col];
          if (writeIndex !== row) {
            this.board[row][col] = TileType.EMPTY;
          }
          writeIndex--;
        }
      }
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
        this.processMatches(matches);
        this.dropTiles();
        this.fillEmptySpaces();
      } else {
        hasMatches = false;
      }
    }
  }

  public getBoard(): TileType[][] {
    return this.board;
  }

  public getScore(): number {
    return this.score;
  }
}
