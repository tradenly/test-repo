
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Coins, Play, RotateCcw, Shield, Gauge } from "lucide-react";
import type { GameSpeed } from './useGameState';

interface GameMenuProps {
  credits: number;
  totalShields: number;
  canPlay: boolean;
  isInitialized: boolean;
  gameSpeed: GameSpeed;
  onStartGame: () => void;
  onBuyShields: () => void;
  onSpeedChange: (speed: GameSpeed) => void;
  isPurchasing: boolean;
  gameMode?: 'flappy_hippos' | 'miss_poopee_man';
}

export const GameMenu = ({ 
  credits, 
  totalShields, 
  canPlay, 
  isInitialized, 
  gameSpeed,
  onStartGame, 
  onBuyShields,
  onSpeedChange,
  isPurchasing,
  gameMode = 'flappy_hippos'
}: GameMenuProps) => {
  const isFlappyHippos = gameMode === 'flappy_hippos';
  const isMissPoopeeMan = gameMode === 'miss_poopee_man';
  
  return (
    <Card className="bg-gray-800/90 border-gray-700 p-2 w-44">
      <h3 className="text-xs font-bold text-white mb-1">
        {isFlappyHippos ? '💩 Flappy Poop' : '💩 Miss POOPEE-Man'}
      </h3>
      <p className="text-gray-300 text-xs mb-1">
        {isFlappyHippos ? 'Click/Space to flap!' : 'Arrow keys to move!'}
      </p>
      <div className="flex items-center justify-center gap-1 mb-1">
        <Coins className="h-3 w-3 text-yellow-400" />
        <span className="text-white text-xs">{credits}</span>
      </div>
      <div className="flex items-center justify-center gap-1 mb-2">
        <Shield className="h-3 w-3 text-green-400" />
        <span className="text-white text-xs">
          {totalShields} {isFlappyHippos ? 'Shields' : 'Lives'}
        </span>
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
        {isFlappyHippos && (
          <Button 
            onClick={onBuyShields} 
            disabled={credits < 5 || isPurchasing}
            className="bg-blue-600 hover:bg-blue-500 w-full text-xs py-1"
            size="sm"
          >
            <Shield className="h-3 w-3 mr-1" />
            3 Shields (5💰)
          </Button>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Gauge className="h-3 w-3 text-purple-400" />
            <span className="text-white text-xs">Speed</span>
          </div>
          <Select value={gameSpeed} onValueChange={onSpeedChange}>
            <SelectTrigger className="w-full h-7 text-xs bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="beginner" className="text-white hover:bg-gray-700">Beginner</SelectItem>
              <SelectItem value="moderate" className="text-white hover:bg-gray-700">Moderate</SelectItem>
              <SelectItem value="advanced" className="text-white hover:bg-gray-700">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};

interface GameOverProps {
  score: number;
  currentShields: number;
  totalShields: number;
  credits: number;
  canPlay: boolean;
  isInitialized: boolean;
  gameSpeed: GameSpeed;
  onResetGame: () => void;
  onStartGame: () => void;
  onBuyShields: () => void;
  onSpeedChange: (speed: GameSpeed) => void;
  isPurchasing: boolean;
  gameMode?: 'flappy_hippos' | 'miss_poopee_man';
}

export const GameOver = ({ 
  score, 
  currentShields, 
  totalShields, 
  credits, 
  canPlay, 
  isInitialized, 
  gameSpeed,
  onResetGame, 
  onStartGame, 
  onBuyShields,
  onSpeedChange,
  isPurchasing,
  gameMode = 'flappy_hippos'
}: GameOverProps) => {
  const isFlappyHippos = gameMode === 'flappy_hippos';
  
  return (
    <Card className="bg-gray-800/90 border-gray-700 p-2 w-44">
      <h3 className="text-xs font-bold text-white mb-1">Game Over!</h3>
      <p className="text-gray-300 text-xs mb-1">Score: {score}</p>
      <p className="text-gray-300 text-xs mb-2">
        {isFlappyHippos ? 'Shields' : 'Lives'}: {currentShields}/{totalShields}
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
        {isFlappyHippos && (
          <Button 
            onClick={onBuyShields} 
            disabled={credits < 5 || isPurchasing}
            className="bg-blue-600 hover:bg-blue-500 w-full text-xs py-1"
            size="sm"
          >
            <Shield className="h-3 w-3 mr-1" />
            3 Shields (5💰)
          </Button>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Gauge className="h-3 w-3 text-purple-400" />
            <span className="text-white text-xs">Speed</span>
          </div>
          <Select value={gameSpeed} onValueChange={onSpeedChange}>
            <SelectTrigger className="w-full h-7 text-xs bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="beginner" className="text-white hover:bg-gray-700">Beginner</SelectItem>
              <SelectItem value="moderate" className="text-white hover:bg-gray-700">Moderate</SelectItem>
              <SelectItem value="advanced" className="text-white hover:bg-gray-700">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};
