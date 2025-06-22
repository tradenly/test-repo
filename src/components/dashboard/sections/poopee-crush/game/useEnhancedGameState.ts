import { useState, useCallback, useRef, useEffect } from 'react';
import { GameBoard, GameProgress, TileType, Position, Animation } from './EnhancedGameEngine';
import { BoosterType, BoosterSystem } from './BoosterSystem';
import { LevelConfig, createLevelConfig } from './LevelConfig';
import { EnhancedGameEngine } from './EnhancedGameEngine';
import { useGameAudio } from '@/hooks/useGameAudio';

interface MatchResult {
  boardChanged: boolean;
  newState?: Partial<EnhancedGameState>;
  selectedTile?: Position | null;
  animations?: Animation[];
}

const calculateStarRating = (gameProgress: GameProgress, levelConfig: LevelConfig): number => {
  const { score, targetScore } = gameProgress;
  const { perfectScore } = levelConfig;

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

const saveGameState = (gameState: EnhancedGameState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
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

const STORAGE_KEY = 'poopee-crush-enhanced-game-state';

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
  onLevelComplete: (level: number, score: number, stars: number) => void,
  onGameEnd: (finalScore: number) => void
) => {
  const { playSoundEffect } = useGameAudio();
  const gameEngineRef = useRef<EnhancedGameEngine>();
  const boosterSystemRef = useRef<BoosterSystem>();
  const [animations, setAnimations] = useState<Animation[]>([]);

  const [gameState, setGameState] = useState<EnhancedGameState>(() => ({
    board: Array(8).fill(null).map(() => Array(8).fill(TileType.NORMAL_1)),
    gameProgress: {
      currentLevel: 1,
      score: 0,
      moves: 0,
      targetScore: 1000,
      maxMoves: 20,
      levelObjectives: {
        description: "Reach the target score!",
        requirements: [
          { type: 'score', target: 1000, current: 0 }
        ]
      }
    },
    selectedTile: null,
    hintTiles: [],
    gameActive: false,
    levelComplete: false,
    gameOver: false,
    levelConfig: createLevelConfig(1),
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
          
          saveGameState(newState);
          
          if (newState.levelComplete && !prevState.levelComplete) {
            const stars = calculateStarRating(newState.gameProgress, newState.levelConfig);
            onLevelComplete(newState.gameProgress.currentLevel, newState.gameProgress.score, stars);
          }
          
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
  }, [gameState.gameActive, onLevelComplete, onGameEnd, playSoundEffect]);

  const useBooster = useCallback((type: BoosterType, targetTile?: Position): boolean => {
    if (!gameState.gameActive || !boosterSystemRef.current || !gameEngineRef.current) {
      return false;
    }

    const result = boosterSystemRef.current.useBooster(type, gameState.board, targetTile);
    
    if (result.success && result.newBoard) {
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
          
          saveGameState(newState);
          return newState;
        });
      }, result.animations ? 600 : 0);
    }

    return result.success;
  }, [gameState.gameActive, gameState.board]);

  const startNewLevel = useCallback((level: number) => {
    const levelConfig = createLevelConfig(level);
    const engine = new EnhancedGameEngine(levelConfig);
    const boosterSystem = new BoosterSystem();
    
    gameEngineRef.current = engine;
    boosterSystemRef.current = boosterSystem;
    
    const initialBoard = engine.generateInitialBoard();
    
    const newState: EnhancedGameState = {
      board: initialBoard,
      gameProgress: {
        currentLevel: level,
        score: 0,
        moves: 0,
        targetScore: levelConfig.targetScore,
        maxMoves: levelConfig.maxMoves,
        levelObjectives: levelConfig.objectives
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
    saveGameState(newState);
    
    console.log(`🎮 [Enhanced Game] Started level ${level}`);
  }, []);

  const resumeGame = useCallback((): boolean => {
    try {
      const savedState = loadGameState();
      if (savedState && savedState.gameActive) {
        const engine = new EnhancedGameEngine(savedState.levelConfig);
        const boosterSystem = new BoosterSystem();
        
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
  }, []);

  const quitGame = useCallback(() => {
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
    
    console.log('🚪 [Enhanced Game] Game quit');
  }, []);

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
