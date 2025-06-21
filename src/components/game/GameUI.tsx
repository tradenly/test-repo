
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coins, Play, RotateCcw, Shield } from "lucide-react";

interface GameMenuProps {
  credits: number;
  totalShields: number;
  canPlay: boolean;
  isInitialized: boolean;
  onStartGame: () => void;
  onBuyShields: () => void;
  isPurchasing: boolean;
}

export const GameMenu = ({ 
  credits, 
  totalShields, 
  canPlay, 
  isInitialized, 
  onStartGame, 
  onBuyShields, 
  isPurchasing 
}: GameMenuProps) => (
  <Card className="bg-gray-800/90 border-gray-700 p-2 w-32">
    <h3 className="text-xs font-bold text-white mb-1">💩 Flappy Poop</h3>
    <p className="text-gray-300 text-xs mb-1">
      Click/Space to flap!
    </p>
    <div className="flex items-center justify-center gap-1 mb-1">
      <Coins className="h-3 w-3 text-yellow-400" />
      <span className="text-white text-xs">{credits}</span>
    </div>
    <div className="flex items-center justify-center gap-1 mb-2">
      <Shield className="h-3 w-3 text-green-400" />
      <span className="text-white text-xs">{totalShields} Shields</span>
    </div>
    <div className="flex flex-col gap-1">
      <Button 
        onClick={onStartGame} 
        disabled={!canPlay || !isInitialized}
        className="bg-green-600 hover:bg-green-500 w-full text-xs py-1"
        size="sm"
      >
        <Play className="h-3 w-3 mr-1" />
        {!isInitialized ? 'Loading...' : canPlay ? 'Start' : 'No Credits'}
      </Button>
      <Button 
        onClick={onBuyShields} 
        disabled={credits < 5 || isPurchasing}
        className="bg-blue-600 hover:bg-blue-500 w-full text-xs py-1"
        size="sm"
      >
        <Shield className="h-3 w-3 mr-1" />
        Buy 3 Shields (5💰)
      </Button>
    </div>
  </Card>
);

interface GameOverProps {
  score: number;
  currentShields: number;
  totalShields: number;
  credits: number;
  canPlay: boolean;
  isInitialized: boolean;
  onResetGame: () => void;
  onStartGame: () => void;
  onBuyShields: () => void;
  isPurchasing: boolean;
}

export const GameOver = ({ 
  score, 
  currentShields, 
  totalShields, 
  credits, 
  canPlay, 
  isInitialized, 
  onResetGame, 
  onStartGame, 
  onBuyShields, 
  isPurchasing 
}: GameOverProps) => (
  <Card className="bg-gray-800/90 border-gray-700 p-2 w-36">
    <h3 className="text-xs font-bold text-white mb-1">Game Over!</h3>
    <p className="text-gray-300 text-xs mb-1">Score: {score}</p>
    <p className="text-gray-300 text-xs mb-2">
      Shields: {currentShields}/{totalShields}
    </p>
    <div className="flex flex-col gap-1">
      <Button onClick={onResetGame} variant="outline" size="sm" className="w-full text-xs py-1">
        <RotateCcw className="h-3 w-3 mr-1" />
        Restart
      </Button>
      <Button 
        onClick={onStartGame} 
        disabled={!canPlay || !isInitialized}
        className="bg-green-600 hover:bg-green-500 w-full text-xs py-1"
        size="sm"
      >
        <Play className="h-3 w-3 mr-1" />
        Again
      </Button>
      <Button 
        onClick={onBuyShields} 
        disabled={credits < 5 || isPurchasing}
        className="bg-blue-600 hover:bg-blue-500 w-full text-xs py-1"
        size="sm"
      >
        <Shield className="h-3 w-3 mr-1" />
        Buy 3 Shields (5💰)
      </Button>
    </div>
  </Card>
);
