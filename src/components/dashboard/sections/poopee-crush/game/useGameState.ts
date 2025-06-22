
import { useState, useEffect, useRef } from "react";
import { GameEngine, AnimationEvent } from "./GameEngine";
import { TileType } from "./TileTypes";

interface GameState {
  board: TileType[][];
  score: number;
  moves: number;
  gameActive: boolean;
  selectedTile: {row: number, col: number} | null;
}

const STORAGE_KEY = 'poopee-crush-game-state';

export const useGameState = (onGameEnd: (score: number, moves: number) => void) => {
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    score: 0,
    moves: 30,
    gameActive: false,
    selectedTile: null
  });
  const [animations, setAnimations] = useState<AnimationEvent[]>([]);

  // Initialize game engine
  useEffect(() => {
    if (!gameEngineRef.current) {
      console.log("🎮 Initializing new GameEngine");
      gameEngineRef.current = new GameEngine();
    }
  }, []);

  // Save game state to localStorage
  const saveGameState = (state: GameState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      console.log("💾 Game state saved to localStorage");
    } catch (error) {
      console.warn("Failed to save game state:", error);
    }
  };

  // Load game state from localStorage
  const loadGameState = (): GameState | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        // Only restore if game was active and has moves left
        if (state.gameActive && state.moves > 0) {
          console.log("📂 Loaded saved game state:", state);
          return state;
        }
      }
    } catch (error) {
      console.warn("Failed to load game state:", error);
    }
    return null;
  };

  // Clear saved game state
  const clearGameState = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log("🗑️ Cleared saved game state");
    } catch (error) {
      console.warn("Failed to clear game state:", error);
    }
  };

  const startNewGame = () => {
    if (!gameEngineRef.current) {
      console.error("❌ GameEngine not initialized");
      return;
    }

    console.log("🎮 Starting new POOPEE Crush game");
    const engine = gameEngineRef.current;
    
    // Generate a new board using the engine
    const newBoard = engine.generateInitialBoard();
    
    const newState: GameState = {
      board: newBoard,
      score: 0,
      moves: 30,
      gameActive: true,
      selectedTile: null
    };

    setGameState(newState);
    saveGameState(newState);
    setAnimations([]);
    
    console.log("🎮 New game started with board:", newBoard);
  };

  const resumeGame = () => {
    const savedState = loadGameState();
    if (savedState && gameEngineRef.current) {
      console.log("🔄 Resuming saved game");
      const engine = gameEngineRef.current;
      
      // Restore the engine state to match the saved state
      engine.setBoard(savedState.board);
      engine.setScore(savedState.score);
      
      // Set the component state
      setGameState(savedState);
      console.log("🔄 Game resumed successfully");
      return true;
    }
    return false;
  };

  const syncStateWithEngine = () => {
    if (!gameEngineRef.current) return gameState;
    
    const engine = gameEngineRef.current;
    const updatedState = {
      ...gameState,
      board: engine.getBoard(),
      score: engine.getScore()
    };
    
    console.log("🔄 Syncing state with engine - Score:", updatedState.score);
    return updatedState;
  };

  const handleTileClick = (row: number, col: number) => {
    if (!gameState.gameActive || gameState.moves <= 0 || !gameEngineRef.current) {
      console.log("🚫 Cannot handle tile click - game not active or no moves left");
      return;
    }

    const engine = gameEngineRef.current;
    console.log(`🎯 Tile clicked: (${row}, ${col})`);

    if (!gameState.selectedTile) {
      // Select tile
      const newState = {
        ...gameState,
        selectedTile: { row, col }
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
        console.log(`🔄 Attempting move from (${gameState.selectedTile.row}, ${gameState.selectedTile.col}) to (${row}, ${col})`);
        
        // Attempt move
        const moveSuccessful = engine.makeMove(
          gameState.selectedTile.row, gameState.selectedTile.col,
          row, col
        );

        if (moveSuccessful) {
          console.log("✅ Move successful!");
          const newMoves = gameState.moves - 1;
          
          // Get updated state from engine
          const syncedState = syncStateWithEngine();
          const newState: GameState = {
            ...syncedState,
            moves: newMoves,
            gameActive: newMoves > 0,
            selectedTile: null
          };

          setGameState(newState);
          
          if (newMoves > 0) {
            saveGameState(newState);
          } else {
            clearGameState();
            console.log("🏁 Game ended - no moves left");
            onGameEnd(newState.score, 30 - newMoves);
          }

          // Get and display animations
          const newAnimations = engine.getAnimations();
          if (newAnimations.length > 0) {
            console.log("🎬 Setting animations:", newAnimations);
            setAnimations(newAnimations);
          }
        } else {
          console.log("❌ Move failed - no valid matches");
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

  const quitGame = () => {
    if (gameState.gameActive) {
      console.log("🏁 Player quit the game");
      clearGameState();
      onGameEnd(gameState.score, 30 - gameState.moves);
      
      const newState: GameState = {
        board: [],
        score: 0,
        moves: 30,
        gameActive: false,
        selectedTile: null
      };
      setGameState(newState);
    }
  };

  return {
    gameState,
    animations,
    handleTileClick,
    startNewGame,
    resumeGame,
    quitGame
  };
};
