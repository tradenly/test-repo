
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Pause, RotateCcw, Gamepad2, Info } from "lucide-react";
import { SpaceInvadersEngine, GameState, SpeedLevel } from "@/components/game/space-invaders/SpaceInvadersEngine";
import { SpaceInvadersSpeedSelector } from './SpaceInvadersSpeedSelector';
import { useGamePermissions } from "@/hooks/useGamePermissions";
import { GameDisabledBanner } from "@/components/dashboard/GameDisabledBanner";
import { useSpaceInvadersGameHandlers } from "./useSpaceInvadersGameHandlers";

interface SpaceInvadersGameAreaProps {
  onGameComplete?: (score: number, stats: any) => void;
}

export const SpaceInvadersGameArea = ({ onGameComplete }: SpaceInvadersGameAreaProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<SpaceInvadersEngine | null>(null);
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isGameActive, setIsGameActive] = useState(false); // Tracks if game engine is running
  const [selectedSpeed, setSelectedSpeed] = useState<SpeedLevel>('intermediate');
  
  const { gameSettings, canPlay, showBanner, isLoading } = useGamePermissions('space_invaders');
  
  const {
    startGame,
    endGame,
    isStarting,
    error: gameError
  } = useSpaceInvadersGameHandlers();

  // Game state polling to update UI
  useEffect(() => {
    if (!gameEngineRef.current || !isGameActive) return;

    const interval = setInterval(() => {
      if (gameEngineRef.current) {
        const currentState = gameEngineRef.current.getGameState();
        setGameState(currentState);

        // Check for game end conditions
        if (currentState.gameStatus === 'gameOver' || currentState.gameStatus === 'victory') {
          handleGameEnd(currentState);
        }
      }
    }, 100); // Poll every 100ms

    return () => clearInterval(interval);
  }, [isGameActive]);

  const handleGameEnd = useCallback(async (finalGameState: GameState) => {
    console.log("🏁 Game ended with status:", finalGameState.gameStatus);
    setIsGameActive(false);
    
    const gameStats = {
      score: finalGameState.score,
      wave: finalGameState.wave,
      aliensDestroyed: finalGameState.aliens.filter(a => !a.isAlive).length,
      totalAliens: finalGameState.aliens.length,
      accuracy: 100, // Could track bullets fired vs hits
      gameStatus: finalGameState.gameStatus
    };

    try {
      await endGame(finalGameState.score, gameStats);
      onGameComplete?.(finalGameState.score, gameStats);
    } catch (error) {
      console.error('Error ending game:', error);
    }
  }, [endGame, onGameComplete]);

  const handleStartGame = useCallback(async () => {
    if (!canvasRef.current || !canPlay) {
      console.error('Cannot start game: canvas or permissions not available');
      return;
    }

    try {
      console.log('🚀 Starting Space Invaders game...');
      await startGame();
      
      // Clean up previous game engine
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
      
      // Initialize new game engine
      console.log('🎮 Initializing game engine...');
      gameEngineRef.current = new SpaceInvadersEngine(canvasRef.current);
      
      // Start the game
      gameEngineRef.current.start(selectedSpeed);
      
      // Get initial game state
      const initialState = gameEngineRef.current.getGameState();
      setGameState(initialState);
      
      console.log('✅ Game started successfully');
      setIsGameActive(true);
      
    } catch (error) {
      console.error('❌ Error starting game:', error);
    }
  }, [canPlay, startGame, selectedSpeed]);

  const handlePauseGame = useCallback(() => {
    if (gameEngineRef.current && gameState?.gameStatus === 'playing') {
      gameEngineRef.current.pauseGame();
      console.log("⏸️ Game paused");
    }
  }, [gameState?.gameStatus]);

  const handleResumeGame = useCallback(() => {
    if (gameEngineRef.current && gameState?.gameStatus === 'paused') {
      gameEngineRef.current.resumeGame();
      console.log("▶️ Game resumed");
    }
  }, [gameState?.gameStatus]);

  const handleResetGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resetGame();
      setGameState(gameEngineRef.current.getGameState());
    }
    setIsGameActive(false);
    console.log("🔄 Game reset");
  }, []);

  // Initialize canvas on mount
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set canvas size - reduced height
        canvas.width = 800;
        canvas.height = 500;
        
        // Draw initial background
        ctx.fillStyle = '#000011';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw welcome message
        ctx.fillStyle = '#ffffff';
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🛸 Space Invaders 🛸', canvas.width / 2, canvas.height / 2 - 60);
        
        ctx.font = '24px Arial';
        ctx.fillText('Click Start Game to Begin!', canvas.width / 2, canvas.height / 2);
        
        ctx.font = '16px Arial';
        ctx.fillText('Use arrow keys to move, Space to shoot', canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('Defend Earth from the 👻💩👾 alien invasion!', canvas.width / 2, canvas.height / 2 + 65);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading game...</div>
        </CardContent>
      </Card>
    );
  }

  if (showBanner) {
    return <GameDisabledBanner gameName="Space Invaders" />;
  }

  const isGameRunning = gameState?.gameStatus === 'playing';
  const isGamePaused = gameState?.gameStatus === 'paused';
  const canStartNewGame = !isGameActive || gameState?.gameStatus === 'gameOver' || gameState?.gameStatus === 'victory';

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-purple-400" />
                🛸 Space Invaders
                {gameState && (
                  <Badge variant={isGameRunning ? "default" : "secondary"}>
                    {gameState.gameStatus}
                  </Badge>
                )}
              </CardTitle>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-800 border-gray-700 text-white max-w-xs">
                    <div className="space-y-2 text-sm">
                      <div><strong>Controls:</strong> ← → Arrow keys to move, Space to shoot</div>
                      <div><strong>Goal:</strong> Destroy all aliens before they reach Earth!</div>
                      <div><strong>Scoring:</strong> Basic 👻 = 10pts, Medium 💩 = 20pts, Boss 👾 = 30pts</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Game Stats moved to header */}
            {gameState && (
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="text-gray-400">Score</div>
                  <div className="text-white font-bold">{gameState.score}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Lives</div>
                  <div className="text-white font-bold">{gameState.player.lives}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Wave</div>
                  <div className="text-white font-bold">{gameState.wave}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400">Aliens Left</div>
                  <div className="text-white font-bold">
                    {gameState.aliens.filter(a => a.isAlive).length}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Game Canvas */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="border border-gray-600 bg-black rounded-lg cursor-crosshair"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>

          {/* Speed Selector - only show when not playing */}
          {canStartNewGame && (
            <div className="flex justify-center mb-4">
              <SpaceInvadersSpeedSelector
                speed={selectedSpeed}
                onSpeedChange={setSelectedSpeed}
                disabled={isStarting || !canPlay}
              />
            </div>
          )}

          {/* Game Controls */}
          <div className="flex flex-wrap gap-2 justify-center">
            {canStartNewGame ? (
              <Button
                onClick={handleStartGame}
                disabled={isStarting || !canPlay}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-1" />
                {isStarting ? 'Starting...' : `Start Game (${gameSettings?.entry_cost_credits || 1} Credits)`}
              </Button>
            ) : (
              <>
                {isGameRunning ? (
                  <Button onClick={handlePauseGame} variant="outline">
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                ) : isGamePaused ? (
                  <Button onClick={handleResumeGame} className="bg-green-600 hover:bg-green-700">
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Button>
                ) : null}
                
                <Button onClick={handleResetGame} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </>
            )}
          </div>

          {gameError && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">
              {gameError}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
