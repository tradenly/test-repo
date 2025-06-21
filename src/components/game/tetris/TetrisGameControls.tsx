
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameSpeed } from './TetrisEngine';
import { Play, Pause, RotateCcw } from 'lucide-react';

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
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm">Game Controls</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="space-y-2">
          <label className="text-xs text-gray-300">Game Speed</label>
          <Select value={selectedSpeed} onValueChange={(value: GameSpeed) => onSpeedChange(value)}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-8 text-sm">
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
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 h-8 text-sm"
            >
              <Play className="h-3 w-3 mr-1" />
              {isGameOver ? 'Restart' : 'Start'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={onPause} 
                variant="outline"
                className="flex-1 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white h-8 text-sm"
              >
                <Pause className="h-3 w-3 mr-1" />
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button 
                onClick={onReset} 
                variant="outline"
                className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white h-8 text-sm"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
          )}
        </div>

        <div className="text-center space-y-1">
          <div className="text-xs text-gray-300">
            Cost: <span className="text-yellow-400 font-bold">1 Credit</span>
          </div>
          <div className="text-xs text-gray-400">
            Balance: <span className="text-green-400">{creditsBalance} credits</span>
          </div>
        </div>

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
      </CardContent>
    </Card>
  );
};
