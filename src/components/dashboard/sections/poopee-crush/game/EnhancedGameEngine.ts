import { TileType, BASIC_TILE_TYPES, isSpecialTile, isBasicTile, MatchResult, PowerUpEffect } from "./EnhancedTileTypes";
import { LevelConfig, getLevelConfig } from "./LevelConfig";
import { BoosterManager, BoosterType } from "./BoosterSystem";

// Export these types for use in other files
export type GameBoard = TileType[][];
export interface Position {
  row: number;
  col: number;
}

export interface Animation {
  type: 'match' | 'drop' | 'swap' | 'invalid' | 'special_effect' | 'cascade' | 'level_complete' | 'clear';
  tiles?: Position[];
  fromTile?: Position;
  toTile?: Position;
  specialEffect?: PowerUpEffect;
  cascadeMultiplier?: number;
  id: string;
}

export interface AnimationEvent {
  type: 'match' | 'drop' | 'swap' | 'invalid' | 'special_effect' | 'cascade' | 'level_complete' | 'clear';
  tiles?: {row: number, col: number}[];
  fromTile?: {row: number, col: number};
  toTile?: {row: number, col: number};
  specialEffect?: PowerUpEffect;
  cascadeMultiplier?: number;
  id: string;
}

export interface GameProgress {
  currentLevel: number;
  score: number;
  moves: number;
  objectives: {[key: string]: number}; // objective type -> current progress
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
  newBoard?: TileType[][];
  animations?: Animation[];
}

export class EnhancedGameEngine {
  private board: TileType[][];
  private score: number;
  private boardSize: number;
  private animationQueue: AnimationEvent[] = [];
  private currentAnimationId = 0;
  private gameProgress: GameProgress;
  private levelConfig: LevelConfig;
  private boosterManager: BoosterManager;
  private hintTiles: {row: number, col: number}[] = [];
  private selectedTile: Position | null = null;

  constructor(levelConfig?: LevelConfig, boardSize: number = 8) {
    this.boardSize = boardSize;
    this.board = [];
    this.score = 0;
    this.boosterManager = new BoosterManager();
    this.levelConfig = levelConfig || getLevelConfig(1);
    this.gameProgress = {
      currentLevel: 1,
      score: 0,
      moves: this.levelConfig.moves || 20,
      objectives: {},
      clearedTiles: 0,
      specialTilesCreated: 0,
      cascades: 0,
      comboMultiplier: 1,
      targetScore: this.levelConfig.requiredScore || 1000,
      maxMoves: this.levelConfig.moves || 20,
      levelObjectives: {
        description: "Reach the target score!",
        requirements: [
          { type: 'score', target: this.levelConfig.requiredScore || 1000, current: 0 }
        ]
      }
    };
  }

  // New method: Generate initial board
  public generateInitialBoard(): TileType[][] {
    const board = this.generateLevelBoard();
    this.board = board.map(row => [...row]);
    return board;
  }

  // New method: Handle tile click (wrapper for makeMove logic)
  public handleTileClick(row: number, col: number): {
    boardChanged: boolean;
    newState?: Partial<any>;
    selectedTile?: Position | null;
    animations?: Animation[];
  } {
    console.log(`🎮 Enhanced GameEngine: Tile clicked at (${row}, ${col})`);
    
    if (!this.isValidPosition(row, col) || this.board[row][col] === TileType.BLOCKED) {
      return {
        boardChanged: false,
        selectedTile: this.selectedTile,
        animations: []
      };
    }

    // If no tile is selected, select this tile
    if (!this.selectedTile) {
      this.selectedTile = { row, col };
      return {
        boardChanged: false,
        selectedTile: this.selectedTile,
        animations: []
      };
    }

    // If same tile clicked, deselect
    if (this.selectedTile.row === row && this.selectedTile.col === col) {
      this.selectedTile = null;
      return {
        boardChanged: false,
        selectedTile: null,
        animations: []
      };
    }

    // Try to make a move
    const moveSuccessful = this.makeMove(this.selectedTile.row, this.selectedTile.col, row, col);
    const animations = this.getAnimations().map(this.convertAnimationEventToAnimation);
    
    if (moveSuccessful) {
      const newState = {
        board: this.getBoard(),
        gameProgress: this.getGameProgress(),
        levelComplete: this.checkLevelComplete(),
        gameOver: this.isGameOver()
      };
      
      this.selectedTile = null;
      return {
        boardChanged: true,
        newState,
        selectedTile: null,
        animations
      };
    } else {
      // Move failed, keep selection or clear based on adjacency
      const areAdjacent = this.areAdjacent(this.selectedTile.row, this.selectedTile.col, row, col);
      this.selectedTile = areAdjacent ? null : { row, col };
      
      return {
        boardChanged: false,
        selectedTile: this.selectedTile,
        animations
      };
    }
  }

  private convertAnimationEventToAnimation = (event: AnimationEvent): Animation => {
    return {
      type: event.type,
      tiles: event.tiles?.map(t => ({ row: t.row, col: t.col })),
      fromTile: event.fromTile ? { row: event.fromTile.row, col: event.fromTile.col } : undefined,
      toTile: event.toTile ? { row: event.toTile.row, col: event.toTile.col } : undefined,
      specialEffect: event.specialEffect,
      cascadeMultiplier: event.cascadeMultiplier,
      id: event.id
    };
  };

  // New method: Process board after changes
  public processBoard(board: TileType[][]): {
    board: TileType[][];
    scoreIncrease: number;
  } {
    this.board = board.map(row => [...row]);
    
    // Process matches and cascades
    this.processCascadingMatches();
    this.dropTiles();
    this.fillEmptySpaces();
    
    const scoreIncrease = this.score - this.gameProgress.score;
    this.gameProgress.score = this.score;
    
    return {
      board: this.getBoard(),
      scoreIncrease
    };
  }

  // New method: Set game state
  public setGameState(board: TileType[][], gameProgress: GameProgress): void {
    this.board = board.map(row => [...row]);
    this.gameProgress = { ...gameProgress };
    this.score = gameProgress.score;
  }

  public startNewLevel(level: number = 1): TileType[][] {
    console.log("🎮 Enhanced GameEngine: Starting level", level);
    this.levelConfig = getLevelConfig(level);
    this.gameProgress = {
      currentLevel: level,
      score: this.score, // Keep accumulated score
      moves: this.levelConfig.moves,
      objectives: {},
      clearedTiles: 0,
      specialTilesCreated: 0,
      cascades: 0,
      comboMultiplier: 1,
      targetScore: this.levelConfig.requiredScore,
      maxMoves: this.levelConfig.moves,
      levelObjectives: {
        description: "Complete all objectives!",
        requirements: this.levelConfig.objectives.map(obj => ({
          type: obj.type,
          target: obj.target,
          current: 0
        }))
      }
    };
    this.boosterManager.resetForNewLevel();
    this.hintTiles = [];
    
    const board = this.generateLevelBoard();
    this.board = board.map(row => [...row]);
    console.log("🎮 Enhanced GameEngine: Level", level, "board generated");
    return board;
  }

  private generateLevelBoard(): TileType[][] {
    const board: TileType[][] = [];
    const availableTypes = BASIC_TILE_TYPES.slice(0, this.levelConfig.availableTileTypes);
    
    // Generate random board
    for (let row = 0; row < this.boardSize; row++) {
      board[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        // Check for blocked positions
        const isBlocked = this.levelConfig.blockedPositions?.some(
          pos => pos.row === row && pos.col === col
        );
        
        if (isBlocked) {
          board[row][col] = TileType.BLOCKED;
        } else {
          board[row][col] = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        }
      }
    }

    // Remove initial matches
    this.removeInitialMatches(board);
    
    // Add special tiles based on spawn rate
    this.addInitialSpecialTiles(board);
    
    return board;
  }

  private removeInitialMatches(board: TileType[][]): void {
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (board[row][col] === TileType.BLOCKED) continue;
        
        // Check horizontal matches
        if (col >= 2 && 
            board[row][col] === board[row][col-1] && 
            board[row][col] === board[row][col-2] &&
            isBasicTile(board[row][col])) {
          board[row][col] = this.getDifferentTileType(board[row][col]);
        }
        
        // Check vertical matches
        if (row >= 2 && 
            board[row][col] === board[row-1][col] && 
            board[row][col] === board[row-2][col] &&
            isBasicTile(board[row][col])) {
          board[row][col] = this.getDifferentTileType(board[row][col]);
        }
      }
    }
  }

  private addInitialSpecialTiles(board: TileType[][]): void {
    const specialTileCount = Math.floor(this.boardSize * this.boardSize * this.levelConfig.specialTileSpawnRate);
    
    for (let i = 0; i < specialTileCount; i++) {
      const row = Math.floor(Math.random() * this.boardSize);
      const col = Math.floor(Math.random() * this.boardSize);
      
      if (board[row][col] !== TileType.BLOCKED && isBasicTile(board[row][col])) {
        // Create random special tile
        const specialTypes = [TileType.STRIPED_HORIZONTAL, TileType.STRIPED_VERTICAL, TileType.WRAPPED];
        board[row][col] = specialTypes[Math.floor(Math.random() * specialTypes.length)];
      }
    }
  }

  private getDifferentTileType(currentType: TileType): TileType {
    const availableTypes = BASIC_TILE_TYPES.slice(0, this.levelConfig.availableTileTypes);
    let newType: TileType;
    do {
      newType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    } while (newType === currentType);
    return newType;
  }

  public makeMove(row1: number, col1: number, row2: number, col2: number): boolean {
    console.log(`🎮 Enhanced GameEngine: Attempting move: (${row1},${col1}) -> (${row2},${col2})`);
    
    // CRITICAL FIX: Validate coordinates, blocked tiles, and ADJACENCY
    if (!this.isValidPosition(row1, col1) || !this.isValidPosition(row2, col2)) {
      console.log(`❌ Invalid coordinates`);
      return false;
    }
    
    if (this.board[row1][col1] === TileType.BLOCKED || this.board[row2][col2] === TileType.BLOCKED) {
      console.log(`❌ Cannot move blocked tiles`);
      return false;
    }

    // CRITICAL FIX: Enforce adjacency for ALL moves, including special tiles
    if (!this.areAdjacent(row1, col1, row2, col2)) {
      console.log(`❌ Tiles must be adjacent for swapping`);
      this.addAnimation({
        type: 'invalid',
        fromTile: {row: row1, col: col1},
        toTile: {row: row2, col: col2},
        id: `invalid-${this.currentAnimationId++}`
      });
      return false;
    }
    
    // Add swap animation
    this.addAnimation({
      type: 'swap',
      fromTile: {row: row1, col: col1},
      toTile: {row: row2, col: col2},
      id: `swap-${this.currentAnimationId++}`
    });

    // Check if either tile is a special tile - handle activation
    const tile1 = this.board[row1][col1];
    const tile2 = this.board[row2][col2];
    
    if (isSpecialTile(tile1) || isSpecialTile(tile2)) {
      return this.handleSpecialTileActivation(row1, col1, row2, col2);
    }

    // Regular tile swap
    this.swapTiles(row1, col1, row2, col2);
    
    // Check for matches
    const matches = this.findEnhancedMatches();
    
    if (matches.length > 0) {
      this.gameProgress.moves--;
      this.processEnhancedMatches(matches);
      this.dropTiles();
      this.fillEmptySpaces();
      this.processCascadingMatches();
      this.updateObjectives();
      
      console.log(`✅ Move successful! Score: ${this.score}, Moves: ${this.gameProgress.moves}`);
      return true;
    } else {
      // No matches, revert swap
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

  private handleSpecialTileActivation(row1: number, col1: number, row2: number, col2: number): boolean {
    const tile1 = this.board[row1][col1];
    const tile2 = this.board[row2][col2];
    
    this.gameProgress.moves--;
    
    // Handle special tile combinations
    if (isSpecialTile(tile1) && isSpecialTile(tile2)) {
      this.handleSpecialTileCombination(row1, col1, row2, col2);
    } else if (isSpecialTile(tile1)) {
      this.activateSpecialTile(tile1, row1, col1, tile2);
    } else if (isSpecialTile(tile2)) {
      this.activateSpecialTile(tile2, row2, col2, tile1);
    }
    
    this.dropTiles();
    this.fillEmptySpaces();
    this.processCascadingMatches();
    this.updateObjectives();
    
    return true;
  }

  private handleSpecialTileCombination(row1: number, col1: number, row2: number, col2: number): void {
    const tile1 = this.board[row1][col1];
    const tile2 = this.board[row2][col2];
    
    console.log(`✨ Special tile combination: ${tile1} + ${tile2}`);
    
    // Clear both special tiles
    this.board[row1][col1] = TileType.EMPTY;
    this.board[row2][col2] = TileType.EMPTY;
    
    if (tile1 === TileType.COLOR_BOMB || tile2 === TileType.COLOR_BOMB) {
      // Color bomb combinations
      if (tile1 === TileType.COLOR_BOMB && tile2 === TileType.COLOR_BOMB) {
        // Two color bombs - clear entire board
        this.clearEntireBoard();
      } else {
        // Color bomb + other special - convert all tiles of most common type to the special type
        const otherTile = tile1 === TileType.COLOR_BOMB ? tile2 : tile1;
        this.colorBombSpecialCombination(otherTile);
      }
    } else if ((tile1 === TileType.STRIPED_HORIZONTAL || tile1 === TileType.STRIPED_VERTICAL) &&
               (tile2 === TileType.STRIPED_HORIZONTAL || tile2 === TileType.STRIPED_VERTICAL)) {
      // Two striped tiles - clear entire row AND column
      this.clearRowAndColumn(row1, col1);
    } else if (tile1 === TileType.WRAPPED || tile2 === TileType.WRAPPED) {
      // Wrapped + striped - clear 3 rows or 3 columns
      const isHorizontal = tile1 === TileType.STRIPED_HORIZONTAL || tile2 === TileType.STRIPED_HORIZONTAL;
      this.wrappedStripedCombination(row1, col1, isHorizontal);
    }
    
    // FIXED SCORING: Much lower combination bonus
    this.score += 10 * this.gameProgress.comboMultiplier;
    this.gameProgress.score = this.score;
  }

  private activateSpecialTile(specialTile: TileType, row: number, col: number, targetTile?: TileType): void {
    console.log(`🎯 Activating special tile: ${specialTile} at (${row}, ${col})`);
    
    this.board[row][col] = TileType.EMPTY;
    
    switch (specialTile) {
      case TileType.STRIPED_HORIZONTAL:
        this.clearRow(row);
        break;
      case TileType.STRIPED_VERTICAL:
        this.clearColumn(col);
        break;
      case TileType.WRAPPED:
        this.wrappedExplosion(row, col);
        break;
      case TileType.COLOR_BOMB:
        if (targetTile && isBasicTile(targetTile)) {
          this.colorBombActivation(targetTile);
        } else {
          this.colorBombActivation(this.findMostCommonTile());
        }
        break;
    }
  }

  private clearRow(row: number): void {
    let clearedCount = 0;
    for (let col = 0; col < this.boardSize; col++) {
      if (this.board[row][col] !== TileType.BLOCKED) {
        this.board[row][col] = TileType.EMPTY;
        this.gameProgress.clearedTiles++;
        clearedCount++;
      }
    }
    // FIXED SCORING: Much lower per-tile bonus
    this.score += clearedCount * 5 * this.gameProgress.comboMultiplier;
    this.gameProgress.score = this.score;
  }

  private clearColumn(col: number): void {
    let clearedCount = 0;
    for (let row = 0; row < this.boardSize; row++) {
      if (this.board[row][col] !== TileType.BLOCKED) {
        this.board[row][col] = TileType.EMPTY;
        this.gameProgress.clearedTiles++;
        clearedCount++;
      }
    }
    // FIXED SCORING: Much lower per-tile bonus
    this.score += clearedCount * 5 * this.gameProgress.comboMultiplier;
    this.gameProgress.score = this.score;
  }

  private clearRowAndColumn(row: number, col: number): void {
    this.clearRow(row);
    this.clearColumn(col);
    this.score += 15; // Small bonus for combination
  }

  private wrappedExplosion(centerRow: number, centerCol: number): void {
    const affected: {row: number, col: number}[] = [];
    
    for (let r = Math.max(0, centerRow - 1); r <= Math.min(this.boardSize - 1, centerRow + 1); r++) {
      for (let c = Math.max(0, centerCol - 1); c <= Math.min(this.boardSize - 1, centerCol + 1); c++) {
        if (this.board[r][c] !== TileType.BLOCKED) {
          this.board[r][c] = TileType.EMPTY;
          this.gameProgress.clearedTiles++;
          affected.push({row: r, col: c});
        }
      }
    }
    
    // FIXED SCORING: Much lower per-tile bonus
    this.score += affected.length * 3 * this.gameProgress.comboMultiplier;
    this.gameProgress.score = this.score;
  }

  private wrappedStripedCombination(row: number, col: number, isHorizontal: boolean): void {
    if (isHorizontal) {
      // Clear 3 rows
      for (let r = Math.max(0, row - 1); r <= Math.min(this.boardSize - 1, row + 1); r++) {
        this.clearRow(r);
      }
    } else {
      // Clear 3 columns
      for (let c = Math.max(0, col - 1); c <= Math.min(this.boardSize - 1, col + 1); c++) {
        this.clearColumn(c);
      }
    }
  }

  private colorBombActivation(targetTileType: TileType): void {
    let clearedCount = 0;
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.board[row][col] === targetTileType) {
          this.board[row][col] = TileType.EMPTY;
          this.gameProgress.clearedTiles++;
          clearedCount++;
        }
      }
    }
    // FIXED SCORING: Much lower per-tile bonus
    this.score += clearedCount * 7 * this.gameProgress.comboMultiplier;
    this.gameProgress.score = this.score;
  }

  private colorBombSpecialCombination(specialTileType: TileType): void {
    const targetTileType = this.findMostCommonTile();
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.board[row][col] === targetTileType) {
          this.board[row][col] = specialTileType;
        }
      }
    }
  }

  private clearEntireBoard(): void {
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.board[row][col] !== TileType.BLOCKED) {
          this.board[row][col] = TileType.EMPTY;
          this.gameProgress.clearedTiles++;
        }
      }
    }
    // FIXED SCORING: Much lower board-clear bonus
    this.score += 50;
    this.gameProgress.score = this.score;
  }

  private findEnhancedMatches(): MatchResult[] {
    const matches: MatchResult[] = [];
    const checked: boolean[][] = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(false));

    // Find all basic matches first
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (checked[row][col] || !isBasicTile(this.board[row][col])) continue;
        
        const horizontalMatch = this.findHorizontalMatch(row, col, checked);
        if (horizontalMatch) matches.push(horizontalMatch);
        
        const verticalMatch = this.findVerticalMatch(row, col, checked);
        if (verticalMatch) matches.push(verticalMatch);
      }
    }

    return matches;
  }

  private findHorizontalMatch(row: number, col: number, checked: boolean[][]): MatchResult | null {
    const currentTile = this.board[row][col];
    if (!isBasicTile(currentTile)) return null;
    
    let matchLength = 1;
    let endCol = col;
    
    // Find extent of horizontal match
    while (endCol + 1 < this.boardSize && this.board[row][endCol + 1] === currentTile) {
      matchLength++;
      endCol++;
    }
    
    if (matchLength >= 3) {
      const tiles: {row: number, col: number}[] = [];
      for (let c = col; c <= endCol; c++) {
        tiles.push({row, col: c});
        checked[row][c] = true;
      }
      
      const matchResult: MatchResult = {
        tiles,
        type: 'horizontal',
        length: matchLength
      };
      
      // Determine special tile creation
      if (matchLength === 4) {
        matchResult.specialTileCreated = {
          position: {row, col: Math.floor((col + endCol) / 2)},
          type: TileType.STRIPED_VERTICAL
        };
      } else if (matchLength >= 5) {
        matchResult.specialTileCreated = {
          position: {row, col: Math.floor((col + endCol) / 2)},
          type: TileType.COLOR_BOMB
        };
      }
      
      return matchResult;
    }
    
    return null;
  }

  private findVerticalMatch(row: number, col: number, checked: boolean[][]): MatchResult | null {
    const currentTile = this.board[row][col];
    if (!isBasicTile(currentTile)) return null;
    
    let matchLength = 1;
    let endRow = row;
    
    // Find extent of vertical match
    while (endRow + 1 < this.boardSize && this.board[endRow + 1][col] === currentTile) {
      matchLength++;
      endRow++;
    }
    
    if (matchLength >= 3) {
      const tiles: {row: number, col: number}[] = [];
      for (let r = row; r <= endRow; r++) {
        tiles.push({row: r, col});
        checked[r][col] = true;
      }
      
      const matchResult: MatchResult = {
        tiles,
        type: 'vertical',
        length: matchLength
      };
      
      // Determine special tile creation
      if (matchLength === 4) {
        matchResult.specialTileCreated = {
          position: {row: Math.floor((row + endRow) / 2), col},
          type: TileType.STRIPED_HORIZONTAL
        };
      } else if (matchLength >= 5) {
        matchResult.specialTileCreated = {
          position: {row: Math.floor((row + endRow) / 2), col},
          type: TileType.COLOR_BOMB
        };
      }
      
      return matchResult;
    }
    
    return null;
  }

  private processEnhancedMatches(matches: MatchResult[]): void {
    let totalTilesCleared = 0;
    
    matches.forEach(match => {
      // FIXED SCORING: Much lower points for matches (5-10 points per match as requested)
      const basePoints = 5; // Base points per match
      const lengthBonus = (match.length - 3) * 2; // Small bonus for longer matches
      const comboBonus = basePoints * (this.gameProgress.comboMultiplier - 1) * 0.1; // Minimal combo bonus
      const totalPoints = basePoints + lengthBonus + comboBonus;
      
      this.score += totalPoints;
      totalTilesCleared += match.tiles.length;
      
      // Clear matched tiles
      match.tiles.forEach(tile => {
        this.board[tile.row][tile.col] = TileType.EMPTY;
      });
      
      // Create special tile if applicable
      if (match.specialTileCreated) {
        const pos = match.specialTileCreated.position;
        this.board[pos.row][pos.col] = match.specialTileCreated.type;
        this.gameProgress.specialTilesCreated++;
        console.log(`✨ Special tile created: ${match.specialTileCreated.type} at (${pos.row}, ${pos.col})`);
      }
    });
    
    this.gameProgress.clearedTiles += totalTilesCleared;
    this.gameProgress.score = this.score;
    
    // Add match animation
    const allMatchTiles = matches.flatMap(match => match.tiles);
    this.addAnimation({
      type: 'match',
      tiles: allMatchTiles,
      id: `match-${this.currentAnimationId++}`
    });
  }

  private processCascadingMatches(): void {
    let cascadeCount = 0;
    let hasMatches = true;
    
    while (hasMatches) {
      const matches = this.findEnhancedMatches();
      if (matches.length > 0) {
        cascadeCount++;
        this.gameProgress.cascades++;
        // FIXED CASCADING: Much lower multiplier increase
        this.gameProgress.comboMultiplier = 1 + (cascadeCount * 0.1);
        
        console.log(`🔄 Cascade ${cascadeCount} found: ${matches.length} matches, multiplier: ${this.gameProgress.comboMultiplier}`);
        
        this.addAnimation({
          type: 'cascade',
          cascadeMultiplier: this.gameProgress.comboMultiplier,
          id: `cascade-${this.currentAnimationId++}`
        });
        
        this.processEnhancedMatches(matches);
        this.dropTiles();
        this.fillEmptySpaces();
      } else {
        hasMatches = false;
        // Reset combo multiplier after cascades end
        this.gameProgress.comboMultiplier = 1;
      }
    }
  }

  private updateObjectives(): void {
    this.levelConfig.objectives.forEach(objective => {
      switch (objective.type) {
        case 'score':
          // Score is already tracked in this.score
          break;
        case 'clear_tiles':
          // Already tracked in gameProgress.clearedTiles
          break;
        case 'special_tiles':
          // Already tracked in gameProgress.specialTilesCreated
          break;
        case 'cascades':
          // Already tracked in gameProgress.cascades
          break;
      }
    });
  }

  public useBooster(type: BoosterType, targetTile?: {row: number, col: number}): BoosterResult {
    if (!this.boosterManager.canUseBooster(type)) {
      console.log(`❌ Cannot use booster ${type} - limit reached`);
      return { success: false };
    }
    
    switch (type) {
      case BoosterType.SHUFFLE:
        this.shuffleBoard();
        this.boosterManager.useBooster(type);
        return { 
          success: true, 
          newBoard: this.getBoard(),
          animations: [{
            type: 'clear',
            id: `shuffle-${this.currentAnimationId++}`
          }]
        };
        
      case BoosterType.EXTRA_MOVES:
        this.gameProgress.moves += 5;
        this.boosterManager.useBooster(type);
        return { success: true };
        
      case BoosterType.HINT:
        this.generateHint();
        this.boosterManager.useBooster(type);
        return { success: true };
    }
    
    return { success: false };
  }

  private shuffleBoard(): void {
    const tiles: TileType[] = [];
    
    // Collect all non-blocked, non-empty tiles
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.board[row][col] !== TileType.BLOCKED && this.board[row][col] !== TileType.EMPTY) {
          tiles.push(this.board[row][col]);
        }
      }
    }
    
    // Shuffle array
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    
    // Redistribute tiles
    let tileIndex = 0;
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.board[row][col] !== TileType.BLOCKED && this.board[row][col] !== TileType.EMPTY) {
          this.board[row][col] = tiles[tileIndex++];
        }
      }
    }
    
    console.log("🔀 Board shuffled");
  }

  private generateHint(): void {
    this.hintTiles = [];
    
    // Find first possible move
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.board[row][col] === TileType.BLOCKED) continue;
        
        // Check adjacent tiles
        const directions = [{r: 0, c: 1}, {r: 1, c: 0}, {r: 0, c: -1}, {r: -1, c: 0}];
        
        for (const dir of directions) {
          const newRow = row + dir.r;
          const newCol = col + dir.c;
          
          if (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol] !== TileType.BLOCKED) {
            // Test swap
            this.swapTiles(row, col, newRow, newCol);
            const matches = this.findEnhancedMatches();
            this.swapTiles(row, col, newRow, newCol); // Revert
            
            if (matches.length > 0) {
              this.hintTiles = [{row, col}, {row: newRow, col: newCol}];
              console.log(`💡 Hint found: (${row},${col}) -> (${newRow},${newCol})`);
              return;
            }
          }
        }
      }
    }
    
    console.log("💡 No hints available - board may need shuffle");
  }

  public getHintTiles(): {row: number, col: number}[] {
    return this.hintTiles;
  }

  public clearHint(): void {
    this.hintTiles = [];
  }

  public checkLevelComplete(): boolean {
    return this.levelConfig.objectives.every(objective => {
      switch (objective.type) {
        case 'score':
          return this.score >= objective.target;
        case 'clear_tiles':
          return this.gameProgress.clearedTiles >= objective.target;
        case 'special_tiles':
          return this.gameProgress.specialTilesCreated >= objective.target;
        case 'cascades':
          return this.gameProgress.cascades >= objective.target;
        default:
          return false;
      }
    });
  }

  public isGameOver(): boolean {
    // Game is over only when moves are exhausted and level is not complete
    return this.gameProgress.moves <= 0 && !this.checkLevelComplete();
  }

  public getStarRating(): number {
    const scoreRatio = this.score / this.levelConfig.requiredScore;
    if (scoreRatio >= 2.0) return 3;
    if (scoreRatio >= 1.5) return 2;
    if (scoreRatio >= 1.0) return 1;
    return 0;
  }

  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
  }

  private swapTiles(row1: number, col1: number, row2: number, col2: number): void {
    const temp = this.board[row1][col1];
    this.board[row1][col1] = this.board[row2][col2];
    this.board[row2][col2] = temp;
  }

  private dropTiles(): void {
    const droppedTiles: {row: number, col: number}[] = [];
    
    for (let col = 0; col < this.boardSize; col++) {
      let writeIndex = this.boardSize - 1;
      
      for (let row = this.boardSize - 1; row >= 0; row--) {
        if (this.board[row][col] !== TileType.EMPTY && this.board[row][col] !== TileType.BLOCKED) {
          if (writeIndex !== row) {
            this.board[writeIndex][col] = this.board[row][col];
            this.board[row][col] = TileType.EMPTY;
            droppedTiles.push({row: writeIndex, col});
          }
          writeIndex--;
        } else if (this.board[row][col] === TileType.BLOCKED) {
          writeIndex = row - 1;
        }
      }
    }

    if (droppedTiles.length > 0) {
      this.addAnimation({
        type: 'drop',
        tiles: droppedTiles,
        id: `drop-${this.currentAnimationId++}`
      });
    }
  }

  private fillEmptySpaces(): void {
    const availableTypes = BASIC_TILE_TYPES.slice(0, this.levelConfig.availableTileTypes);
    
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.board[row][col] === TileType.EMPTY) {
          // Small chance to create special tile
          if (Math.random() < this.levelConfig.specialTileSpawnRate * 0.3) {
            const specialTypes = [TileType.STRIPED_HORIZONTAL, TileType.STRIPED_VERTICAL, TileType.WRAPPED];
            this.board[row][col] = specialTypes[Math.floor(Math.random() * specialTypes.length)];
          } else {
            this.board[row][col] = availableTypes[Math.floor(Math.random() * availableTypes.length)];
          }
        }
      }
    }
  }

  private addAnimation(animation: AnimationEvent): void {
    this.animationQueue.push(animation);
  }

  public getAnimations(): AnimationEvent[] {
    const animations = [...this.animationQueue];
    this.animationQueue = [];
    return animations;
  }

  public getBoard(): TileType[][] {
    return this.board.map(row => [...row]);
  }

  public getScore(): number {
    return this.score;
  }

  public setBoard(board: TileType[][]): void {
    this.board = board.map(row => [...row]);
  }

  public setScore(score: number): void {
    this.score = score;
  }

  public areAdjacent(row1: number, col1: number, row2: number, col2: number): boolean {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  public getGameProgress(): GameProgress {
    return {...this.gameProgress};
  }

  public getLevelConfig(): LevelConfig {
    return {...this.levelConfig};
  }

  public getBoosterManager(): BoosterManager {
    return this.boosterManager;
  }

  private findMostCommonTile(): TileType {
    const tileCount: Map<TileType, number> = new Map();
    
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const tile = this.board[row][col];
        if (isBasicTile(tile)) {
          tileCount.set(tile, (tileCount.get(tile) || 0) + 1);
        }
      }
    }
    
    let mostCommon = TileType.POOP;
    let maxCount = 0;
    
    tileCount.forEach((count, tile) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = tile;
      }
    });
    
    return mostCommon;
  }
}
