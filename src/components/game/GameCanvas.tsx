import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coins, Play, RotateCcw, Shield } from "lucide-react";
import { useSpendCredits } from "@/hooks/useCreditOperations";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { toast } from "sonner";

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
  const [shieldCount, setShieldCount] = useState(3); // Current shields in game
  const [purchasedShields, setPurchasedShields] = useState(0); // Extra shields bought
  
  const { user } = useUnifiedAuth();
  const spendCredits = useSpendCredits();

  const totalShields = 3 + purchasedShields;

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
    setPurchasedShields(0); // Reset purchased shields when restarting
    setShieldCount(3); // Always start with 3 shields
    if (gameRef.current) {
      gameRef.current.reset(3); // Always reset to 3 shields, not totalShields
    }
  }, []);

  const buyShields = useCallback(async () => {
    if (!user?.id || credits < 5) {
      toast.error("Not enough credits to buy shields!");
      return;
    }

    try {
      await spendCredits.mutateAsync({
        userId: user.id,
        amount: 5,
        description: "Purchased 3 shields in Flappy Hippos"
      });
      
      // Add to purchased shields count for current game only
      setPurchasedShields(prev => prev + 3);
      
      toast.success("3 shields purchased! They are added to your current game.");
    } catch (error) {
      console.error("Error purchasing shields:", error);
      toast.error("Failed to purchase shields");
    }
  }, [user?.id, credits, spendCredits]);

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
    canvas.height = 570;

    // Game engine class
    class GameEngine {
      private ctx: CanvasRenderingContext2D;
      private canvas: HTMLCanvasElement;
      private hippo: any;
      private pipes: any[] = [];
      private missiles: any[] = [];
      private gameRunning = false;
      private animationId: number | null = null;
      private score = 0;
      private pipesPassedCount = 0;
      private eventListeners: (() => void)[] = [];
      private parallaxOffset = 0;
      private pipeHitsRemaining = 3;
      private maxShields = 3;
      private invincibilityTime = 0;
      private hitEffectTime = 0;
      private gameStartTime = 0;
      private lastMissileTime = 0;
      private missileWarningTime = 0;

      constructor(context: CanvasRenderingContext2D, canvasElement: HTMLCanvasElement) {
        this.ctx = context;
        this.canvas = canvasElement;
        this.reset();
        this.bindEvents();
        this.render();
        console.log("Game engine initialized successfully");
      }

      bindEvents() {
        const handleKeyPress = (e: KeyboardEvent) => {
          if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault();
            this.flap();
          }
        };

        const handleClick = (e: MouseEvent) => {
          e.preventDefault();
          this.flap();
        };

        document.addEventListener('keydown', handleKeyPress);
        this.canvas.addEventListener('click', handleClick);

        // Store cleanup functions
        this.eventListeners.push(() => {
          document.removeEventListener('keydown', handleKeyPress);
          this.canvas.removeEventListener('click', handleClick);
        });
      }

      flap() {
        if (this.gameRunning) {
          this.hippo.velocity = -12;
          this.hippo.rotation = -0.3;
        }
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

      reset(startingShields = 3) {
        console.log("Resetting game state with shields:", startingShields);
        this.hippo = {
          x: 100,
          y: 285,
          width: 60,
          height: 40,
          velocity: 0,
          rotation: 0
        };
        this.pipes = [];
        this.missiles = [];
        this.gameRunning = false;
        this.score = 0;
        this.pipesPassedCount = 0;
        this.parallaxOffset = 0;
        this.pipeHitsRemaining = startingShields;
        this.maxShields = startingShields;
        this.invincibilityTime = 0;
        this.hitEffectTime = 0;
        this.gameStartTime = 0;
        this.lastMissileTime = 0;
        this.missileWarningTime = 0;
        this.addPipe();
        setShieldCount(startingShields); // Sync React state
        if (!this.gameRunning) {
          this.render();
        }
      }

      start() {
        console.log("Starting game engine...");
        this.gameRunning = true;
        this.gameStartTime = Date.now();
        this.lastMissileTime = 0; // Reset missile timer
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
        const currentTime = Date.now();
        const gameTimeElapsed = currentTime - this.gameStartTime;

        // Update parallax background
        this.parallaxOffset -= 1;

        // Update timers
        if (this.invincibilityTime > 0) {
          this.invincibilityTime--;
        }
        if (this.hitEffectTime > 0) {
          this.hitEffectTime--;
        }
        if (this.missileWarningTime > 0) {
          this.missileWarningTime--;
        }

        // Missile system - spawn every 45 seconds (45000ms)
        if (gameTimeElapsed >= 45000 && this.lastMissileTime === 0) {
          // First missile at 45 seconds
          this.spawnMissile();
          this.lastMissileTime = gameTimeElapsed;
          console.log("First missile spawned at 45 seconds");
        } else if (this.lastMissileTime > 0 && gameTimeElapsed - this.lastMissileTime >= 45000) {
          // Subsequent missiles every 45 seconds
          this.spawnMissile();
          this.lastMissileTime = gameTimeElapsed;
          console.log("Missile spawned at", gameTimeElapsed / 1000, "seconds");
        }

        // Missile warning - 5 seconds before next missile
        const timeSinceLastMissile = gameTimeElapsed - this.lastMissileTime;
        const timeToNextMissile = 45000 - timeSinceLastMissile;
        if (timeToNextMissile <= 5000 && timeToNextMissile > 0 && this.missileWarningTime <= 0) {
          this.missileWarningTime = 300; // 5 seconds at 60fps
          console.log("Missile warning activated");
        }

        // Update hippo physics
        this.hippo.velocity += 0.6;
        this.hippo.y += this.hippo.velocity;
        
        if (this.hippo.velocity > 0) {
          this.hippo.rotation = Math.min(this.hippo.rotation + 0.05, 0.5);
        }

        // Update pipes
        this.pipes.forEach(pipe => {
          pipe.x -= 4;
          
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

        // Update missiles
        this.missiles.forEach(missile => {
          missile.x -= 2.5;
        });

        this.missiles = this.missiles.filter(missile => missile.x > -missile.width);

        this.checkCollisions();
      }

      spawnMissile() {
        console.log("Spawning missile!");
        const minY = this.canvas.height * 0.2;
        const maxY = this.canvas.height * 0.8 - 50;
        const y = Math.random() * (maxY - minY) + minY;

        this.missiles.push({
          x: this.canvas.width + 50,
          y: y,
          width: 70,
          height: 50,
          speed: 2.5
        });
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
          scored: false,
          hit: false
        });
      }

      checkCollisions() {
        // Ground collision - instant death
        if (this.hippo.y + this.hippo.height > this.canvas.height - 60) {
          console.log("Ground collision detected");
          this.gameOver();
          return;
        }

        // Ceiling collision - bounce
        if (this.hippo.y < 0) {
          console.log("Ceiling bounce!");
          this.hippo.y = 0;
          this.hippo.velocity = 8;
          this.hitEffectTime = 15;
          return;
        }

        // Missile collision - instant death regardless of shields
        for (let missile of this.missiles) {
          if (this.hippo.x + this.hippo.width > missile.x && 
              this.hippo.x < missile.x + missile.width &&
              this.hippo.y + this.hippo.height > missile.y && 
              this.hippo.y < missile.y + missile.height) {
            console.log("Missile collision - instant death!");
            this.gameOver();
            return;
          }
        }

        // Pipe collision - only if not invincible
        if (this.invincibilityTime <= 0) {
          for (let pipe of this.pipes) {
            if (!pipe.hit && 
                this.hippo.x + this.hippo.width > pipe.x && 
                this.hippo.x < pipe.x + pipe.width) {
              if (this.hippo.y < pipe.topHeight || 
                  this.hippo.y + this.hippo.height > pipe.bottomY) {
                
                if (this.pipeHitsRemaining > 0) {
                  console.log("Pipe hit! Knockback applied. Hits remaining:", this.pipeHitsRemaining - 1);
                  this.pipeHitsRemaining--;
                  setShieldCount(this.pipeHitsRemaining); // Sync React state
                  pipe.hit = true;
                  
                  this.hippo.velocity = -8;
                  this.hippo.x = Math.max(50, this.hippo.x - 20);
                  
                  this.invincibilityTime = 60;
                  this.hitEffectTime = 30;
                } else {
                  console.log("Final pipe collision - Game Over!");
                  this.gameOver();
                }
                break;
              }
            }
          }
        }
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

          // Missile warning effect
          if (this.missileWarningTime > 0) {
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 8;
            this.ctx.globalAlpha = 0.3 + (Math.sin(this.missileWarningTime * 0.3) * 0.3);
            this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = 1;
          }

          // Screen shake during hits
          if (this.hitEffectTime > 0) {
            this.ctx.save();
            const shakeIntensity = Math.min(this.hitEffectTime / 10, 3);
            this.ctx.translate(
              (Math.random() - 0.5) * shakeIntensity,
              (Math.random() - 0.5) * shakeIntensity
            );
          }

          this.drawEnhancedClouds();
          this.pipes.forEach(pipe => this.drawEnhancedPipe(pipe));
          this.missiles.forEach(missile => this.drawMissile(missile));
          this.drawEnhancedGround();
          this.drawEnhancedHippo();
          this.drawEnhancedScore();
          this.drawEnhancedShieldCounter();

          if (this.hitEffectTime > 0) {
            this.ctx.restore();
          }
        } catch (error) {
          console.error("Error in render:", error);
        }
      }

      drawMissile(missile: any) {
        this.ctx.save();
        this.ctx.translate(missile.x + missile.width/2, missile.y + missile.height/2);
        
        // Add glow effect
        this.ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // Draw the hippo missile
        this.ctx.font = 'bold 60px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🦛', 0, 0);
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        
        this.ctx.restore();
      }

      drawEnhancedClouds() {
        this.ctx.fillStyle = 'white';
        this.ctx.globalAlpha = 0.8;
        
        for (let i = 0; i < 4; i++) {
          const x = (i * 250) + 30 + (this.parallaxOffset * 0.3);
          const y = 60 + (i * 20);
          
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
        const gradient = this.ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
        gradient.addColorStop(0, '#228B22');
        gradient.addColorStop(0.5, '#32CD32');
        gradient.addColorStop(1, '#228B22');
        
        this.ctx.fillStyle = gradient;
        
        this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        this.ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, pipe.bottomHeight);
        
        this.ctx.fillStyle = '#32CD32';
        this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 35, pipe.width + 10, 35);
        this.ctx.fillRect(pipe.x - 5, pipe.bottomY, pipe.width + 10, 35);
        
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
        const groundGradient = this.ctx.createLinearGradient(0, this.canvas.height - 60, 0, this.canvas.height);
        groundGradient.addColorStop(0, '#4682B4');
        groundGradient.addColorStop(0.5, '#5F9EA0');
        groundGradient.addColorStop(1, '#2F4F4F');
        
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.canvas.height - 60, this.canvas.width, 60);
        
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
        
        if (this.invincibilityTime > 0 && Math.floor(this.invincibilityTime / 5) % 2 === 0) {
          this.ctx.globalAlpha = 0.5;
        }
        
        this.ctx.font = 'bold 50px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        this.ctx.fillText('💩', 0, 0);
        
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.globalAlpha = 1;
        
        this.ctx.restore();
      }

      drawEnhancedScore() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(this.canvas.width/2 - 50, 10, 100, 50);
        
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.strokeText(this.score.toString(), this.canvas.width / 2, 45);
        this.ctx.fillText(this.score.toString(), this.canvas.width / 2, 45);
      }

      drawEnhancedShieldCounter() {
        const shieldWidth = 25;
        const padding = 20;
        const labelWidth = 70;
        const counterWidth = 40;
        const totalWidth = labelWidth + (this.maxShields * shieldWidth) + counterWidth + (padding * 2);
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(10, 10, totalWidth, 50);
        
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('SHIELDS:', 20, 30);
        
        this.ctx.font = 'bold 20px Arial';
        for (let i = 0; i < this.maxShields; i++) {
          this.ctx.fillStyle = i < this.pipeHitsRemaining ? '#4CAF50' : '#666';
          this.ctx.fillText('🛡️', 20 + labelWidth + (i * shieldWidth), 45);
        }
        
        // Show current/max format
        this.ctx.fillStyle = this.pipeHitsRemaining > 0 ? '#4CAF50' : '#f44336';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText(`${this.pipeHitsRemaining}/${this.maxShields}`, 20 + labelWidth + (this.maxShields * shieldWidth), 50);
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
  }, [totalShields]);

  // Update shield count when purchased shields change and we're in a game
  useEffect(() => {
    if (gameRef.current && gameState === 'playing') {
      const newTotalShields = 3 + purchasedShields;
      gameRef.current.pipeHitsRemaining = newTotalShields;
      gameRef.current.maxShields = newTotalShields;
      setShieldCount(newTotalShields);
    }
  }, [purchasedShields, gameState]);

  return (
    <div className="flex flex-col lg:flex-row items-start gap-3">
      <canvas 
        ref={canvasRef}
        className="border-2 border-gray-300 rounded-lg shadow-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      <div className="flex flex-col gap-2">
        {gameState === 'menu' && (
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
                onClick={startGame} 
                disabled={!canPlay || !isInitialized}
                className="bg-green-600 hover:bg-green-500 w-full text-xs py-1"
                size="sm"
              >
                <Play className="h-3 w-3 mr-1" />
                {!isInitialized ? 'Loading...' : canPlay ? 'Start' : 'No Credits'}
              </Button>
              <Button 
                onClick={buyShields} 
                disabled={credits < 5 || spendCredits.isPending}
                className="bg-blue-600 hover:bg-blue-500 w-full text-xs py-1"
                size="sm"
              >
                <Shield className="h-3 w-3 mr-1" />
                Buy 3 Shields (5💰)
              </Button>
            </div>
          </Card>
        )}

        {gameState === 'gameOver' && (
          <Card className="bg-gray-800/90 border-gray-700 p-2 w-36">
            <h3 className="text-xs font-bold text-white mb-1">Game Over!</h3>
            <p className="text-gray-300 text-xs mb-1">Score: {score}</p>
            <p className="text-gray-300 text-xs mb-2">
              Shields: {shieldCount}/{totalShields}
            </p>
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
              <Button 
                onClick={buyShields} 
                disabled={credits < 5 || spendCredits.isPending}
                className="bg-blue-600 hover:bg-blue-500 w-full text-xs py-1"
                size="sm"
              >
                <Shield className="h-3 w-3 mr-1" />
                Buy 3 Shields (5💰)
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
