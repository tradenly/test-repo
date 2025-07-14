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
const PROGRESS_STORAGE_KEY = 'poopee-crush-game-progress';

const saveGameState = (gameState: EnhancedGameState, difficulty: DifficultyLevel) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    // Save progress separately to persist across sessions
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
      currentLevel: gameState.gameProgress.currentLevel,
      difficulty: difficulty,
      timestamp: Date.now()
    }));
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

const loadGameProgress = (): { currentLevel: number; difficulty: DifficultyLevel } | null => {
  try {
    const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (saved) {
      const progress = JSON.parse(saved);
      // Only restore if saved within last 24 hours
      if (Date.now() - progress.timestamp < 24 * 60 * 60 * 1000) {
        return { currentLevel: progress.currentLevel, difficulty: progress.difficulty };
      }
    }
  } catch (error) {
    console.warn("Failed to load game progress:", error);
  }
  return null;
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
          }
          
          saveGameState(newState, difficulty);
          
          if (newState.gameOver && !prevState.gameOver) {
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
          
          saveGameState(newState, difficulty);
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
    saveGameState(newState, difficulty);
    
    console.log(`🎮 [Enhanced Game] Started level ${level} on ${difficulty} difficulty`);
  }, [difficulty]);

  const resumeGame = useCallback((): boolean => {
    try {
      const savedState = loadGameState();
      const savedProgress = loadGameProgress();
      
      // Prioritize saved progress over saved state for level continuity
      if (savedProgress && savedProgress.difficulty === difficulty) {
        console.log(`🔄 [Enhanced Game] Resuming from level ${savedProgress.currentLevel}`);
        startNewLevel(savedProgress.currentLevel);
        return true;
      }
      
      if (savedState && savedState.gameActive) {
        const engine = new EnhancedGameEngine(savedState.levelConfig);
        const boosterSystem = new BoosterManager();
        
        gameEngineRef.current = engine;
        boosterSystemRef.current = boosterSystem;
        
        // Restore the engine state
        engine.setGameState(savedState.board, savedState.gameProgress);
        
        setGameState(savedState);
        console.log('🔄 [Enhanced Game] Game resumed from saved state');
        return true;
      }
    } catch (error) {
      console.warn('⚠️ [Enhanced Game] Failed to resume game:', error);
    }
    return false;
  }, [difficulty, startNewLevel]);

  const quitGame = useCallback(() => {
    console.log('🚪 [Enhanced Game] Quitting game with score:', gameState.gameProgress.score);
    
    // Call onGameEnd before setting gameActive to false
    onGameEnd(gameState.gameProgress.score);
    
    setGameState(prevState => ({
      ...prevState,
      gameActive: false
    }));
    
    // Clear saved game state when quitting
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('⚠️ [Enhanced Game] Failed to clear saved state:', error);
    }
  }, [gameState.gameProgress.score, onGameEnd]);

  const continueToNextLevel = useCallback(() => {
    const nextLevel = gameState.gameProgress.currentLevel + 1;
    startNewLevel(nextLevel);
  }, [gameState.gameProgress.currentLevel, startNewLevel]);

  const restartLevel = useCallback(() => {
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
