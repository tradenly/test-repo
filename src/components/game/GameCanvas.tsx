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

    // Set canvas size - reduced height by 5%
    canvas.width = 800;
    canvas.height = 570;

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
      private parallaxOffset = 0;

      constructor(context: CanvasRenderingContext2D, canvasElement: HTMLCanvasElement) {
        this.ctx = context;
        this.canvas = canvasElement;
        this.reset();
        this.bindEvents();
        this.render();
        console.log("Game engine initialized successfully");
      }

      cleanup() {
        console.log("Cleaning up game engine...");
        this.gameRunning = false;
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
        }
        this.eventListeners.forEach(removeListener => removeListener());
        this.eventListeners = [];
      }

      reset() {
        console.log("Resetting game state...");
        this.hippo = {
          x: 100,
          y: 285, // Adjusted for new canvas height (570/2 = 285)
          width: 60,
          height: 40,
          velocity: 0,
          rotation: 0
        };
        this.pipes = [];
        this.gameRunning = false;
        this.score = 0;
        this.pipesPassedCount = 0;
        this.parallaxOffset = 0;
        this.addPipe();
        if (!this.gameRunning) {
          this.render();
        }
      }

      bindEvents() {
        const handleInput = (e: Event) => {
          console.log("Input detected:", e.type);
          if (this.gameRunning) {
            this.hippo.velocity = -12; // Increased flap strength
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
        // Update parallax background
        this.parallaxOffset -= 1;

        // Update hippo physics
        this.hippo.velocity += 0.6; // gravity
        this.hippo.y += this.hippo.velocity;
        
        // Gradually rotate hippo based on velocity
        if (this.hippo.velocity > 0) {
          this.hippo.rotation = Math.min(this.hippo.rotation + 0.05, 0.5);
        }

        // Update pipes
        this.pipes.forEach(pipe => {
          pipe.x -= 4; // Slightly faster pipe movement
          
          if (!pipe.scored && pipe.x + pipe.width < this.hippo.x) {
            pipe.scored = true;
            this.score += 1;
            this.pipesPassedCount += 1;
            setScore(this.score);
            console.log("Score increased:", this.score);
          }
        });

        this.pipes = this.pipes.filter(pipe => pipe.x > -pipe.width);
        
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < 400) {
          this.addPipe();
        }

        this.checkCollisions();
      }

      addPipe() {
        const gapSize = 160;
        const minGapY = 80;
        const maxGapY = this.canvas.height - gapSize - 120;
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
        if (this.hippo.y + this.hippo.height > this.canvas.height - 60) {
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
        
        const duration = Math.floor((Date.now() - gameStartTime) / 1000);
        console.log("Game over - Score:", this.score, "Duration:", duration);
        setGameState('gameOver');
        onGameEnd(this.score, this.pipesPassedCount, duration);
      }

      render() {
        try {
          // Enhanced sky gradient background
          const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
          gradient.addColorStop(0, '#87CEEB');
          gradient.addColorStop(0.3, '#98D8E8');
          gradient.addColorStop(0.7, '#B0E0E6');
          gradient.addColorStop(1, '#F0F8FF');
          this.ctx.fillStyle = gradient;
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

          // Enhanced clouds
          this.drawEnhancedClouds();

          // Draw pipes with better styling
          this.pipes.forEach(pipe => this.drawEnhancedPipe(pipe));

          // Enhanced ground with texture
          this.drawEnhancedGround();

          // Draw hippo with enhanced sprite
          this.drawEnhancedHippo();

          // Enhanced score display
          this.drawEnhancedScore();
        } catch (error) {
          console.error("Error in render:", error);
        }
      }

      drawEnhancedClouds() {
        this.ctx.fillStyle = 'white';
        this.ctx.globalAlpha = 0.8;
        
        for (let i = 0; i < 4; i++) {
          const x = (i * 250) + 30 + (this.parallaxOffset * 0.3);
          const y = 60 + (i * 20);
          
          // Multi-layered clouds
          this.ctx.beginPath();
          this.ctx.arc(x, y, 20, 0, Math.PI * 2);
          this.ctx.arc(x + 20, y, 30, 0, Math.PI * 2);
          this.ctx.arc(x + 40, y, 25, 0, Math.PI * 2);
          this.ctx.arc(x + 60, y, 20, 0, Math.PI * 2);
          this.ctx.fill();
        }
        
        this.ctx.globalAlpha = 1;
      }

      drawEnhancedPipe(pipe: any) {
        // Bamboo-style pipes with texture
        const gradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
        gradient.addColorStop(0, '#228B22');
        gradient.addColorStop(0.5, '#32CD32');
        gradient.addColorStop(1, '#228B22');
        
        this.ctx.fillStyle = gradient;
        
        // Top pipe
        this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        
        // Bottom pipe
        this.ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, pipe.bottomHeight);
        
        // Enhanced pipe caps with shadows
        this.ctx.fillStyle = '#32CD32';
        this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 35, pipe.width + 10, 35);
        this.ctx.fillRect(pipe.x - 5, pipe.bottomY, pipe.width + 10, 35);
        
        // Add bamboo rings
        this.ctx.strokeStyle = '#1F5F1F';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < pipe.topHeight; i += 40) {
          this.ctx.beginPath();
          this.ctx.moveTo(pipe.x, i);
          this.ctx.lineTo(pipe.x + pipe.width, i);
          this.ctx.stroke();
        }
        for (let i = pipe.bottomY; i < this.canvas.height; i += 40) {
          this.ctx.beginPath();
          this.ctx.moveTo(pipe.x, i);
          this.ctx.lineTo(pipe.x + pipe.width, i);
          this.ctx.stroke();
        }
      }

      drawEnhancedGround() {
        // Water/river ground
        const groundGradient = this.ctx.createLinearGradient(0, this.canvas.height - 60, 0, this.canvas.height);
        groundGradient.addColorStop(0, '#4682B4');
        groundGradient.addColorStop(0.5, '#5F9EA0');
        groundGradient.addColorStop(1, '#2F4F4F');
        
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.canvas.height - 60, this.canvas.width, 60);
        
        // Add water ripples
        this.ctx.strokeStyle = '#87CEEB';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.5;
        for (let i = 0; i < this.canvas.width; i += 50) {
          this.ctx.beginPath();
          this.ctx.arc(i + (this.parallaxOffset % 50), this.canvas.height - 30, 10, 0, Math.PI, false);
          this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1;
      }

      drawEnhancedHippo() {
        this.ctx.save();
        this.ctx.translate(this.hippo.x + this.hippo.width/2, this.hippo.y + this.hippo.height/2);
        this.ctx.rotate(this.hippo.rotation);
        
        // Enhanced hippo sprite - no external images, all drawn
        // Main hippo body with gradient
        const hippoGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, this.hippo.width/2);
        hippoGradient.addColorStop(0, '#A0522D');
        hippoGradient.addColorStop(1, '#8B4513');
        this.ctx.fillStyle = hippoGradient;
        
        // Main body (rounded rectangle)
        this.ctx.beginPath();
        this.ctx.roundRect(-this.hippo.width/2, -this.hippo.height/2, this.hippo.width, this.hippo.height, 8);
        this.ctx.fill();
        
        // Enhanced eyes with white sclera
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(-8, -12, 8, 0, Math.PI * 2);
        this.ctx.arc(8, -12, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pupils
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(-8, -12, 4, 0, Math.PI * 2);
        this.ctx.arc(8, -12, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye highlights
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(-6, -14, 2, 0, Math.PI * 2);
        this.ctx.arc(10, -14, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Snout
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.roundRect(-12, -5, 24, 10, 5);
        this.ctx.fill();
        
        // Nostrils
        this.ctx.fillStyle = '#654321';
        this.ctx.beginPath();
        this.ctx.arc(-4, -2, 2, 0, Math.PI * 2);
        this.ctx.arc(4, -2, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ears
        this.ctx.fillStyle = '#A0522D';
        this.ctx.beginPath();
        this.ctx.arc(-20, -20, 8, 0, Math.PI * 2);
        this.ctx.arc(20, -20, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
      }

      drawEnhancedScore() {
        // Score background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(this.canvas.width/2 - 50, 10, 100, 50);
        
        // Score text with outline
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.strokeText(this.score.toString(), this.canvas.width / 2, 45);
        this.ctx.fillText(this.score.toString(), this.canvas.width / 2, 45);
      }
    }

    try {
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
  }, []);

  return (
    <div className="flex flex-col lg:flex-row items-start gap-3">
      <canvas 
        ref={canvasRef}
        className="border-2 border-gray-300 rounded-lg shadow-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      <div className="flex flex-col gap-2">
        {gameState === 'menu' && (
          <Card className="bg-gray-800/90 border-gray-700 p-2 w-28">
            <h3 className="text-xs font-bold text-white mb-1">🦛 Hippos</h3>
            <p className="text-gray-300 text-xs mb-1">
              Click/Space to flap!
            </p>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coins className="h-3 w-3 text-yellow-400" />
              <span className="text-white text-xs">{credits}</span>
            </div>
            <Button 
              onClick={startGame} 
              disabled={!canPlay || !isInitialized}
              className="bg-green-600 hover:bg-green-500 w-full text-xs"
              size="sm"
            >
              <Play className="h-3 w-3 mr-1" />
              {!isInitialized ? 'Loading...' : canPlay ? 'Start' : 'No Credits'}
            </Button>
          </Card>
        )}

        {gameState === 'gameOver' && (
          <Card className="bg-gray-800/90 border-gray-700 p-2 w-28">
            <h3 className="text-xs font-bold text-white mb-1">Game Over!</h3>
            <p className="text-gray-300 text-xs mb-1">Score: {score}</p>
            <div className="flex flex-col gap-1">
              <Button onClick={resetGame} variant="outline" size="sm" className="w-full text-xs py-1">
                <RotateCcw className="h-3 w-3 mr-1" />
                Restart
              </Button>
              <Button 
                onClick={startGame} 
                disabled={!canPlay || !isInitialized}
                className="bg-green-600 hover:bg-green-500 w-full text-xs py-1"
                size="sm"
              >
                <Play className="h-3 w-3 mr-1" />
                Again
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
