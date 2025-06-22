import { TileType, BASIC_TILE_TYPES, isSpecialTile, isBasicTile, MatchResult, PowerUpEffect } from "./EnhancedTileTypes";
import { LevelConfig, getLevelConfig } from "./LevelConfig";
import { BoosterManager, BoosterType } from "./BoosterSystem";

export interface AnimationEvent {
  type: 'match' | 'drop' | 'swap' | 'invalid' | 'special_effect' | 'cascade' | 'level_complete';
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

  constructor(boardSize: number = 8) {
    this.boardSize = boardSize;
    this.board = [];
    this.score = 0;
    this.boosterManager = new BoosterManager();
    this.gameProgress = {
      currentLevel: 1,
      score: 0,
      moves: 0,
      objectives: {},
      clearedTiles: 0,
      specialTilesCreated: 0,
      cascades: 0,
      comboMultiplier: 1
    };
    this.levelConfig = getLevelConfig(1);
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
      comboMultiplier: 1
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
    
    // Validate coordinates and blocked tiles
    if (!this.isValidPosition(row1, col1) || !this.isValidPosition(row2, col2)) {
      console.log(`❌ Invalid coordinates`);
      return false;
    }
    
    if (this.board[row1][col1] === TileType.BLOCKED || this.board[row2][col2] === TileType.BLOCKED) {
      console.log(`❌ Cannot move blocked tiles`);
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
    
    // Check for matches and special tile effects
    const matches = this.findEnhancedMatches();
    const specialEffects = this.processSpecialTileEffects(row1, col1, row2, col2);
    
    if (matches.length > 0 || specialEffects.length > 0) {
      // Decrease moves
      this.gameProgress.moves--;
      
      // Process matches
      if (matches.length > 0) {
        this.processEnhancedMatches(matches);
      }
      
      // Process special effects
      specialEffects.forEach(effect => {
        this.addAnimation({
          type: 'special_effect',
          specialEffect: effect,
          id: `special-${this.currentAnimationId++}`
        });
        this.applySpecialEffect(effect);
      });
      
      this.dropTiles();
      this.fillEmptySpaces();
      this.processCascadingMatches();
      
      // Update objectives
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

  private processSpecialTileEffects(row1: number, col1: number, row2: number, col2: number): PowerUpEffect[] {
    const effects: PowerUpEffect[] = [];
    
    // Check if either tile involved in swap is special
    const tile1 = this.board[row1][col1];
    const tile2 = this.board[row2][col2];
    
    if (isSpecialTile(tile1)) {
      effects.push(this.createSpecialEffect(tile1, row1, col1));
    }
    
    if (isSpecialTile(tile2)) {
      effects.push(this.createSpecialEffect(tile2, row2, col2));
    }
    
    return effects;
  }

  private createSpecialEffect(tileType: TileType, row: number, col: number): PowerUpEffect {
    switch (tileType) {
      case TileType.STRIPED_HORIZONTAL:
        return {
          type: 'stripe_horizontal',
          tiles: Array.from({length: this.boardSize}, (_, c) => ({row, col: c})),
          centerTile: {row, col}
        };
        
      case TileType.STRIPED_VERTICAL:
        return {
          type: 'stripe_vertical',
          tiles: Array.from({length: this.boardSize}, (_, r) => ({row: r, col})),
          centerTile: {row, col}
        };
        
      case TileType.WRAPPED:
        const wrappedTiles: {row: number, col: number}[] = [];
        for (let r = Math.max(0, row - 1); r <= Math.min(this.boardSize - 1, row + 1); r++) {
          for (let c = Math.max(0, col - 1); c <= Math.min(this.boardSize - 1, col + 1); c++) {
            wrappedTiles.push({row: r, col: c});
          }
        }
        return {
          type: 'wrapped_explosion',
          tiles: wrappedTiles,
          centerTile: {row, col}
        };
        
      case TileType.COLOR_BOMB:
        const targetTile = this.findMostCommonTile();
        const colorBombTiles: {row: number, col: number}[] = [];
        for (let r = 0; r < this.boardSize; r++) {
          for (let c = 0; c < this.boardSize; c++) {
            if (this.board[r][c] === targetTile) {
              colorBombTiles.push({row: r, col: c});
            }
          }
        }
        return {
          type: 'color_bomb',
          tiles: colorBombTiles,
          centerTile: {row, col}
        };
        
      default:
        return {type: 'wrapped_explosion', tiles: [], centerTile: {row, col}};
    }
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

  private applySpecialEffect(effect: PowerUpEffect): void {
    effect.tiles.forEach(tile => {
      if (this.board[tile.row][tile.col] !== TileType.BLOCKED) {
        this.board[tile.row][tile.col] = TileType.EMPTY;
        this.gameProgress.clearedTiles++;
      }
    });
    
    // Award bonus points for special effects
    const bonusPoints = effect.tiles.length * 50 * this.gameProgress.comboMultiplier;
    this.score += bonusPoints;
    this.gameProgress.score = this.score;
  }

  private processEnhancedMatches(matches: MatchResult[]): void {
    let totalTilesCleared = 0;
    
    matches.forEach(match => {
      // Award points based on match length and type
      const basePoints = 100;
      const lengthBonus = (match.length - 3) * 50;
      const comboBonus = basePoints * (this.gameProgress.comboMultiplier - 1);
      const totalPoints = (basePoints + lengthBonus + comboBonus) * match.length;
      
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
        this.gameProgress.comboMultiplier = 1 + (cascadeCount * 0.5);
        
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

  public useBooster(type: BoosterType, targetTile?: {row: number, col: number}): boolean {
    if (!this.boosterManager.canUseBooster(type)) {
      console.log(`❌ Cannot use booster ${type} - limit reached`);
      return false;
    }
    
    switch (type) {
      case BoosterType.HAMMER:
        if (targetTile && this.isValidPosition(targetTile.row, targetTile.col)) {
          this.board[targetTile.row][targetTile.col] = TileType.EMPTY;
          this.dropTiles();
          this.fillEmptySpaces();
          this.boosterManager.useBooster(type);
          return true;
        }
        break;
        
      case BoosterType.SHUFFLE:
        this.shuffleBoard();
        this.boosterManager.useBooster(type);
        return true;
        
      case BoosterType.EXTRA_MOVES:
        this.gameProgress.moves += 5;
        this.boosterManager.useBooster(type);
        return true;
        
      case BoosterType.HINT:
        this.generateHint();
        this.boosterManager.useBooster(type);
        return true;
    }
    
    return false;
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
}
