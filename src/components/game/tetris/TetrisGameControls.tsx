
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameSpeed } from './TetrisEngine';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TetrisGameControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  selectedSpeed: GameSpeed;
  creditsBalance: number;
  onStart: (speed: GameSpeed) => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: GameSpeed) => void;
}

export const TetrisGameControls = ({
  isPlaying,
  isPaused,
  isGameOver,
  selectedSpeed,
  creditsBalance,
  onStart,
  onPause,
  onReset,
  onSpeedChange
}: TetrisGameControlsProps) => {
  const isMobile = useIsMobile();

  const handleStart = () => {
    if (creditsBalance < 1) {
      alert("You need at least 1 credit to play!");
      return;
    }
    console.log("🎮 Starting game with speed:", selectedSpeed);
    onStart(selectedSpeed);
  };

  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader className={`pb-2 ${isMobile ? 'px-3 py-2' : ''}`}>
        <CardTitle className={`text-white ${isMobile ? 'text-sm' : 'text-sm'}`}>Game Controls</CardTitle>
      </CardHeader>
      <CardContent className={`pt-0 space-y-3 ${isMobile ? 'px-3 pb-3' : ''}`}>
        <div className="space-y-2">
          <label className="text-xs text-gray-300">Game Speed</label>
          <Select value={selectedSpeed} onValueChange={(value: GameSpeed) => onSpeedChange(value)}>
            <SelectTrigger className={`bg-gray-700 border-gray-600 text-white ${isMobile ? 'h-10' : 'h-8'} text-sm`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="beginner" className="text-white hover:bg-gray-600">
                🐌 Beginner
              </SelectItem>
              <SelectItem value="moderate" className="text-white hover:bg-gray-600">
                🚶 Moderate
              </SelectItem>
              <SelectItem value="advanced" className="text-white hover:bg-gray-600">
                🏃 Advanced
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {!isPlaying || isGameOver ? (
            <Button 
              onClick={handleStart} 
              disabled={creditsBalance < 1}
              className={`w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 ${isMobile ? 'h-12 text-base' : 'h-8'} text-sm font-bold`}
            >
              <Play className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'} mr-1`} />
              {isGameOver ? 'Restart Game' : 'Start Playing'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={onPause} 
                variant="outline"
                className={`flex-1 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white ${isMobile ? 'h-10' : 'h-8'} text-sm`}
              >
                <Pause className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'} mr-1`} />
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button 
                onClick={onReset} 
                variant="outline"
                className={`flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white ${isMobile ? 'h-10' : 'h-8'} text-sm`}
              >
                <RotateCcw className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'} mr-1`} />
                Reset
              </Button>
            </div>
          )}
        </div>

        <div className="text-center space-y-1">
          <div className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-300`}>
            Cost: <span className="text-yellow-400 font-bold">1 Credit</span>
          </div>
          <div className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-400`}>
            Balance: <span className="text-green-400">{creditsBalance} credits</span>
          </div>
        </div>

        {!isMobile && (
          <div className="text-xs text-gray-400 space-y-1">
            <p><strong>Controls:</strong></p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span>←→ Move</span>
              <span>↑ Rotate</span>
              <span>↓ Soft Drop</span>
              <span>Space Hard Drop</span>
              <span>P Pause</span>
              <span>R Restart</span>
            </div>
          </div>
        )}

        {isMobile && (
          <div className="text-xs text-gray-400">
            <p className="font-semibold mb-1">Mobile Controls:</p>
            <p>Use the touch controls below the game to play. Touch and hold buttons for continuous movement.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
