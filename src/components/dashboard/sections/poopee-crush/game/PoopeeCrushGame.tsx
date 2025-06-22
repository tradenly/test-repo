
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameBoard } from "./GameBoard";
import { GameEngine } from "./GameEngine";
import { TileType } from "./TileTypes";

interface PoopeeCrushGameProps {
  onGameEnd: (score: number, moves: number) => void;
}

export const PoopeeCrushGame = ({ onGameEnd }: PoopeeCrushGameProps) => {
  const [gameEngine] = useState(() => new GameEngine());
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [board, setBoard] = useState<TileType[][]>(() => gameEngine.generateInitialBoard());
  const [selectedTile, setSelectedTile] = useState<{row: number, col: number} | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const updateGameState = useCallback(() => {
    setBoard([...gameEngine.getBoard()]);
    setScore(gameEngine.getScore());
  }, [gameEngine]);

  const handleTileClick = useCallback((row: number, col: number) => {
    if (gameOver || moves <= 0) return;

    if (!selectedTile) {
      setSelectedTile({ row, col });
    } else {
      if (selectedTile.row === row && selectedTile.col === col) {
        setSelectedTile(null);
        return;
      }

      const isAdjacent = gameEngine.areAdjacent(
        selectedTile.row, selectedTile.col,
        row, col
      );

      if (isAdjacent) {
        const moveSuccessful = gameEngine.makeMove(
          selectedTile.row, selectedTile.col,
          row, col
        );

        if (moveSuccessful) {
          setMoves(prev => prev - 1);
          updateGameState();
        }
      }

      setSelectedTile(null);
    }
  }, [selectedTile, gameOver, moves, gameEngine, updateGameState]);

  useEffect(() => {
    if (moves <= 0 && !gameOver) {
      setGameOver(true);
      onGameEnd(score, 30 - moves);
    }
  }, [moves, gameOver, score, onGameEnd]);

  const handleQuit = () => {
    setGameOver(true);
    onGameEnd(score, 30 - moves);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-white">
          <div className="text-2xl font-bold">Score: {score.toLocaleString()}</div>
          <div className="text-gray-400">Moves: {moves}</div>
        </div>
        <Button
          onClick={handleQuit}
          variant="outline"
          className="bg-red-600 hover:bg-red-500 border-red-500 text-white"
        >
          Quit Game
        </Button>
      </div>

      <Card className="bg-gray-900/50 border-gray-600">
        <CardContent className="p-4">
          <GameBoard
            board={board}
            onTileClick={handleTileClick}
            selectedTile={selectedTile}
          />
        </CardContent>
      </Card>

      {moves <= 0 && (
        <div className="text-center space-y-2">
          <div className="text-xl font-bold text-white">Game Over!</div>
          <div className="text-gray-400">Final Score: {score.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
};
