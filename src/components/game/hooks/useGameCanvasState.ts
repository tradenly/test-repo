
import { useState, useRef } from 'react';
import { GameEngine } from '../GameEngine';

export const useGameCanvasState = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationRef = useRef(false);

  return {
    canvasRef,
    gameRef,
    isInitialized,
    setIsInitialized,
    initializationRef
  };
};
