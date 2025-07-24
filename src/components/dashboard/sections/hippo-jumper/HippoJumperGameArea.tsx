import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useGameAudio } from "@/hooks/useGameAudio";
import { HippoJumperEngine } from "./game/HippoJumperEngine";

interface HippoJumperGameAreaProps {
  user: UnifiedUser;
  canPlay: boolean;
  gameSettings: any;
}

type GameState = 'menu' | 'playing' | 'gameOver';

export const HippoJumperGameArea = ({ user, canPlay, gameSettings }: HippoJumperGameAreaProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<HippoJumperEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const { playSoundEffect, playBackgroundMusic, stopBackgroundMusic } = useGameAudio();

  useEffect(() => {
    if (!canvasRef.current || isInitialized) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Initialize game engine
    engineRef.current = new HippoJumperEngine(
      ctx,
      canvas.width,
      canvas.height,
      {
        onGameOver: () => {
          setGameState('gameOver');
          stopBackgroundMusic();
          playSoundEffect('gameOver');
        },
        onScoreUpdate: (newScore: number) => {
          setScore(newScore);
        },
        onJump: () => {
          playSoundEffect('booster');
        },
        onCollectItem: () => {
          playSoundEffect('match');
        }
      }
    );

    setIsInitialized(true);
  }, [playSoundEffect, playBackgroundMusic, stopBackgroundMusic, isInitialized]);

  const startGame = () => {
    if (!engineRef.current) return;
    
    setGameState('playing');
    setScore(0);
    engineRef.current.start();
    playBackgroundMusic();
  };

  const resetGame = () => {
    if (!engineRef.current) return;
    
    setGameState('menu');
    setScore(0);
    engineRef.current.reset();
    stopBackgroundMusic();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Hippo Jumper</span>
          <Badge variant="outline">Score: {score}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border border-border rounded-lg w-full max-w-[800px] h-auto bg-gradient-to-b from-sky-400 to-sky-200"
            style={{ aspectRatio: '800/600' }}
          />
          
          {gameState === 'menu' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold mb-4">Hippo Jumper</h3>
                <p className="mb-4">Use SPACEBAR or CLICK to jump!</p>
                <Button 
                  onClick={startGame}
                  disabled={!canPlay}
                  size="lg"
                >
                  {canPlay ? 'Start Game' : 'Game Disabled'}
                </Button>
              </div>
            </div>
          )}
          
          {gameState === 'gameOver' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
                <p className="text-lg mb-4">Final Score: {score}</p>
                <div className="space-x-2">
                  <Button onClick={startGame} size="lg">
                    Play Again
                  </Button>
                  <Button onClick={resetGame} variant="outline" size="lg">
                    Main Menu
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p><strong>Controls:</strong> Press SPACEBAR or click anywhere to jump</p>
          <p><strong>Goal:</strong> Jump across platforms and collect golden coins!</p>
        </div>
      </CardContent>
    </Card>
  );
};