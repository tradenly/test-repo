
import React from 'react';
import { GameMenu, GameOver } from '../GameUI';
import type { GameState, GameSpeed } from '../useGameState';
import type { GameEngine } from '../GameEngine';

interface GameControlsProps {
  gameState: GameState;
  score: number;
  totalShields: number;
  credits: number;
  canPlay: boolean;
  isInitialized: boolean;
  gameSpeed: GameSpeed;
  gameRef: React.MutableRefObject<GameEngine | null>;
  onStartGame: () => void;
  onResetGame: () => void;
  onBuyShields: () => void;
  onSpeedChange: (speed: GameSpeed) => void;
  isPurchasing: boolean;
  gameMode?: 'flappy_hippos' | 'miss_poopee_man';
}

export const GameControls = ({
  gameState,
  score,
  totalShields,
  credits,
  canPlay,
  isInitialized,
  gameSpeed,
  gameRef,
  onStartGame,
  onResetGame,
  onBuyShields,
  onSpeedChange,
  isPurchasing,
  gameMode = 'flappy_hippos'
}: GameControlsProps) => {
  if (gameState === 'menu') {
    return (
      <GameMenu 
        credits={credits}
        totalShields={totalShields}
        canPlay={canPlay}
        isInitialized={isInitialized}
        gameSpeed={gameSpeed}
        onStartGame={onStartGame}
        onBuyShields={onBuyShields}
        onSpeedChange={onSpeedChange}
        isPurchasing={isPurchasing}
        gameMode={gameMode}
      />
    );
  }

  if (gameState === 'gameOver') {
    return (
      <GameOver 
        score={score}
        currentShields={gameRef.current?.getCurrentShields() || 0}
        totalShields={totalShields}
        credits={credits}
        canPlay={canPlay}
        isInitialized={isInitialized}
        gameSpeed={gameSpeed}
        onResetGame={onResetGame}
        onStartGame={onStartGame}
        onBuyShields={onBuyShields}
        onSpeedChange={onSpeedChange}
        isPurchasing={isPurchasing}
        gameMode={gameMode}
      />
    );
  }

  // During 'starting' and 'playing' states, don't show desktop controls
  return null;
};
