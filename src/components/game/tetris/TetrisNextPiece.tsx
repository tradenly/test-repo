
import React from 'react';
import { TetrisGameState } from './TetrisEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CELL_SIZE } from './TetrisPieces';

interface TetrisNextPieceProps {
  gameState: TetrisGameState | null;
}

export const TetrisNextPiece = ({ gameState }: TetrisNextPieceProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    if (canvasRef.current && gameState?.nextPiece) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      
      // Clear canvas
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const piece = gameState.nextPiece;
      console.log("🎨 Drawing next piece:", piece.type, "color:", piece.color);
      
      // Draw piece
      const scale = 0.6;
      const cellSize = CELL_SIZE * scale;
      const offsetX = (canvas.width - piece.shape[0].length * cellSize) / 2;
      const offsetY = (canvas.height - piece.shape.length * cellSize) / 2;
      
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            ctx.fillStyle = piece.color;
            ctx.fillRect(
              offsetX + x * cellSize + 1,
              offsetY + y * cellSize + 1,
              cellSize - 2,
              cellSize - 2
            );
          }
        }
      }
    }
  }, [gameState?.nextPiece]);

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm">Next Piece</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex justify-center">
        {gameState?.nextPiece ? (
          <canvas 
            ref={canvasRef} 
            width={120} 
            height={80} 
            className="rounded border border-gray-600" 
          />
        ) : (
          <div className="w-[120px] h-[80px] bg-gray-700/30 rounded border border-gray-600 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No piece</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
