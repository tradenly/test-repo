
import React from "react";
import { TileType } from "./EnhancedTileTypes";
import { AnimationEvent } from "./EnhancedGameEngine";

interface EnhancedGameBoardProps {
  board: TileType[][];
  onTileClick: (row: number, col: number) => void;
  selectedTile: {row: number, col: number} | null;
  hintTiles: {row: number, col: number}[];
  animations: AnimationEvent[];
  hammerMode?: boolean;
  onHammerTarget?: (row: number, col: number) => void;
}

export const EnhancedGameBoard = ({ 
  board, 
  onTileClick, 
  selectedTile, 
  hintTiles, 
  animations,
  hammerMode = false,
  onHammerTarget
}: EnhancedGameBoardProps) => {
  const getTileEmoji = (tile: TileType): string => {
    switch (tile) {
      case TileType.POOP: return "💩";
      case TileType.TOILET: return "🚽";
      case TileType.TOILET_PAPER: return "🧻";
      case TileType.FART: return "💨";
      case TileType.BANANA: return "🍌";
      case TileType.BELL: return "🔔";
      case TileType.STRIPED_HORIZONTAL: return "💩⚡";
      case TileType.STRIPED_VERTICAL: return "💩⬆️";
      case TileType.WRAPPED: return "💩💥";
      case TileType.COLOR_BOMB: return "💩🌈";
      case TileType.BLOCKED: return "🚫";
      case TileType.EMPTY: return "";
      default: return "💩";
    }
  };

  const getTileClassName = (row: number, col: number, tile: TileType): string => {
    let className = "w-12 h-12 flex items-center justify-center text-2xl rounded-lg border-2 cursor-pointer transition-all duration-200 ";
    
    // Handle hammer mode styling
    if (hammerMode && tile !== TileType.BLOCKED && tile !== TileType.EMPTY) {
      className += "border-red-400 bg-red-900/30 hover:bg-red-800/50 shadow-lg shadow-red-500/30 ";
    } else if (selectedTile && selectedTile.row === row && selectedTile.col === col) {
      className += "border-yellow-400 bg-yellow-900/50 shadow-lg shadow-yellow-500/50 ";
    } else if (hintTiles.some(hint => hint.row === row && hint.col === col)) {
      className += "border-green-400 bg-green-900/30 animate-pulse ";
    } else if (tile === TileType.BLOCKED) {
      className += "border-gray-600 bg-gray-800 cursor-not-allowed ";
    } else if (tile === TileType.EMPTY) {
      className += "border-gray-700 bg-gray-900/30 cursor-default ";
    } else {
      className += "border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 hover:border-gray-500 ";
    }
    
    // Add special tile effects
    if (tile === TileType.STRIPED_HORIZONTAL || tile === TileType.STRIPED_VERTICAL) {
      className += "shadow-lg shadow-blue-500/30 ";
    } else if (tile === TileType.WRAPPED) {
      className += "shadow-lg shadow-purple-500/30 ";
    } else if (tile === TileType.COLOR_BOMB) {
      className += "shadow-lg shadow-rainbow animate-pulse ";
    }
    
    return className;
  };

  const handleTileClick = (row: number, col: number) => {
    const tile = board[row][col];
    
    // Prevent clicks on blocked or empty tiles
    if (tile === TileType.BLOCKED || tile === TileType.EMPTY) {
      return;
    }
    
    // Handle hammer mode
    if (hammerMode && onHammerTarget) {
      onHammerTarget(row, col);
      return;
    }
    
    // Regular tile click
    if (!hammerMode) {
      onTileClick(row, col);
    }
  };

  // Simplified animation classes - only show active animations
  const getAnimationClasses = (row: number, col: number): string => {
    if (!animations || animations.length === 0) return "";
    
    const relevantAnimations = animations.filter(anim => {
      if (!anim.tiles) return false;
      return anim.tiles.some(tile => tile.row === row && tile.col === col);
    });
    
    if (relevantAnimations.length === 0) return "";
    
    // Only apply the most recent animation to prevent conflicts
    const latestAnimation = relevantAnimations[relevantAnimations.length - 1];
    
    switch (latestAnimation.type) {
      case 'match':
        return "animate-ping ";
      case 'drop':
        return "animate-bounce ";
      case 'invalid':
        return "animate-pulse ";
      default:
        return "";
    }
  };

  // Ensure board exists and has proper dimensions
  if (!board || board.length === 0 || !board[0] || board[0].length === 0) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="bg-gray-900/30 rounded-lg border border-gray-700 p-8">
          <div className="text-white text-center">Loading game board...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {hammerMode && (
        <div className="text-center mb-4">
          <div className="bg-red-900/30 border border-red-600 rounded-lg px-4 py-2">
            <span className="text-red-400 font-medium">🔨 Hammer Mode Active</span>
            <p className="text-sm text-red-300 mt-1">Click any tile to remove it instantly</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-8 gap-1 p-4 bg-gray-900/30 rounded-lg border border-gray-700">
        {board.map((row, rowIndex) =>
          row.map((tile, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`${getTileClassName(rowIndex, colIndex, tile)} ${getAnimationClasses(rowIndex, colIndex)}`}
              onClick={() => handleTileClick(rowIndex, colIndex)}
              title={hammerMode ? "Click to remove with hammer" : `Row ${rowIndex + 1}, Col ${colIndex + 1}`}
            >
              {getTileEmoji(tile)}
            </div>
          ))
        )}
      </div>
      
      {animations && animations.length > 0 && (
        <div className="text-xs text-gray-400 text-center">
          {animations.map(anim => (
            <div key={anim.id}>
              {anim.type === 'cascade' && `🔄 Cascade x${anim.cascadeMultiplier?.toFixed(1) || 1}`}
              {anim.type === 'match' && `✨ Match found!`}
              {anim.type === 'invalid' && `❌ Invalid move`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
