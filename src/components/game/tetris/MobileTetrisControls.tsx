
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileTetrisControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
}

export const MobileTetrisControls = ({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate
}: MobileTetrisControlsProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  const handleTouchStart = (action: () => void) => (e: React.TouchEvent) => {
    e.preventDefault();
    action();
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[200px]">
      <div className="text-sm text-white text-center mb-2">Touch Controls</div>
      
      {/* Top row - Rotate */}
      <div className="flex justify-center">
        <Button
          onTouchStart={handleTouchStart(onRotate)}
          className="w-16 h-16 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-colors"
          size="sm"
        >
          <RotateCw className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Middle row - Left, Down, Right */}
      <div className="flex justify-center gap-2">
        <Button
          onTouchStart={handleTouchStart(onMoveLeft)}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors"
          size="sm"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <Button
          onTouchStart={handleTouchStart(onMoveDown)}
          className="w-16 h-16 bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors"
          size="sm"
        >
          <ArrowDown className="h-6 w-6" />
        </Button>
        
        <Button
          onTouchStart={handleTouchStart(onMoveRight)}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors"
          size="sm"
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="text-xs text-gray-400 text-center mt-2">
        Tap to control blocks
      </div>
    </div>
  );
};
