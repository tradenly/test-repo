
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Play, RotateCcw } from "lucide-react";
import { PoopeeCrushGame } from "./game/PoopeeCrushGame";
import { DifficultySelector, DifficultyLevel } from "./game/DifficultySelector";

interface PoopeeCrushGameAreaProps {
  onGameEnd: (score: number, moves: number) => void;
  onGameStart: () => void;
  canPlay: boolean;
  credits: number;
  userId: string;
}

const DIFFICULTY_STORAGE_KEY = 'poopee-crush-difficulty';

export const PoopeeCrushGameArea = ({ 
  onGameEnd, 
  onGameStart, 
  canPlay, 
  credits,
  userId 
}: PoopeeCrushGameAreaProps) => {
  const [gameActive, setGameActive] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(() => {
    try {
      const saved = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
      return (saved as DifficultyLevel) || 'easy';
    } catch {
      return 'easy';
    }
  });

  // Save difficulty preference
  useEffect(() => {
    localStorage.setItem(DIFFICULTY_STORAGE_KEY, difficulty);
  }, [difficulty]);

  const handleStartGame = async () => {
    if (!canPlay) return;
    
    try {
      await onGameStart();
      setGameActive(true);
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  const handleEndGame = (score: number, moves: number) => {
    setGameActive(false);
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
          <PoopeeCrushGame 
            onGameEnd={handleEndGame} 
            userId={userId}
            difficulty={difficulty}
          />
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

          {/* Difficulty Selection */}
          <div className="max-w-sm mx-auto">
            <DifficultySelector
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              disabled={gameActive}
            />
          </div>

          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleStartGame}
              disabled={!canPlay}
              className="bg-blue-600 hover:bg-blue-500 text-white disabled:bg-gray-600"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Game
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
