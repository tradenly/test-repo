
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
      gameEngineRef.current = new GameEngine();
    }
  }, []);

  // Save game state to localStorage
  const saveGameState = (state: GameState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    } catch (error) {
      console.warn("Failed to clear game state:", error);
    }
  };

  const startNewGame = () => {
    if (!gameEngineRef.current) return;

    const engine = gameEngineRef.current;
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
    
    console.log("🎮 New POOPEE Crush game started!");
  };

  const resumeGame = () => {
    const savedState = loadGameState();
    if (savedState && gameEngineRef.current) {
      // Restore the board state in the engine
      gameEngineRef.current = new GameEngine();
      setGameState(savedState);
      console.log("🔄 POOPEE Crush game resumed!");
      return true;
    }
    return false;
  };

  const handleTileClick = (row: number, col: number) => {
    if (!gameState.gameActive || gameState.moves <= 0 || !gameEngineRef.current) return;

    const engine = gameEngineRef.current;

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
        // Attempt move
        const moveSuccessful = engine.makeMove(
          gameState.selectedTile.row, gameState.selectedTile.col,
          row, col
        );

        if (moveSuccessful) {
          const newMoves = gameState.moves - 1;
          const newState: GameState = {
            board: [...engine.getBoard()],
            score: engine.getScore(),
            moves: newMoves,
            gameActive: newMoves > 0,
            selectedTile: null
          };

          setGameState(newState);
          
          if (newMoves > 0) {
            saveGameState(newState);
          } else {
            clearGameState();
            onGameEnd(newState.score, 30 - newMoves);
          }

          // Get and display animations
          const newAnimations = engine.getAnimations();
          setAnimations(newAnimations);
        } else {
          // Invalid move - just deselect
          const newState = {
            ...gameState,
            selectedTile: null
          };
          setGameState(newState);
          saveGameState(newState);

          // Show invalid move animation
          const invalidAnimations = engine.getAnimations();
          setAnimations(invalidAnimations);
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
