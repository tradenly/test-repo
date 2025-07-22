
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Gamepad2 } from "lucide-react";
import { SpaceInvadersEngine, GameState } from "@/components/game/space-invaders/SpaceInvadersEngine";
import { useGamePermissions } from "@/hooks/useGamePermissions";
import { GameDisabledBanner } from "@/components/dashboard/GameDisabledBanner";
import { useSpaceInvadersGameHandlers } from "./useSpaceInvadersGameHandlers";

interface SpaceInvadersGameAreaProps {
  onGameComplete?: (score: number, stats: any) => void;
}

export const SpaceInvadersGameArea = ({ onGameComplete }: SpaceInvadersGameAreaProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<SpaceInvadersEngine | null>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isGameRunning, setIsGameRunning] = useState(false);
  
  const { gameSettings, canPlay, showBanner, isLoading } = useGamePermissions('space_invaders');
  
  const {
    startGame,
    endGame,
    isStarting,
    error: gameError
  } = useSpaceInvadersGameHandlers();

  const gameLoop = useCallback((currentTime: number) => {
    if (!gameEngineRef.current || !isGameRunning) return;

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    gameEngineRef.current.update(deltaTime);
    gameEngineRef.current.render();
    
    const currentGameState = gameEngineRef.current.getGameState();
    setGameState(currentGameState);

    // Check for game end conditions
    if (currentGameState.gameStatus === 'gameOver' || currentGameState.gameStatus === 'victory') {
      handleGameEnd(currentGameState);
      return;
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [isGameRunning]);

  const handleGameEnd = useCallback(async (finalGameState: GameState) => {
    setIsGameRunning(false);
    
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
    if (!canvasRef.current || !canPlay) return;

    try {
      await startGame();
      
      // Initialize game engine
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
      
      gameEngineRef.current = new SpaceInvadersEngine(canvasRef.current);
      setIsGameRunning(true);
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }, [canPlay, startGame, gameLoop]);

  const handlePauseGame = useCallback(() => {
    if (gameEngineRef.current && isGameRunning) {
      gameEngineRef.current.pauseGame();
      setIsGameRunning(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [isGameRunning]);

  const handleResumeGame = useCallback(() => {
    if (gameEngineRef.current && !isGameRunning) {
      gameEngineRef.current.resumeGame();
      setIsGameRunning(true);
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [isGameRunning, gameLoop]);

  const handleResetGame = useCallback(() => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resetGame();
      setGameState(gameEngineRef.current.getGameState());
    }
    setIsGameRunning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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
    return <GameDisabledBanner gameTitle="Space Invaders" />;
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-purple-400" />
            🛸 Space Invaders
            {gameState && (
              <Badge variant={isGameRunning ? "default" : "secondary"}>
                {isGameRunning ? "Playing" : gameState.gameStatus}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Game Canvas */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border border-gray-600 bg-black rounded-lg"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>

          {/* Game Stats */}
          {gameState && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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

          {/* Game Controls */}
          <div className="flex flex-wrap gap-2 justify-center">
            {!isGameRunning && !gameState ? (
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
                ) : gameState?.gameStatus === 'paused' ? (
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

          {/* Game Instructions */}
          <div className="text-sm text-gray-400 text-center space-y-1">
            <div><strong>Controls:</strong> ← → Arrow keys to move, Space/W to shoot</div>
            <div><strong>Goal:</strong> Destroy all aliens before they reach the bottom</div>
            <div><strong>Scoring:</strong> Basic aliens = 10pts, Medium = 20pts, Boss = 30pts</div>
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
