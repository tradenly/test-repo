
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
    <div className="w-full bg-gray-800/80 border border-gray-600 rounded-lg p-3">
      <div className="text-xs text-white text-center mb-3 font-medium">Touch Controls</div>
      
      {/* Top row - Rotate and Hard Drop */}
      <div className="flex justify-center gap-4 mb-3">
        <Button
          onTouchStart={handleTouchAction(onRotate)}
          onMouseDown={handleTouchAction(onRotate)}
          className="w-16 h-16 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors flex flex-col items-center justify-center rounded-xl"
          size="sm"
        >
          <RotateCw className="h-6 w-6" />
          <span className="text-xs mt-1 font-bold">ROTATE</span>
        </Button>
        
        {onDrop && (
          <Button
            onTouchStart={handleTouchAction(onDrop)}
            onMouseDown={handleTouchAction(onDrop)}
            className="w-16 h-16 bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors flex flex-col items-center justify-center rounded-xl"
            size="sm"
          >
            <ArrowDown className="h-6 w-6" />
            <span className="text-xs mt-1 font-bold">DROP</span>
          </Button>
        )}
      </div>

      {/* Bottom row - Movement controls */}
      <div className="flex justify-center items-center gap-2">
        {/* Move Left */}
        <Button
          onTouchStart={handleTouchAction(onMoveLeft)}
          onMouseDown={handleTouchAction(onMoveLeft)}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors flex flex-col items-center justify-center rounded-xl"
          size="sm"
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="text-xs mt-1 font-bold">LEFT</span>
        </Button>
        
        {/* Soft Drop (Center) */}
        <Button
          onTouchStart={handleTouchAction(onMoveDown)}
          onMouseDown={handleTouchAction(onMoveDown)}
          className="w-16 h-16 bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors flex flex-col items-center justify-center rounded-xl"
          size="sm"
        >
          <ArrowDown className="h-6 w-6" />
          <span className="text-xs mt-1 font-bold">DOWN</span>
        </Button>
        
        {/* Move Right */}
        <Button
          onTouchStart={handleTouchAction(onMoveRight)}
          onMouseDown={handleTouchAction(onMoveRight)}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors flex flex-col items-center justify-center rounded-xl"
          size="sm"
        >
          <ArrowRight className="h-6 w-6" />
          <span className="text-xs mt-1 font-bold">RIGHT</span>
        </Button>
      </div>
      
      <div className="text-xs text-gray-300 text-center mt-3 leading-tight">
        Touch and hold for continuous movement • Use rotate to turn pieces
      </div>
    </div>
  );
};
