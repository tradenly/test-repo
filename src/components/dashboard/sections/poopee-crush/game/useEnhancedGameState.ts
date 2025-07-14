
import { useState, useCallback, useRef, useEffect } from 'react';
import { GameBoard, GameProgress, Position, Animation, EnhancedGameEngine, BoosterResult } from './EnhancedGameEngine';
import { BoosterType, BoosterManager } from './BoosterSystem';
import { LevelConfig, getLevelConfig } from './LevelConfig';
import { DifficultyLevel } from './DifficultySelector';
import { TileType } from './EnhancedTileTypes';
import { useGameAudio } from '@/hooks/useGameAudio';

interface MatchResult {
  boardChanged: boolean;
  newState?: Partial<EnhancedGameState>;
  selectedTile?: Position | null;
  animations?: Animation[];
}

const calculateStarRating = (gameProgress: GameProgress, levelConfig: LevelConfig): number => {
  const { score, targetScore } = gameProgress;
  const perfectScore = levelConfig.requiredScore * 2;

  if (score >= perfectScore) {
    return 3;
  } else if (score >= targetScore * 1.5) {
    return 2;
  } else if (score >= targetScore) {
    return 1;
  } else {
    return 0;
  }
};

const STORAGE_KEY = 'poopee-crush-enhanced-game-state';

const saveGameState = (gameState: EnhancedGameState, difficulty: DifficultyLevel) => {
  try {
    // Only save if game is active and not completed
    if (gameState.gameActive && !gameState.levelComplete && !gameState.gameOver) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
      console.log('💾 Game state saved - Level:', gameState.gameProgress.currentLevel);
    }
  } catch (error) {
    console.warn('Failed to save game state:', error);
  }
};

const loadGameState = (): EnhancedGameState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.warn("Failed to load game state:", error);
    return null;
  }
  return null;
};

const clearGameState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Cleared saved game state');
  } catch (error) {
    console.warn('Failed to clear game state:', error);
  }
};

interface EnhancedGameState {
  board: GameBoard;
  gameProgress: GameProgress;
  selectedTile: Position | null;
  hintTiles: Position[];
  gameActive: boolean;
  levelComplete: boolean;
  gameOver: boolean;
  levelConfig: LevelConfig;
  starRating: number;
}

export const useEnhancedGameState = (
  difficulty: DifficultyLevel,
  onLevelComplete: (level: number, score: number, stars: number) => void,
  onGameEnd: (finalScore: number) => void
) => {
  const { playSoundEffect } = useGameAudio();
  const gameEngineRef = useRef<EnhancedGameEngine>();
  const boosterSystemRef = useRef<BoosterManager>();
  const [animations, setAnimations] = useState<Animation[]>([]);

  const [gameState, setGameState] = useState<EnhancedGameState>(() => ({
    board: Array(8).fill(null).map(() => Array(8).fill(TileType.POOP)),
    gameProgress: {
      currentLevel: 1,
      score: 0,
      moves: 0,
      objectives: {},
      clearedTiles: 0,
      specialTilesCreated: 0,
      cascades: 0,
      comboMultiplier: 1,
      targetScore: 250,
      maxMoves: 30,
      levelObjectives: {
        description: "Reach the target score!",
        requirements: [
          { type: 'score', target: 250, current: 0 }
        ]
      }
    },
    selectedTile: null,
    hintTiles: [],
    gameActive: false,
    levelComplete: false,
    gameOver: false,
    levelConfig: getLevelConfig(1, difficulty),
    starRating: 0
  }));

  const handleTileClick = useCallback((row: number, col: number) => {
    if (!gameState.gameActive || !gameEngineRef.current) return;

    const result = gameEngineRef.current.handleTileClick(row, col);
    
    if (result.boardChanged) {
      // Play match sound effect when tiles are cleared
      if (result.animations && result.animations.length > 0) {
        const hasMatchAnimation = result.animations.some(anim => anim.type === 'clear');
        if (hasMatchAnimation) {
          playSoundEffect('match');
        }
      }

      setAnimations(result.animations || []);
      
      setTimeout(() => {
        setAnimations([]);
        
        setGameState(prevState => {
          const newState = {
            ...prevState,
            ...result.newState,
            selectedTile: result.selectedTile || null,
            hintTiles: []
          };
          
          // Check if level was completed (engine handles this internally)
          if (newState.levelComplete && !prevState.levelComplete) {
            const stars = calculateStarRating(newState.gameProgress, newState.levelConfig);
            newState.starRating = stars;
            console.log(`🎉 Level ${newState.gameProgress.currentLevel} completed!`);
            onLevelComplete(newState.gameProgress.currentLevel, newState.gameProgress.score, stars);
            clearGameState(); // Clear saved state on level completion
          }
          
          // Only save if game is still active and not completed
          if (newState.gameActive && !newState.levelComplete && !newState.gameOver) {
            saveGameState(newState, difficulty);
          }
          
          if (newState.gameOver && !prevState.gameOver) {
            clearGameState(); // Clear saved state on game over
            onGameEnd(newState.gameProgress.score);
          }
          
          return newState;
        });
      }, result.animations ? 600 : 0);
    } else {
      setGameState(prevState => ({
        ...prevState,
        selectedTile: result.selectedTile || null,
        hintTiles: []
      }));
    }
  }, [gameState.gameActive, onLevelComplete, onGameEnd, playSoundEffect, difficulty]);

  const useBooster = useCallback((type: BoosterType, targetTile?: Position): boolean => {
    if (!gameState.gameActive || !boosterSystemRef.current || !gameEngineRef.current) {
      console.log('❌ [useBooster] Cannot use booster - game not active or refs not ready');
      return false;
    }

    console.log(`🔧 [useBooster] Attempting to use ${type} booster`);
    
    const result: BoosterResult = gameEngineRef.current.useBooster(type, targetTile);
    
    console.log(`🔧 [useBooster] Booster result:`, result);
    
    if (result.success && result.newBoard) {
      console.log(`✅ [useBooster] ${type} booster succeeded, applying changes`);
      
      playSoundEffect('booster');
      setAnimations(result.animations || []);
      
      setTimeout(() => {
        setAnimations([]);
        
        const processedResult = gameEngineRef.current!.processBoard(result.newBoard!);
        
        setGameState(prevState => {
          const newState = {
            ...prevState,
            board: processedResult.board,
            gameProgress: {
              ...prevState.gameProgress,
              score: prevState.gameProgress.score + processedResult.scoreIncrease
            },
            selectedTile: null,
            hintTiles: []
          };
          
          // Only save if game is still active and not completed
          if (newState.gameActive && !newState.levelComplete && !newState.gameOver) {
            saveGameState(newState, difficulty);
          }
          
          console.log(`💾 [useBooster] Game state saved after ${type} booster`);
          return newState;
        });
      }, result.animations ? 600 : 0);
    } else {
      console.log(`❌ [useBooster] ${type} booster failed:`, result);
    }

    return result.success;
  }, [gameState.gameActive, gameState.board, playSoundEffect, difficulty]);

  const startNewLevel = useCallback((level: number) => {
    console.log(`🎮 [Enhanced Game] Starting level ${level} on ${difficulty} difficulty`);
    
    const levelConfig = getLevelConfig(level, difficulty);
    const engine = new EnhancedGameEngine(levelConfig);
    const boosterSystem = new BoosterManager();
    
    gameEngineRef.current = engine;
    boosterSystemRef.current = boosterSystem;
    
    const initialBoard = engine.generateInitialBoard();
    
    const newState: EnhancedGameState = {
      board: initialBoard,
      gameProgress: {
        currentLevel: level,
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
      },
      selectedTile: null,
      hintTiles: [],
      gameActive: true,
      levelComplete: false,
      gameOver: false,
      levelConfig,
      starRating: 0
    };
    
    setGameState(newState);
    // Save the new level state immediately
    saveGameState(newState, difficulty);
    
    console.log(`🎮 [Enhanced Game] Started level ${level}`);
  }, [difficulty]);

  const resumeGame = useCallback((): boolean => {
    try {
      const savedState = loadGameState();
      
      if (savedState && savedState.gameActive && !savedState.levelComplete && !savedState.gameOver) {
        const engine = new EnhancedGameEngine(savedState.levelConfig);
        const boosterSystem = new BoosterManager();
        
        gameEngineRef.current = engine;
        boosterSystemRef.current = boosterSystem;
        
        // Restore the engine state
        engine.setGameState(savedState.board, savedState.gameProgress);
        
        setGameState(savedState);
        console.log('🔄 [Enhanced Game] Game resumed from saved state - Level:', savedState.gameProgress.currentLevel);
        return true;
      }
    } catch (error) {
      console.warn('⚠️ [Enhanced Game] Failed to resume game:', error);
    }
    return false;
  }, []);

  const quitGame = useCallback(() => {
    console.log('🚪 [Enhanced Game] Quitting game with score:', gameState.gameProgress.score);
    
    // Clear saved state when quitting
    clearGameState();
    
    // Call onGameEnd before setting gameActive to false
    onGameEnd(gameState.gameProgress.score);
    
    setGameState(prevState => ({
      ...prevState,
      gameActive: false
    }));
  }, [gameState.gameProgress.score, onGameEnd]);

  const continueToNextLevel = useCallback(() => {
    const nextLevel = gameState.gameProgress.currentLevel + 1;
    console.log(`🚀 [Enhanced Game] Continuing to level ${nextLevel}`);
    
    // Clear any saved state before starting new level
    clearGameState();
    
    startNewLevel(nextLevel);
  }, [gameState.gameProgress.currentLevel, startNewLevel]);

  const restartLevel = useCallback(() => {
    console.log(`🔄 [Enhanced Game] Restarting level ${gameState.gameProgress.currentLevel}`);
    
    // Clear any saved state before restarting
    clearGameState();
    
    startNewLevel(gameState.gameProgress.currentLevel);
  }, [gameState.gameProgress.currentLevel, startNewLevel]);

  return {
    gameState,
    animations,
    handleTileClick,
    useBooster,
    startNewLevel,
    resumeGame,
    quitGame,
    continueToNextLevel,
    restartLevel
  };
};
