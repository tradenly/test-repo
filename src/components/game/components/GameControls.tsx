
import React from 'react';
import { GameMenu, GameOver } from '../GameUI';
import type { GameState } from '../useGameState';
import type { GameEngine } from '../GameEngine';

interface GameControlsProps {
  gameState: GameState;
  score: number;
  totalShields: number;
  credits: number;
  canPlay: boolean;
  isInitialized: boolean;
  gameRef: React.MutableRefObject<GameEngine | null>;
  onStartGame: () => void;
  onResetGame: () => void;
  onBuyShields: () => void;
  isPurchasing: boolean;
}

export const GameControls = ({
  gameState,
  score,
  totalShields,
  credits,
  canPlay,
  isInitialized,
  gameRef,
  onStartGame,
  onResetGame,
  onBuyShields,
  isPurchasing
}: GameControlsProps) => {
  if (gameState === 'menu') {
    return (
      <GameMenu 
        credits={credits}
        totalShields={totalShields}
        canPlay={canPlay}
        isInitialized={isInitialized}
        onStartGame={onStartGame}
        onBuyShields={onBuyShields}
        isPurchasing={isPurchasing}
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
        onResetGame={onResetGame}
        onStartGame={onStartGame}
        onBuyShields={onBuyShields}
        isPurchasing={isPurchasing}
      />
    );
  }

  return null;
};
