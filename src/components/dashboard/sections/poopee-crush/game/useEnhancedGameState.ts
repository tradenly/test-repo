import { useState, useEffect, useRef } from "react";
import { EnhancedGameEngine, AnimationEvent, GameProgress } from "./EnhancedGameEngine";
import { TileType } from "./EnhancedTileTypes";
import { LevelConfig } from "./LevelConfig";
import { BoosterType } from "./BoosterSystem";

interface EnhancedGameState {
  board: TileType[][];
  gameProgress: GameProgress;
  levelConfig: LevelConfig;
  gameActive: boolean;
  selectedTile: {row: number, col: number} | null;
  hintTiles: {row: number, col: number}[];
  levelComplete: boolean;
  gameOver: boolean;
  starRating: number;
}

const STORAGE_KEY = 'poopee-crush-enhanced-game-state';

export const useEnhancedGameState = (onLevelComplete: (level: number, score: number, stars: number) => void, onGameOver: (finalScore: number) => void) => {
  const gameEngineRef = useRef<EnhancedGameEngine | null>(null);
  const [gameState, setGameState] = useState<EnhancedGameState>({
    board: [],
    gameProgress: {
      currentLevel: 1,
      score: 0,
      moves: 0,
      objectives: {},
      clearedTiles: 0,
      specialTilesCreated: 0,
      cascades: 0,
      comboMultiplier: 1
    },
    levelConfig: {
      level: 1,
      moves: 25,
      objectives: [],
      requiredScore: 1000,
      availableTileTypes: 4,
      specialTileSpawnRate: 0.1,
      difficulty: 'easy'
    },
    gameActive: false,
    selectedTile: null,
    hintTiles: [],
    levelComplete: false,
    gameOver: false,
    starRating: 0
  });
  const [animations, setAnimations] = useState<AnimationEvent[]>([]);

  // Initialize game engine
  useEffect(() => {
    if (!gameEngineRef.current) {
      console.log("🎮 Initializing new Enhanced GameEngine");
      gameEngineRef.current = new EnhancedGameEngine();
    }
  }, []);

  // Save game state to localStorage
  const saveGameState = (state: EnhancedGameState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        board: state.board,
        gameProgress: state.gameProgress,
        levelConfig: state.levelConfig
      }));
      console.log("💾 Enhanced game state saved to localStorage");
    } catch (error) {
      console.warn("Failed to save enhanced game state:", error);
    }
  };

  // Load game state from localStorage
  const loadGameState = (): EnhancedGameState | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        // Only restore if game was active and not completed
        if (state.gameActive && !state.levelComplete && !state.gameOver) {
          console.log("📂 Loaded saved enhanced game state:", state);
          return state;
        }
      }
    } catch (error) {
      console.warn("Failed to load enhanced game state:", error);
    }
    return null;
  };

  // Clear saved game state
  const clearGameState = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log("🗑️ Cleared saved enhanced game state");
    } catch (error) {
      console.warn("Failed to clear enhanced game state:", error);
    }
  };

  const startNewLevel = (level: number = 1) => {
    if (!gameEngineRef.current) {
      console.error("❌ Enhanced GameEngine not initialized");
      return;
    }

    console.log("🎮 Starting new POOPEE Crush level", level);
    const engine = gameEngineRef.current;
    
    // Generate a new board for the level
    const newBoard = engine.startNewLevel(level);
    const progress = engine.getGameProgress();
    const levelConfig = engine.getLevelConfig();
    
    const newState: EnhancedGameState = {
      board: newBoard,
      gameProgress: progress,
      levelConfig: levelConfig,
      gameActive: true,
      selectedTile: null,
      hintTiles: [],
      levelComplete: false,
      gameOver: false,
      starRating: 0
    };

    setGameState(newState);
    saveGameState(newState);
    setAnimations([]);
    
    console.log("🎮 New level started:", level, "with board:", newBoard);
  };

  const resumeGame = () => {
    const savedState = loadGameState();
    if (savedState && gameEngineRef.current) {
      console.log("🔄 Resuming saved enhanced game");
      const engine = gameEngineRef.current;
      
      // Restore the engine state to match the saved state
      engine.setBoard(savedState.board);
      engine.setScore(savedState.gameProgress.score);
      
      // Set the component state
      setGameState(savedState);
      console.log("🔄 Enhanced game resumed successfully");
      return true;
    }
    return false;
  };

  const syncStateWithEngine = () => {
    if (!gameEngineRef.current) return gameState;
    
    const engine = gameEngineRef.current;
    const progress = engine.getGameProgress();
    const levelConfig = engine.getLevelConfig();
    const hintTiles = engine.getHintTiles();
    const levelComplete = engine.checkLevelComplete();
    const gameOver = engine.isGameOver();
    const starRating = engine.getStarRating();
    
    const updatedState: EnhancedGameState = {
      ...gameState,
      board: engine.getBoard(),
      gameProgress: progress,
      levelConfig: levelConfig,
      hintTiles: hintTiles,
      levelComplete: levelComplete,
      gameOver: gameOver,
      starRating: starRating
    };
    
    console.log("🔄 Syncing enhanced state with engine - Score:", progress.score, "Level:", progress.currentLevel);
    return updatedState;
  };

  const handleTileClick = (row: number, col: number) => {
    if (!gameState.gameActive || gameState.gameProgress.moves <= 0 || !gameEngineRef.current || gameState.levelComplete || gameState.gameOver) {
      console.log("🚫 Cannot handle tile click - game not active or level ended");
      return;
    }

    const engine = gameEngineRef.current;
    console.log(`🎯 Tile clicked: (${row}, ${col})`);

    // Clear hint when player makes a move
    if (gameState.hintTiles.length > 0) {
      engine.clearHint();
    }

    if (!gameState.selectedTile) {
      // Select tile
      const newState = {
        ...gameState,
        selectedTile: { row, col },
        hintTiles: []
      };
      setGameState(newState);
      saveGameState(newState);
      console.log(`🎯 Tile selected: (${row}, ${col})`);
    } else {
      // Attempt move or deselect
      if (gameState.selectedTile.row === row && gameState.selectedTile.col === col) {
        // Deselect same tile
        const newState = {
          ...gameState,
          selectedTile: null
        };
        setGameState(newState);
        saveGameState(newState);
        console.log("❌ Tile deselected");
        return;
      }

      // Check if tiles are adjacent
      const isAdjacent = engine.areAdjacent(
        gameState.selectedTile.row, gameState.selectedTile.col,
        row, col
      );

      if (isAdjacent) {
        console.log(`🔄 Attempting enhanced move from (${gameState.selectedTile.row}, ${gameState.selectedTile.col}) to (${row}, ${col})`);
        
        // Attempt move
        const moveSuccessful = engine.makeMove(
          gameState.selectedTile.row, gameState.selectedTile.col,
          row, col
        );

        if (moveSuccessful) {
          console.log("✅ Enhanced move successful!");
          
          // Get updated state from engine
          const syncedState = syncStateWithEngine();
          const newState: EnhancedGameState = {
            ...syncedState,
            selectedTile: null
          };

          setGameState(newState);

          // Check for level completion or game over
          if (newState.levelComplete) {
            clearGameState();
            console.log("🏆 Level completed!");
            onLevelComplete(newState.gameProgress.currentLevel, newState.gameProgress.score, newState.starRating);
          } else if (newState.gameOver) {
            clearGameState();
            console.log("💀 Game over!");
            onGameOver(newState.gameProgress.score);
          } else {
            saveGameState(newState);
          }

          // Get and display animations
          const newAnimations = engine.getAnimations();
          if (newAnimations.length > 0) {
            console.log("🎬 Setting enhanced animations:", newAnimations);
            setAnimations(newAnimations);
          }
        } else {
          console.log("❌ Enhanced move failed - no valid matches");
          // Invalid move - just deselect
          const newState = {
            ...gameState,
            selectedTile: null
          };
          setGameState(newState);
          saveGameState(newState);

          // Show invalid move animation
          const invalidAnimations = engine.getAnimations();
          if (invalidAnimations.length > 0) {
            setAnimations(invalidAnimations);
          }
        }
      } else {
        // Not adjacent - select new tile instead
        const newState = {
          ...gameState,
          selectedTile: { row, col }
        };
        setGameState(newState);
        saveGameState(newState);
        console.log(`🎯 New tile selected: (${row}, ${col})`);
      }
    }
  };

  const useBooster = (type: BoosterType, targetTile?: {row: number, col: number}) => {
    if (!gameEngineRef.current || !gameState.gameActive) {
      console.log("🚫 Cannot use booster - game not active");
      return false;
    }

    const engine = gameEngineRef.current;
    const success = engine.useBooster(type, targetTile);
    
    if (success) {
      console.log("🔧 Booster used successfully:", type);
      const syncedState = syncStateWithEngine();
      setGameState(syncedState);
      saveGameState(syncedState);
      
      // Get animations from booster usage
      const newAnimations = engine.getAnimations();
      if (newAnimations.length > 0) {
        setAnimations(newAnimations);
      }
    }
    
    return success;
  };

  const continueToNextLevel = () => {
    if (!gameState.levelComplete) return;
    
    const nextLevel = gameState.gameProgress.currentLevel + 1;
    startNewLevel(nextLevel);
  };

  const restartLevel = () => {
    startNewLevel(gameState.gameProgress.currentLevel);
  };

  const quitGame = () => {
    if (gameState.gameActive) {
      console.log("🏁 Player quit the enhanced game");
      clearGameState();
      onGameOver(gameState.gameProgress.score);
      
      const newState: EnhancedGameState = {
        board: [],
        gameProgress: {
          currentLevel: 1,
          score: 0,
          moves: 0,
          objectives: {},
          clearedTiles: 0,
          specialTilesCreated: 0,
          cascades: 0,
          comboMultiplier: 1
        },
        levelConfig: {
          level: 1,
          moves: 25,
          objectives: [],
          requiredScore: 1000,
          availableTileTypes: 4,
          specialTileSpawnRate: 0.1,
          difficulty: 'easy'
        },
        gameActive: false,
        selectedTile: null,
        hintTiles: [],
        levelComplete: false,
        gameOver: false,
        starRating: 0
      };
      setGameState(newState);
    }
  };

  return {
    gameState,
    animations,
    handleTileClick,
    startNewLevel,
    resumeGame,
    quitGame,
    useBooster,
    continueToNextLevel,
    restartLevel
  };
};
