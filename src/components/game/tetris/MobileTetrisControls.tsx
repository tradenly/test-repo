
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ArrowDown, ArrowUp, RotateCw } from "lucide-react";

interface MobileTetrisControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onDrop?: () => void;
}

export const MobileTetrisControls = ({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onDrop
}: MobileTetrisControlsProps) => {
  const handleTouchAction = (action: () => void) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    action();
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-[280px] bg-gray-800/60 p-4 rounded-lg">
      <div className="text-sm text-white text-center mb-2 font-medium">Game Controls</div>
      
      {/* Top row - Rotate and Drop */}
      <div className="flex justify-center gap-3">
        <Button
          onTouchStart={handleTouchAction(onRotate)}
          onMouseDown={handleTouchAction(onRotate)}
          className="w-14 h-14 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors flex flex-col items-center justify-center"
          size="sm"
        >
          <RotateCw className="h-5 w-5" />
          <span className="text-xs mt-1">↻</span>
        </Button>
        
        {onDrop && (
          <Button
            onTouchStart={handleTouchAction(onDrop)}
            onMouseDown={handleTouchAction(onDrop)}
            className="w-14 h-14 bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors flex flex-col items-center justify-center"
            size="sm"
          >
            <ArrowDown className="h-5 w-5" />
            <span className="text-xs mt-1">Drop</span>
          </Button>
        )}
      </div>

      {/* Middle row - Directional movement */}
      <div className="grid grid-cols-3 gap-2 place-items-center">
        {/* Empty space */}
        <div></div>
        
        {/* Soft Drop */}
        <Button
          onTouchStart={handleTouchAction(onMoveDown)}
          onMouseDown={handleTouchAction(onMoveDown)}
          className="w-14 h-14 bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors flex flex-col items-center justify-center"
          size="sm"
        >
          <ArrowDown className="h-5 w-5" />
          <span className="text-xs mt-1">↓</span>
        </Button>
        
        {/* Empty space */}
        <div></div>
        
        {/* Move Left */}
        <Button
          onTouchStart={handleTouchAction(onMoveLeft)}
          onMouseDown={handleTouchAction(onMoveLeft)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors flex flex-col items-center justify-center"
          size="sm"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-xs mt-1">←</span>
        </Button>
        
        {/* Empty space for center */}
        <div></div>
        
        {/* Move Right */}
        <Button
          onTouchStart={handleTouchAction(onMoveRight)}
          onMouseDown={handleTouchAction(onMoveRight)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors flex flex-col items-center justify-center"
          size="sm"
        >
          <ArrowRight className="h-5 w-5" />
          <span className="text-xs mt-1">→</span>
        </Button>
      </div>
      
      <div className="text-xs text-gray-300 text-center mt-2">
        Touch controls • ← → move • ↓ soft drop • Drop = hard drop • ↻ rotate
      </div>
    </div>
  );
};
