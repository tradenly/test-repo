
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Play, Pause } from "lucide-react";
import { PoopeeCrushGame } from "./game/PoopeeCrushGame";

interface PoopeeCrushGameAreaProps {
  onGameEnd: (score: number, moves: number) => void;
  onGameStart: () => void;
  canPlay: boolean;
  credits: number;
}

export const PoopeeCrushGameArea = ({ 
  onGameEnd, 
  onGameStart, 
  canPlay, 
  credits 
}: PoopeeCrushGameAreaProps) => {
  const [gameActive, setGameActive] = useState(false);

  const handleStartGame = () => {
    if (!canPlay) return;
    onGameStart();
    setGameActive(true);
  };

  const handleEndGame = (score: number, moves: number) => {
    setGameActive(false);
    onGameEnd(score, moves);
  };

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          💩 POOPEE Crush Game
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!gameActive ? (
          <div className="text-center space-y-4">
            <div className="text-gray-300">
              <p className="mb-2">Match 3 or more tiles to score points!</p>
              <p className="text-sm text-gray-400">
                Each game costs 1 credit. You have {credits.toFixed(2)} credits.
              </p>
            </div>
            
            <Button
              onClick={handleStartGame}
              disabled={!canPlay}
              className="w-full max-w-md"
            >
              <Play className="mr-2 h-4 w-4" />
              {canPlay ? "Start New Game" : "Insufficient Credits"}
              <Coins className="ml-2 h-4 w-4" />
            </Button>

            {!canPlay && (
              <p className="text-red-400 text-sm">
                You need at least 1 credit to play. Visit the Portfolio section to purchase more credits.
              </p>
            )}
          </div>
        ) : (
          <PoopeeCrushGame onGameEnd={handleEndGame} />
        )}
      </CardContent>
    </Card>
  );
};
