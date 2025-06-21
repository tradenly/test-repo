
import { useState, useCallback } from 'react';

export type GameState = 'menu' | 'playing' | 'gameOver';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [purchasedShields, setPurchasedShields] = useState(0);

  // Always start with 3 base shields + any purchased shields
  const totalShields = 3 + purchasedShields;

  const startGame = useCallback(() => {
    console.log("🎮 Starting game with shields:", totalShields);
    setGameState('playing');
    setScore(0);
    setGameStartTime(Date.now());
  }, [totalShields]);

  const endGame = useCallback(() => {
    console.log("🏁 Game ended");
    setGameState('gameOver');
  }, []);

  const resetGame = useCallback(() => {
    console.log("🔄 Resetting game to fresh state");
    setGameState('menu');
    setScore(0);
    setPurchasedShields(0); // Reset purchased shields - back to 3 total
    console.log("🔄 Game reset complete - shields back to 3");
  }, []);

  const buyShields = useCallback(() => {
    const newPurchasedShields = purchasedShields + 3;
    console.log("💰 Shields purchased - updating from", totalShields, "to", 3 + newPurchasedShields);
    setPurchasedShields(newPurchasedShields);
  }, [purchasedShields, totalShields]);

  return {
    gameState,
    score,
    setScore,
    gameStartTime,
    purchasedShields,
    totalShields,
    startGame,
    endGame,
    resetGame,
    buyShields
  };
};
