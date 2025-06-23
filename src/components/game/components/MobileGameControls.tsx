
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, RotateCcw, Shield, Gauge } from "lucide-react";
import type { GameSpeed } from '../useGameState';
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileGameControlsProps {
  gameState: 'menu' | 'starting' | 'playing' | 'gameOver';
  score: number;
  totalShields: number;
  credits: number;
  canPlay: boolean;
  isInitialized: boolean;
  gameSpeed: GameSpeed;
  countdown: number;
  onStartGame: () => void;
  onResetGame: () => void;
  onBuyShields: () => void;
  onSpeedChange: (speed: GameSpeed) => void;
  isPurchasing: boolean;
}

export const MobileGameControls = ({ 
  gameState,
  score, 
  totalShields, 
  credits, 
  canPlay, 
  isInitialized, 
  gameSpeed,
  countdown,
  onStartGame, 
  onResetGame, 
  onBuyShields,
  onSpeedChange,
  isPurchasing 
}: MobileGameControlsProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <Card className="bg-gray-800/90 border-gray-700 p-4 w-full">
      <div className="flex flex-col gap-3">
        {/* Game Info */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-2">💩 Flappy Hippos</h3>
          {gameState === 'starting' && (
            <p className="text-xl text-yellow-400 mb-2">Get Ready! {countdown}</p>
          )}
          {gameState === 'playing' && (
            <p className="text-sm text-gray-300 mb-2">Tap anywhere on the screen to flap!</p>
          )}
          {gameState === 'gameOver' && (
            <p className="text-lg text-yellow-400 mb-2">Score: {score}</p>
          )}
        </div>

        {/* Credits and Shields Info */}
        <div className="flex justify-center gap-4 mb-2">
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-yellow-400" />
            <span className="text-white text-sm">{credits}</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-white text-sm">{totalShields} Shields</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {/* UPDATED: Only show Full Reset button for gameOver state - Play Again is now centered on canvas */}
          {gameState === 'gameOver' && (
            <Button onClick={onResetGame} variant="outline" className="w-full text-base py-3">
              <RotateCcw className="h-4 w-4 mr-2" />
              Full Reset
            </Button>
          )}

          {/* Shield Purchase - available in menu and gameOver states */}
          {(gameState === 'menu' || gameState === 'gameOver') && (
            <Button 
              onClick={onBuyShields} 
              disabled={credits < 5 || isPurchasing}
              className="bg-blue-600 hover:bg-blue-500 w-full text-base py-3"
            >
              <Shield className="h-4 w-4 mr-2" />
              Buy 3 Shields (5💰)
            </Button>
          )}

          {/* Speed Control - available in menu and gameOver states */}
          {(gameState === 'menu' || gameState === 'gameOver') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <Gauge className="h-4 w-4 text-purple-400" />
                <span className="text-white text-sm">Game Speed</span>
              </div>
              <Select value={gameSpeed} onValueChange={onSpeedChange}>
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="beginner" className="text-white hover:bg-gray-700">Beginner</SelectItem>
                  <SelectItem value="moderate" className="text-white hover:bg-gray-700">Moderate</SelectItem>
                  <SelectItem value="advanced" className="text-white hover:bg-gray-700">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
