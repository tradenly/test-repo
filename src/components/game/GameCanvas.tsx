
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coins, Play, RotateCcw } from "lucide-react";

interface GameCanvasProps {
  onGameEnd: (score: number, pipesPassedCount: number, duration: number) => void;
  onGameStart: () => void;
  canPlay: boolean;
  credits: number;
}

export const GameCanvas = ({ onGameEnd, onGameStart, canPlay, credits }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<any>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const startGame = useCallback(() => {
    if (!canPlay || !isInitialized || !gameRef.current) {
      console.log("Cannot start game - conditions not met:", { canPlay, isInitialized, gameRef: !!gameRef.current });
      return;
    }
    
    console.log("Starting game...");
    onGameStart();
    setGameState('playing');
    setScore(0);
    setGameStartTime(Date.now());
    
    gameRef.current.start();
  }, [canPlay, onGameStart, isInitialized]);

  const resetGame = useCallback(() => {
    console.log("Resetting game...");
    setGameState('menu');
    setScore(0);
    if (gameRef.current) {
      gameRef.current.reset();
    }
  }, []);

  const handleGameOver = useCallback((finalScore: number, pipesPassedCount: number) => {
    const duration = Math.floor((Date.now() - gameStartTime) / 1000);
    console.log("Game over - Score:", finalScore, "Duration:", duration);
    setGameState('gameOver');
    onGameEnd(finalScore, pipesPassedCount, duration);
  }, [gameStartTime, onGameEnd]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("Canvas not found");
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log("Canvas context not found");
      return;
    }

    console.log("Initializing game engine...");

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Game engine class
    class GameEngine {
      private ctx: CanvasRenderingContext2D;
      private canvas: HTMLCanvasElement;
      private hippo: any;
      private pipes: any[] = [];
      private gameRunning = false;
      private animationId: number | null = null;
      private score = 0;
      private pipesPassedCount = 0;
      private eventListeners: (() => void)[] = [];

      constructor(context: CanvasRenderingContext2D, canvasElement: HTMLCanvasElement) {
        this.ctx = context;
        this.canvas = canvasElement;
        this.reset();
        this.bindEvents();
        this.render(); // Initial render to show the game world
        console.log("Game engine initialized successfully");
      }

      cleanup() {
        console.log("Cleaning up game engine...");
        this.gameRunning = false;
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
        }
        // Remove all event listeners
        this.eventListeners.forEach(removeListener => removeListener());
        this.eventListeners = [];
      }

      reset() {
        console.log("Resetting game state...");
        this.hippo = {
          x: 100,
          y: 200,
          width: 48,
          height: 48,
          velocity: 0,
          rotation: 0
        };
        this.pipes = [];
        this.gameRunning = false;
        this.score = 0;
        this.pipesPassedCount = 0;
        this.addPipe();
        if (!this.gameRunning) {
          this.render(); // Render initial state
        }
      }

      bindEvents() {
        const handleInput = (e: Event) => {
          console.log("Input detected:", e.type);
          if (this.gameRunning) {
            this.hippo.velocity = -8;
            this.hippo.rotation = -0.3;
            console.log("Hippo flapped! New velocity:", this.hippo.velocity);
          }
        };

        const handleKeydown = (e: KeyboardEvent) => {
          if (e.code === 'Space') {
            e.preventDefault();
            handleInput(e);
          }
        };

        // Add event listeners and store cleanup functions
        this.canvas.addEventListener('click', handleInput);
        document.addEventListener('keydown', handleKeydown);

        this.eventListeners.push(
          () => this.canvas.removeEventListener('click', handleInput),
          () => document.removeEventListener('keydown', handleKeydown)
        );
      }

      start() {
        console.log("Starting game engine...");
        this.gameRunning = true;
        this.gameLoop();
      }

      gameLoop() {
        if (!this.gameRunning) {
          console.log("Game loop stopped - gameRunning is false");
          return;
        }

        try {
          this.update();
          this.render();
          this.animationId = requestAnimationFrame(() => this.gameLoop());
        } catch (error) {
          console.error("Error in game loop:", error);
          this.gameOver();
        }
      }

      update() {
        // Update hippo physics
        this.hippo.velocity += 0.5; // gravity
        this.hippo.y += this.hippo.velocity;
        
        // Gradually rotate hippo based on velocity
        if (this.hippo.velocity > 0) {
          this.hippo.rotation = Math.min(this.hippo.rotation + 0.05, 0.5);
        }

        // Update pipes
        this.pipes.forEach(pipe => {
          pipe.x -= 3;
          
          // Check if hippo passed pipe
          if (!pipe.scored && pipe.x + pipe.width < this.hippo.x) {
            pipe.scored = true;
            this.score += 1;
            this.pipesPassedCount += 1;
            setScore(this.score);
            console.log("Score increased:", this.score);
          }
        });

        // Remove off-screen pipes and add new ones
        this.pipes = this.pipes.filter(pipe => pipe.x > -pipe.width);
        
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < 400) {
          this.addPipe();
        }

        // Check collisions
        this.checkCollisions();
      }

      addPipe() {
        const gapSize = 140;
        const minGapY = 50;
        const maxGapY = this.canvas.height - gapSize - 100;
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

        this.pipes.push({
          x: this.canvas.width,
          topHeight: gapY,
          bottomY: gapY + gapSize,
          bottomHeight: this.canvas.height - (gapY + gapSize),
          width: 60,
          scored: false
        });
      }

      checkCollisions() {
        // Ground collision
        if (this.hippo.y + this.hippo.height > this.canvas.height - 50) {
          console.log("Ground collision detected");
          this.gameOver();
          return;
        }

        // Ceiling collision
        if (this.hippo.y < 0) {
          console.log("Ceiling collision detected");
          this.gameOver();
          return;
        }

        // Pipe collision
        this.pipes.forEach(pipe => {
          if (this.hippo.x + this.hippo.width > pipe.x && 
              this.hippo.x < pipe.x + pipe.width) {
            if (this.hippo.y < pipe.topHeight || 
                this.hippo.y + this.hippo.height > pipe.bottomY) {
              console.log("Pipe collision detected");
              this.gameOver();
            }
          }
        });
      }

      gameOver() {
        console.log("Game over triggered");
        this.gameRunning = false;
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
        }
        handleGameOver(this.score, this.pipesPassedCount);
      }

      render() {
        try {
          // Clear canvas with sky blue background
          this.ctx.fillStyle = '#87CEEB';
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

          // Draw clouds
          this.drawClouds();

          // Draw pipes
          this.pipes.forEach(pipe => this.drawPipe(pipe));

          // Draw ground
          this.ctx.fillStyle = '#8B4513';
          this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);

          // Draw hippo
          this.drawHippo();

          // Draw score
          this.ctx.fillStyle = 'white';
          this.ctx.font = 'bold 32px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(this.score.toString(), this.canvas.width / 2, 50);
        } catch (error) {
          console.error("Error in render:", error);
        }
      }

      drawClouds() {
        this.ctx.fillStyle = 'white';
        this.ctx.globalAlpha = 0.7;
        
        // Simple cloud shapes
        for (let i = 0; i < 3; i++) {
          const x = (i * 300) + 50;
          const y = 80 + (i * 30);
          this.ctx.beginPath();
          this.ctx.arc(x, y, 25, 0, Math.PI * 2);
          this.ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
          this.ctx.arc(x + 50, y, 25, 0, Math.PI * 2);
          this.ctx.fill();
        }
        
        this.ctx.globalAlpha = 1;
      }

      drawPipe(pipe: any) {
        this.ctx.fillStyle = '#228B22';
        
        // Top pipe
        this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        
        // Bottom pipe
        this.ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, pipe.bottomHeight);
        
        // Pipe caps
        this.ctx.fillStyle = '#32CD32';
        this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, pipe.width + 10, 30);
        this.ctx.fillRect(pipe.x - 5, pipe.bottomY, pipe.width + 10, 30);
      }

      drawHippo() {
        this.ctx.save();
        this.ctx.translate(this.hippo.x + this.hippo.width/2, this.hippo.y + this.hippo.height/2);
        this.ctx.rotate(this.hippo.rotation);
        
        // Hippo body
        this.ctx.fillStyle = '#8B4B8B';
        this.ctx.fillRect(-this.hippo.width/2, -this.hippo.height/2, this.hippo.width, this.hippo.height);
        
        // Hippo eyes
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(-15, -15, 12, 8);
        this.ctx.fillRect(3, -15, 12, 8);
        
        // Pupils
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(-12, -13, 4, 4);
        this.ctx.fillRect(6, -13, 4, 4);
        
        // Nostrils
        this.ctx.fillStyle = '#654365';
        this.ctx.fillRect(-8, -5, 3, 2);
        this.ctx.fillRect(5, -5, 3, 2);
        
        this.ctx.restore();
      }
    }

    try {
      // Clean up existing game engine if it exists
      if (gameRef.current) {
        gameRef.current.cleanup();
      }
      
      gameRef.current = new GameEngine(ctx, canvas);
      setIsInitialized(true);
      console.log("Game engine created and initialized");
    } catch (error) {
      console.error("Error creating game engine:", error);
    }

    return () => {
      console.log("Component unmounting, cleaning up...");
      if (gameRef.current) {
        gameRef.current.cleanup();
      }
    };
  }, []); // Remove handleGameOver from dependencies to prevent re-initialization

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas 
        ref={canvasRef}
        className="border-2 border-gray-300 rounded-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      {gameState === 'menu' && (
        <Card className="bg-gray-800/90 border-gray-700 p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-4">🦛 Flappy Hippos</h3>
          <p className="text-gray-300 mb-4">
            Click or press Space to flap! Avoid the pipes and earn credits!
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coins className="h-4 w-4 text-yellow-400" />
            <span className="text-white">Cost: 1 Credit | Balance: {credits}</span>
          </div>
          <Button 
            onClick={startGame} 
            disabled={!canPlay || !isInitialized}
            className="bg-green-600 hover:bg-green-500"
          >
            <Play className="h-4 w-4 mr-2" />
            {!isInitialized ? 'Loading...' : canPlay ? 'Start Game' : 'Insufficient Credits'}
          </Button>
        </Card>
      )}

      {gameState === 'gameOver' && (
        <Card className="bg-gray-800/90 border-gray-700 p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-4">Game Over!</h3>
          <p className="text-gray-300 mb-4">Final Score: {score}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={resetGame} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Menu
            </Button>
            <Button 
              onClick={startGame} 
              disabled={!canPlay || !isInitialized}
              className="bg-green-600 hover:bg-green-500"
            >
              <Play className="h-4 w-4 mr-2" />
              Play Again
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
