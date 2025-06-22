
import { TileType } from "./TileTypes";

interface GameBoardProps {
  board: TileType[][];
  onTileClick: (row: number, col: number) => void;
  selectedTile: {row: number, col: number} | null;
}

export const GameBoard = ({ board, onTileClick, selectedTile }: GameBoardProps) => {
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

  return (
    <div className="grid grid-cols-8 gap-1 max-w-lg mx-auto aspect-square">
      {board.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
          const isSelected = selectedTile?.row === rowIndex && selectedTile?.col === colIndex;
          
          return (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onTileClick(rowIndex, colIndex)}
              className={`
                aspect-square 
                bg-gray-700 
                hover:bg-gray-600 
                rounded-lg 
                text-2xl 
                transition-all 
                duration-200 
                active:scale-95
                ${isSelected ? 'ring-2 ring-yellow-400 bg-yellow-600/20' : ''}
                flex items-center justify-center
              `}
            >
              {getTileEmoji(tile)}
            </button>
          );
        })
      )}
    </div>
  );
};
