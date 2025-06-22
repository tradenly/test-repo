
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Play, RotateCcw } from "lucide-react";
import { PoopeeCrushGame } from "./game/PoopeeCrushGame";

interface PoopeeCrushGameAreaProps {
  onGameEnd: (score: number, moves: number) => void;
  onGameStart: () => void;
  canPlay: boolean;
  credits: number;
  userId: string;
}

const STORAGE_KEY = 'poopee-crush-enhanced-game-state';

export const PoopeeCrushGameArea = ({ 
  onGameEnd, 
  onGameStart, 
  canPlay, 
  credits,
  userId 
}: PoopeeCrushGameAreaProps) => {
  const [gameActive, setGameActive] = useState(false);
  const [hasResumableGame, setHasResumableGame] = useState(false);

  // Check for resumable game on component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const gameState = JSON.parse(saved);
        if (gameState.gameActive && gameState.moves > 0) {
          setHasResumableGame(true);
          setGameActive(true);
        }
      }
    } catch (error) {
      console.warn("Failed to check for resumable game:", error);
    }
  }, []);

  const handleStartGame = async () => {
    if (!canPlay) return;
    
    try {
      await onGameStart();
      setGameActive(true);
      setHasResumableGame(false);
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  const handleResumeGame = () => {
    setGameActive(true);
    setHasResumableGame(false);
  };

  const handleEndGame = (score: number, moves: number) => {
    setGameActive(false);
    setHasResumableGame(false);
    onGameEnd(score, moves);
  };

  if (gameActive) {
    return (
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            💩 POOPEE Crush Game
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PoopeeCrushGame onGameEnd={handleEndGame} userId={userId} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          💩 POOPEE Crush Game
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-4">
          <div className="text-gray-300">
            <p className="mb-2">Match 3 or more tiles to score points!</p>
            <p className="text-sm text-gray-400">
              Each game costs 1 credit. You have {credits.toFixed(2)} credits.
            </p>
          </div>

          {/* Game Rules */}
          <div className="bg-gray-700/30 rounded-lg p-4 text-left space-y-2">
            <h4 className="text-white font-semibold">🎮 How to Play:</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Click a tile to select it (yellow highlight)</li>
              <li>• Click an adjacent tile to swap positions</li>
              <li>• Match 3+ identical tiles in a row/column</li>
              <li>• Matched tiles disappear and new ones fall down</li>
              <li>• Chain combos for higher scores!</li>
              <li>• Game ends when you run out of moves</li>
            </ul>
          </div>

          <div className="flex gap-2 justify-center">
            {hasResumableGame && (
              <Button
                onClick={handleResumeGame}
                className="bg-green-600 hover:bg-green-500 text-white"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Resume Game
              </Button>
            )}
            
            <Button
              onClick={handleStartGame}
              disabled={!canPlay}
              className="bg-blue-600 hover:bg-blue-500 text-white disabled:bg-gray-600"
            >
              <Play className="mr-2 h-4 w-4" />
              {hasResumableGame ? "New Game" : "Start Game"}
              <Coins className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {!canPlay && (
            <p className="text-red-400 text-sm">
              You need at least 1 credit to play. Visit the Portfolio section to purchase more credits.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
