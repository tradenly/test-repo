
import { useState, useCallback, useRef } from 'react';
import { GameBoard, GameProgress, Position, Animation, EnhancedGameEngine, BoosterResult } from './EnhancedGameEngine';
import { BoosterType, BoosterManager } from './BoosterSystem';
import { DifficultyLevel } from './DifficultySelector';
import { TileType } from './EnhancedTileTypes';
import { useGameAudio } from '@/hooks/useGameAudio';

interface EnhancedGameState {
  board: GameBoard;
  gameProgress: GameProgress;
  selectedTile: Position | null;
  hintTiles: Position[];
  gameActive: boolean;
  gameOver: boolean;
}

const getTargetScoreForDifficulty = (difficulty: DifficultyLevel): number => {
  switch (difficulty) {
    case 'easy': return 5000;
    case 'medium': return 10000;
    case 'advanced': return 15000;
    default: return 5000;
  }
};

const getMovesForDifficulty = (difficulty: DifficultyLevel): number => {
  switch (difficulty) {
    case 'easy': return 30;
    case 'medium': return 25;
    case 'advanced': return 20;
    default: return 30;
  }
};

export const useEnhancedGameState = (
  difficulty: DifficultyLevel,
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
      moves: getMovesForDifficulty(difficulty),
      objectives: {},
      clearedTiles: 0,
      specialTilesCreated: 0,
      cascades: 0,
      comboMultiplier: 1,
      targetScore: getTargetScoreForDifficulty(difficulty),
      maxMoves: getMovesForDifficulty(difficulty),
      levelObjectives: {
        description: "Score as many points as possible!",
        requirements: []
      }
    },
    selectedTile: null,
    hintTiles: [],
    gameActive: false,
    gameOver: false
  }));

  const handleTileClick = useCallback((row: number, col: number) => {
    if (!gameState.gameActive || !gameEngineRef.current) return;

    const result = gameEngineRef.current.handleTileClick(row, col);
    
    if (result.boardChanged) {
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
            hintTiles: [] // Clear hints after a move
          };
          
          // Check if game is over (no moves left)
          if (newState.gameProgress.moves <= 0 && !newState.gameOver) {
            newState.gameOver = true;
            newState.gameActive = false;
            onGameEnd(newState.gameProgress.score);
          }
          
          return newState;
        });
      }, result.animations ? 600 : 0);
    } else {
      setGameState(prevState => ({
        ...prevState,
        selectedTile: result.selectedTile || null,
        hintTiles: [] // Clear hints when selecting tiles
      }));
    }
  }, [gameState.gameActive, onGameEnd, playSoundEffect]);

  const useBooster = useCallback((type: BoosterType): boolean => {
    if (!gameState.gameActive || !gameEngineRef.current) {
      console.error(`❌ [useEnhancedGameState] Cannot use booster ${type} - game not active or engine not ready`);
      return false;
    }

    console.log(`🔧 [useEnhancedGameState] Using booster: ${type}`);

    const result: BoosterResult = gameEngineRef.current.useBooster(type);
    
    if (result.success) {
      console.log(`✅ [useEnhancedGameState] Booster ${type} successful`);
      playSoundEffect('booster');
      
      // Handle hint booster specifically
      if (type === BoosterType.HINT) {
        const hintTiles = gameEngineRef.current.getHintTiles();
        console.log(`💡 [useEnhancedGameState] Got ${hintTiles.length} hint tiles`);
        setGameState(prevState => ({
          ...prevState,
          hintTiles: hintTiles
        }));
        return true;
      }
      
      // Handle shuffle booster that modifies the board
      if (result.newBoard) {
        console.log(`🔀 [useEnhancedGameState] Booster ${type} updated board`);
        setAnimations(result.animations || []);
        
        setTimeout(() => {
          setAnimations([]);
          
          const processedResult = gameEngineRef.current!.processBoard(result.newBoard!);
          
          setGameState(prevState => ({
            ...prevState,
            board: processedResult.board,
            gameProgress: {
              ...prevState.gameProgress,
              score: prevState.gameProgress.score + processedResult.scoreIncrease
            },
            selectedTile: null,
            hintTiles: []
          }));
        }, result.animations ? 600 : 0);
      }
    } else {
      console.error(`❌ [useEnhancedGameState] Booster ${type} failed`);
    }

    return result.success;
  }, [gameState.gameActive, playSoundEffect]);

  const startNewGame = useCallback(() => {
    console.log(`🎮 [Enhanced Game] Starting new game on ${difficulty} difficulty`);
    
    // Create a simple level config for continuous play
    const levelConfig = {
      level: 1,
      moves: getMovesForDifficulty(difficulty),
      requiredScore: getTargetScoreForDifficulty(difficulty),
      objectives: [],
      availableTileTypes: 4,
      specialTileSpawnRate: 0.05,
      difficulty: difficulty
    };
    
    const engine = new EnhancedGameEngine(levelConfig);
    const boosterSystem = new BoosterManager();
    
    gameEngineRef.current = engine;
    boosterSystemRef.current = boosterSystem;
    
    const initialBoard = engine.generateInitialBoard();
    
    setGameState({
      board: initialBoard,
      gameProgress: {
        currentLevel: 1,
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
          description: "Score as many points as possible!",
          requirements: []
        }
      },
      selectedTile: null,
      hintTiles: [],
      gameActive: true,
      gameOver: false
    });
    
    console.log(`🎮 [Enhanced Game] New game started`);
  }, [difficulty]);

  const quitGame = useCallback(() => {
    console.log('🚪 [Enhanced Game] Quitting game with score:', gameState.gameProgress.score);
    
    onGameEnd(gameState.gameProgress.score);
    
    setGameState(prevState => ({
      ...prevState,
      gameActive: false
    }));
  }, [gameState.gameProgress.score, onGameEnd]);

  const restartGame = useCallback(() => {
    console.log(`🔄 [Enhanced Game] Restarting game`);
    startNewGame();
  }, [startNewGame]);

  return {
    gameState,
    animations,
    handleTileClick,
    useBooster,
    startNewGame,
    quitGame,
    restartGame
  };
};
