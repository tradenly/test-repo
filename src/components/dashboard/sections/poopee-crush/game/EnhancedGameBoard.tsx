
import { useState, useEffect } from "react";
import { TileType, isSpecialTile } from "./EnhancedTileTypes";
import { AnimationEvent } from "./EnhancedGameEngine";

interface EnhancedGameBoardProps {
  board: TileType[][];
  onTileClick: (row: number, col: number) => void;
  selectedTile: {row: number, col: number} | null;
  hintTiles: {row: number, col: number}[];
  animations: AnimationEvent[];
}

export const EnhancedGameBoard = ({ 
  board, 
  onTileClick, 
  selectedTile, 
  hintTiles, 
  animations 
}: EnhancedGameBoardProps) => {
  const [animatingTiles, setAnimatingTiles] = useState<Set<string>>(new Set());
  const [specialEffects, setSpecialEffects] = useState<Set<string>>(new Set());
  const [cascadeEffect, setCascadeEffect] = useState<number>(0);

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
          }, 600);
        } else if (animation.type === 'special_effect') {
          // Add special effect animation
          const tileKeys = animation.specialEffect?.tiles?.map(tile => `${tile.row}-${tile.col}`) || [];
          setSpecialEffects(prev => new Set([...prev, ...tileKeys]));
          
          setTimeout(() => {
            setSpecialEffects(prev => {
              const newSet = new Set(prev);
              tileKeys.forEach(key => newSet.delete(key));
              return newSet;
            });
          }, 800);
        } else if (animation.type === 'cascade') {
          // Show cascade effect
          setCascadeEffect(animation.cascadeMultiplier || 1);
          setTimeout(() => setCascadeEffect(0), 1000);
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
      // Special tiles with distinct visuals
      case TileType.STRIPED_HORIZONTAL: return "⚡";
      case TileType.STRIPED_VERTICAL: return "⚡";
      case TileType.WRAPPED: return "🎁";
      case TileType.COLOR_BOMB: return "💣";
      case TileType.BLOCKED: return "🚫";
      default: return "💩";
    }
  };

  const getTileClasses = (rowIndex: number, colIndex: number, tile: TileType): string => {
    const isSelected = selectedTile?.row === rowIndex && selectedTile?.col === colIndex;
    const isAnimating = animatingTiles.has(`${rowIndex}-${colIndex}`);
    const isSpecialEffect = specialEffects.has(`${rowIndex}-${colIndex}`);
    const isHinted = hintTiles.some(hint => hint.row === rowIndex && hint.col === colIndex);
    const isBlocked = tile === TileType.BLOCKED;
    const isSpecial = isSpecialTile(tile);
    
    let classes = `
      aspect-square 
      bg-gray-700 
      hover:bg-gray-600 
      rounded-lg 
      text-2xl 
      transition-all 
      duration-300 
      active:scale-95
      flex items-center justify-center
      cursor-pointer
      border-2 border-transparent
      relative
    `;

    if (isBlocked) {
      classes += " bg-gray-900 cursor-not-allowed opacity-80";
    } else if (isSelected) {
      classes += " ring-2 ring-yellow-400 bg-yellow-600/20 border-yellow-400 scale-105";
    } else if (isHinted) {
      classes += " ring-2 ring-blue-400 bg-blue-600/20 border-blue-400 animate-pulse";
    } else if (isSpecial) {
      // Different colors for different special tiles
      if (tile === TileType.STRIPED_HORIZONTAL || tile === TileType.STRIPED_VERTICAL) {
        classes += " bg-yellow-600/30 border-yellow-400 shadow-lg shadow-yellow-400/20";
      } else if (tile === TileType.WRAPPED) {
        classes += " bg-green-600/30 border-green-400 shadow-lg shadow-green-400/20";
      } else if (tile === TileType.COLOR_BOMB) {
        classes += " bg-red-600/30 border-red-400 shadow-lg shadow-red-400/20 animate-pulse";
      }
    }

    if (isAnimating) {
      classes += " animate-pulse bg-red-500/50 scale-110 z-10";
    }

    if (isSpecialEffect) {
      classes += " bg-yellow-500/70 scale-125 animate-bounce z-20";
    }

    if (tile === TileType.EMPTY) {
      classes += " opacity-30 bg-gray-800";
    }

    return classes;
  };

  const getSpecialTileEffects = (tile: TileType): string => {
    if (!isSpecialTile(tile)) return "";
    
    switch (tile) {
      case TileType.STRIPED_HORIZONTAL:
        return "before:content-[''] before:absolute before:w-full before:h-1 before:bg-yellow-400 before:top-1/2 before:left-0 before:transform before:-translate-y-1/2";
      case TileType.STRIPED_VERTICAL:
        return "before:content-[''] before:absolute before:h-full before:w-1 before:bg-yellow-400 before:left-1/2 before:top-0 before:transform before:-translate-x-1/2";
      case TileType.WRAPPED:
        return "before:content-[''] before:absolute before:inset-1 before:border-2 before:border-green-400 before:rounded-lg";
      case TileType.COLOR_BOMB:
        return "shadow-lg shadow-red-500/50";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Cascade Effect Display */}
      {cascadeEffect > 1 && (
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400 animate-bounce">
            🔥 {cascadeEffect.toFixed(1)}x COMBO! 🔥
          </div>
        </div>
      )}

      {/* Game Instructions */}
      <div className="bg-gray-800/60 rounded-lg p-4 text-center">
        <h3 className="text-white font-semibold mb-2">Enhanced POOPEE Crush</h3>
        <div className="text-gray-300 text-sm space-y-1">
          <p>⚡ Striped tiles (4-match) clear rows/columns | 🎁 Wrapped tiles (L/T-match) explode 3x3</p>
          <p>💣 Color Bomb (5-match) clears all of one type | 🚫 Blocked tiles can't be moved</p>
          <p>💡 Blue glow = Hint | ⭐ Match special tiles or swap them for powerful effects!</p>
        </div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-8 gap-1 max-w-lg mx-auto aspect-square">
        {board.map((row, rowIndex) =>
          row.map((tile, colIndex) => {
            const specialEffectClasses = getSpecialTileEffects(tile);
            
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onTileClick(rowIndex, colIndex)}
                className={`${getTileClasses(rowIndex, colIndex, tile)} ${specialEffectClasses}`}
                disabled={tile === TileType.BLOCKED || tile === TileType.EMPTY}
                title={isSpecialTile(tile) ? `Special tile: ${tile} - Click to activate!` : `Tile: ${tile}`}
              >
                {tile !== TileType.EMPTY && getTileEmoji(tile)}
                
                {/* Special tile overlay effects */}
                {isSpecialTile(tile) && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-lg pointer-events-none" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Move Hints */}
      {selectedTile && (
        <div className="text-center">
          <p className="text-yellow-400 text-sm animate-pulse">
            ✨ Now click an adjacent tile to swap! Special tiles activate when moved! ✨
          </p>
        </div>
      )}

      {/* Hint Display */}
      {hintTiles.length > 0 && (
        <div className="text-center">
          <p className="text-blue-400 text-sm animate-pulse">
            💡 Hint: Try swapping the highlighted tiles!
          </p>
        </div>
      )}
    </div>
  );
};
