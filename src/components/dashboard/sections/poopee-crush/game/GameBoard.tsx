
import { useState, useEffect } from "react";
import { TileType } from "./TileTypes";
import { AnimationEvent } from "./GameEngine";

interface GameBoardProps {
  board: TileType[][];
  onTileClick: (row: number, col: number) => void;
  selectedTile: {row: number, col: number} | null;
  animations: AnimationEvent[];
}

export const GameBoard = ({ board, onTileClick, selectedTile, animations }: GameBoardProps) => {
  const [animatingTiles, setAnimatingTiles] = useState<Set<string>>(new Set());
  const [invalidMove, setInvalidMove] = useState<{row: number, col: number} | null>(null);

  useEffect(() => {
    if (animations.length > 0) {
      animations.forEach(animation => {
        if (animation.type === 'match') {
          // Add match animation
          const tileKeys = animation.tiles?.map(tile => `${tile.row}-${tile.col}`) || [];
          setAnimatingTiles(prev => new Set([...prev, ...tileKeys]));
          
          // Remove animation after delay
          setTimeout(() => {
            setAnimatingTiles(prev => {
              const newSet = new Set(prev);
              tileKeys.forEach(key => newSet.delete(key));
              return newSet;
            });
          }, 500);
        } else if (animation.type === 'invalid') {
          // Show invalid move feedback
          if (animation.fromTile) {
            setInvalidMove(animation.fromTile);
            setTimeout(() => setInvalidMove(null), 300);
          }
        }
      });
    }
  }, [animations]);

  const getTileEmoji = (tile: TileType): string => {
    switch (tile) {
      case TileType.POOP: return "💩";
      case TileType.TOILET: return "🚽";
      case TileType.TOILET_PAPER: return "🧻";
      case TileType.FART: return "💨";
      case TileType.BANANA: return "🍌";
      case TileType.BELL: return "🔔";
      default: return "💩";
    }
  };

  const getTileClasses = (rowIndex: number, colIndex: number, tile: TileType): string => {
    const isSelected = selectedTile?.row === rowIndex && selectedTile?.col === colIndex;
    const isAnimating = animatingTiles.has(`${rowIndex}-${colIndex}`);
    const isInvalid = invalidMove?.row === rowIndex && invalidMove?.col === colIndex;
    
    let classes = `
      aspect-square 
      bg-gray-700 
      hover:bg-gray-600 
      rounded-lg 
      text-2xl 
      transition-all 
      duration-200 
      active:scale-95
      flex items-center justify-center
      cursor-pointer
      border-2 border-transparent
    `;

    if (isSelected) {
      classes += " ring-2 ring-yellow-400 bg-yellow-600/20 border-yellow-400";
    }

    if (isAnimating) {
      classes += " animate-pulse bg-red-500/50 scale-110";
    }

    if (isInvalid) {
      classes += " bg-red-500/50 animate-bounce";
    }

    if (tile === TileType.EMPTY) {
      classes += " opacity-50";
    }

    return classes;
  };

  return (
    <div className="space-y-4">
      {/* Game Instructions */}
      <div className="bg-gray-800/60 rounded-lg p-4 text-center">
        <h3 className="text-white font-semibold mb-2">How to Play POOPEE Crush</h3>
        <div className="text-gray-300 text-sm space-y-1">
          <p>1. Click a tile to select it (yellow highlight)</p>
          <p>2. Click an adjacent tile to swap them</p>
          <p>3. Match 3+ tiles in a row/column to score points</p>
          <p>4. Invalid moves will flash red and revert</p>
        </div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-8 gap-1 max-w-lg mx-auto aspect-square">
        {board.map((row, rowIndex) =>
          row.map((tile, colIndex) => {
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onTileClick(rowIndex, colIndex)}
                className={getTileClasses(rowIndex, colIndex, tile)}
                disabled={tile === TileType.EMPTY}
              >
                {tile !== TileType.EMPTY && getTileEmoji(tile)}
              </button>
            );
          })
        )}
      </div>

      {/* Move Hints */}
      {selectedTile && (
        <div className="text-center">
          <p className="text-yellow-400 text-sm animate-pulse">
            Now click an adjacent tile to swap!
          </p>
        </div>
      )}
    </div>
  );
};
