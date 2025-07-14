
import { TileType, isSpecialTile, getSpecialTileBonus } from './EnhancedTileTypes';
import { LevelConfig } from './LevelConfig';

export interface Position {
  row: number;
  col: number;
}

export interface Animation {
  type: 'clear' | 'fall' | 'spawn' | 'special';
  positions: Position[];
  duration: number;
}

export interface GameBoard {
  [row: number]: {
    [col: number]: TileType;
  };
}

export interface GameProgress {
  currentLevel: number;
  score: number;
  moves: number;
  objectives: Record<string, number>;
  clearedTiles: number;
  specialTilesCreated: number;
  cascades: number;
  comboMultiplier: number;
  targetScore: number;
  maxMoves: number;
  levelObjectives: {
    description: string;
    requirements: Array<{
      type: string;
      target: number;
      current: number;
    }>;
  };
}

export interface BoosterResult {
  success: boolean;
  newBoard?: GameBoard;
  animations?: Animation[];
  scoreIncrease?: number;
}

export interface MatchResult {
  boardChanged: boolean;
  newState?: Partial<{
    board: GameBoard;
    gameProgress: GameProgress;
    levelComplete: boolean;
    gameOver: boolean;
  }>;
  selectedTile?: Position | null;
  animations?: Animation[];
}

export class EnhancedGameEngine {
  private board: GameBoard;
  private gameProgress: GameProgress;
  private selectedTile: Position | null = null;
  private levelConfig: LevelConfig;
  private comboMultiplier: number = 1;

  constructor(levelConfig: LevelConfig) {
    this.levelConfig = levelConfig;
    this.board = this.generateInitialBoard();
    this.gameProgress = {
      currentLevel: levelConfig.level,
      score: 0,
      moves: levelConfig.moves,
      objectives: {},
      clearedTiles: 0,
      specialTilesCreated: 0,
      cascades: 0,
      comboMultiplier: 1,
      targetScore: levelConfig.requiredScore,
      maxMoves: levelConfig.moves,
      levelObjectives: {
        description: "Complete all objectives!",
        requirements: levelConfig.objectives.map(obj => ({
          type: obj.type,
          target: obj.target,
          current: 0
        }))
      }
    };
  }

  generateInitialBoard(): GameBoard {
    const board: GameBoard = {};
    const tileTypes = [TileType.POOP, TileType.TOILET, TileType.PAPER, TileType.PLUNGER, TileType.SOAP];
    
    for (let row = 0; row < 8; row++) {
      board[row] = {};
      for (let col = 0; col < 8; col++) {
        // Ensure no initial matches
        let tileType: TileType;
        do {
          tileType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
        } while (this.wouldCreateMatch(board, row, col, tileType));
        
        board[row][col] = tileType;
      }
    }
    
    return board;
  }

  private wouldCreateMatch(board: GameBoard, row: number, col: number, tileType: TileType): boolean {
    // Check horizontal matches
    if (col >= 2 && board[row] && board[row][col-1] === tileType && board[row][col-2] === tileType) {
      return true;
    }
    
    // Check vertical matches
    if (row >= 2 && board[row-1] && board[row-2] && board[row-1][col] === tileType && board[row-2][col] === tileType) {
      return true;
    }
    
    return false;
  }

  setGameState(board: GameBoard, gameProgress: GameProgress) {
    this.board = board;
    this.gameProgress = gameProgress;
  }

  handleTileClick(row: number, col: number): MatchResult {
    if (!this.selectedTile) {
      // First click - select tile
      this.selectedTile = { row, col };
      return {
        boardChanged: false,
        selectedTile: this.selectedTile
      };
    }

    // Check if clicking the same tile (deselect)
    if (this.selectedTile.row === row && this.selectedTile.col === col) {
      this.selectedTile = null;
      return {
        boardChanged: false,
        selectedTile: null
      };
    }

    // Check if tiles are adjacent
    const isAdjacent = this.areAdjacent(this.selectedTile, { row, col });
    
    if (!isAdjacent) {
      // Not adjacent, select new tile
      this.selectedTile = { row, col };
      return {
        boardChanged: false,
        selectedTile: this.selectedTile
      };
    }

    // Swap tiles and check for matches
    const result = this.swapTiles(this.selectedTile, { row, col });
    this.selectedTile = null;

    return result;
  }

  private areAdjacent(pos1: Position, pos2: Position): boolean {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  private swapTiles(pos1: Position, pos2: Position): MatchResult {
    // Swap tiles
    const temp = this.board[pos1.row][pos1.col];
    this.board[pos1.row][pos1.col] = this.board[pos2.row][pos2.col];
    this.board[pos2.row][pos2.col] = temp;

    // Check for matches
    const matches = this.findMatches();
    
    if (matches.length === 0) {
      // No matches, swap back
      const temp2 = this.board[pos1.row][pos1.col];
      this.board[pos1.row][pos1.col] = this.board[pos2.row][pos2.col];
      this.board[pos2.row][pos2.col] = temp2;
      
      return {
        boardChanged: false,
        selectedTile: null
      };
    }

    // Valid move, consume a move
    this.gameProgress.moves--;
    
    const processedResult = this.processBoard(this.board);
    
    return {
      boardChanged: true,
      newState: {
        board: processedResult.board,
        gameProgress: {
          ...this.gameProgress,
          score: this.gameProgress.score + processedResult.scoreIncrease
        },
        levelComplete: this.checkLevelComplete(),
        gameOver: this.checkGameOver()
      },
      animations: processedResult.animations
    };
  }

  processBoard(board: GameBoard): { board: GameBoard; scoreIncrease: number; animations: Animation[] } {
    let totalScore = 0;
    const allAnimations: Animation[] = [];
    let cascadeCount = 0;
    this.comboMultiplier = 1;
    
    let currentBoard = JSON.parse(JSON.stringify(board));
    
    while (true) {
      const matches = this.findMatches(currentBoard);
      if (matches.length === 0) break;
      
      // Calculate score for this cascade
      let cascadeScore = 0;
      
      // Clear matched tiles
      const clearPositions: Position[] = [];
      matches.forEach(match => {
        match.positions.forEach(pos => {
          const tileType = currentBoard[pos.row][pos.col];
          cascadeScore += this.getTileScore(tileType) * this.comboMultiplier;
          clearPositions.push(pos);
          currentBoard[pos.row][pos.col] = null;
        });
      });
      
      // Update objectives
      this.updateObjectives(matches, clearPositions.length);
      
      // Add clear animation
      allAnimations.push({
        type: 'clear',
        positions: clearPositions,
        duration: 300
      });
      
      // Apply gravity
      const fallAnimations = this.applyGravity(currentBoard);
      allAnimations.push(...fallAnimations);
      
      // Fill empty spaces
      const spawnAnimations = this.fillBoard(currentBoard);
      allAnimations.push(...spawnAnimations);
      
      totalScore += cascadeScore;
      cascadeCount++;
      this.comboMultiplier += 0.5; // Increase combo multiplier
    }
    
    // Update game progress
    this.gameProgress.cascades += cascadeCount;
    this.gameProgress.comboMultiplier = Math.max(this.gameProgress.comboMultiplier, this.comboMultiplier);
    
    console.log('🎯 [Process Board] Board processed:', {
      cascades: cascadeCount,
      scoreIncrease: totalScore,
      comboMultiplier: this.comboMultiplier
    });
    
    return {
      board: currentBoard,
      scoreIncrease: totalScore,
      animations: allAnimations
    };
  }

  private findMatches(board: GameBoard = this.board): Array<{positions: Position[], type: TileType}> {
    const matches: Array<{positions: Position[], type: TileType}> = [];
    const visited = new Set<string>();
    
    // Find horizontal matches
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 6; col++) {
        if (!board[row] || !board[row][col]) continue;
        
        const tileType = board[row][col];
        let count = 1;
        let endCol = col + 1;
        
        while (endCol < 8 && board[row][endCol] === tileType) {
          count++;
          endCol++;
        }
        
        if (count >= 3) {
          const positions: Position[] = [];
          for (let c = col; c < endCol; c++) {
            positions.push({ row, col: c });
          }
          matches.push({ positions, type: tileType });
        }
      }
    }
    
    // Find vertical matches
    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < 6; row++) {
        if (!board[row] || !board[row][col]) continue;
        
        const tileType = board[row][col];
        let count = 1;
        let endRow = row + 1;
        
        while (endRow < 8 && board[endRow] && board[endRow][col] === tileType) {
          count++;
          endRow++;
        }
        
        if (count >= 3) {
          const positions: Position[] = [];
          for (let r = row; r < endRow; r++) {
            positions.push({ row: r, col });
          }
          matches.push({ positions, type: tileType });
        }
      }
    }
    
    return matches;
  }

  private getTileScore(tileType: TileType): number {
    const baseScore = 10;
    const specialBonus = isSpecialTile(tileType) ? getSpecialTileBonus(tileType) : 0;
    return baseScore + specialBonus;
  }

  private updateObjectives(matches: Array<{positions: Position[], type: TileType}>, clearedCount: number) {
    console.log('🎯 [Update Objectives] Processing matches:', {
      matchCount: matches.length,
      clearedCount,
      currentObjectives: this.gameProgress.levelObjectives
    });
    
    this.gameProgress.clearedTiles += clearedCount;
    
    // Update objective requirements
    this.gameProgress.levelObjectives.requirements.forEach(req => {
      switch (req.type) {
        case 'score':
          req.current = this.gameProgress.score;
          break;
        case 'tiles':
          req.current = this.gameProgress.clearedTiles;
          break;
        case 'moves':
          req.current = this.gameProgress.maxMoves - this.gameProgress.moves;
          break;
        case 'cascades':
          req.current = this.gameProgress.cascades;
          break;
        case 'special':
          // Count special tiles in matches
          const specialCount = matches.reduce((count, match) => {
            return count + match.positions.filter(pos => isSpecialTile(match.type)).length;
          }, 0);
          req.current += specialCount;
          break;
      }
    });
    
    console.log('🎯 [Update Objectives] Updated objectives:', this.gameProgress.levelObjectives);
  }

  private applyGravity(board: GameBoard): Animation[] {
    const fallAnimations: Animation[] = [];
    
    for (let col = 0; col < 8; col++) {
      const fallPositions: Position[] = [];
      let writePos = 7;
      
      for (let row = 7; row >= 0; row--) {
        if (board[row] && board[row][col] !== null) {
          if (writePos !== row) {
            board[writePos][col] = board[row][col];
            board[row][col] = null;
            fallPositions.push({ row: writePos, col });
          }
          writePos--;
        }
      }
      
      if (fallPositions.length > 0) {
        fallAnimations.push({
          type: 'fall',
          positions: fallPositions,
          duration: 200
        });
      }
    }
    
    return fallAnimations;
  }

  private fillBoard(board: GameBoard): Animation[] {
    const spawnAnimations: Animation[] = [];
    const tileTypes = [TileType.POOP, TileType.TOILET, TileType.PAPER, TileType.PLUNGER, TileType.SOAP];
    
    for (let col = 0; col < 8; col++) {
      const spawnPositions: Position[] = [];
      
      for (let row = 0; row < 8; row++) {
        if (!board[row][col]) {
          let tileType: TileType;
          do {
            tileType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
          } while (this.wouldCreateMatch(board, row, col, tileType));
          
          board[row][col] = tileType;
          spawnPositions.push({ row, col });
        }
      }
      
      if (spawnPositions.length > 0) {
        spawnAnimations.push({
          type: 'spawn',
          positions: spawnPositions,
          duration: 200
        });
      }
    }
    
    return spawnAnimations;
  }

  private checkLevelComplete(): boolean {
    console.log('🎯 [Check Level Complete] Checking completion:', {
      currentLevel: this.gameProgress.currentLevel,
      score: this.gameProgress.score,
      targetScore: this.gameProgress.targetScore,
      moves: this.gameProgress.moves,
      objectives: this.gameProgress.levelObjectives
    });
    
    // Check if all objectives are met
    const allObjectivesMet = this.gameProgress.levelObjectives.requirements.every(req => {
      const met = req.current >= req.target;
      console.log(`🎯 [Check Level Complete] Objective ${req.type}: ${req.current}/${req.target} - ${met ? '✅' : '❌'}`);
      return met;
    });
    
    console.log('🎯 [Check Level Complete] All objectives met:', allObjectivesMet);
    
    return allObjectivesMet;
  }

  private checkGameOver(): boolean {
    const gameOver = this.gameProgress.moves <= 0 && !this.checkLevelComplete();
    console.log('🎯 [Check Game Over] Game over check:', {
      moves: this.gameProgress.moves,
      levelComplete: this.checkLevelComplete(),
      gameOver
    });
    return gameOver;
  }

  useBooster(type: string, targetTile?: Position): BoosterResult {
    console.log(`🔧 [Use Booster] Using ${type} booster`, targetTile);
    
    // For now, return a basic implementation
    return {
      success: false
    };
  }

  getCurrentBoard(): GameBoard {
    return this.board;
  }

  getCurrentProgress(): GameProgress {
    return this.gameProgress;
  }
}
