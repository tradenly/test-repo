import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { useCredits } from "@/hooks/useCredits";
import { useSpendCredits, useEarnCredits } from "@/hooks/useCreditOperations";
import { supabase } from "@/integrations/supabase/client";
import { HippoKongEngine } from "./game/HippoKongEngine";

interface HippoKongGameAreaProps {
  user: UnifiedUser;
  canPlay: boolean;
  gameSettings?: any;
}

type GameState = 'menu' | 'starting' | 'playing' | 'paused' | 'gameOver';

export const HippoKongGameArea = ({ user, canPlay, gameSettings }: HippoKongGameAreaProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<HippoKongEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [countdown, setCountdown] = useState(0);
  
  const { data: creditsData } = useCredits(user?.id || '');
  const spendCredits = useSpendCredits();
  const earnCredits = useEarnCredits();
  
  const credits = creditsData?.balance || 0;

  const entryCost = gameSettings?.entry_cost_credits || 1;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize game engine
    engineRef.current = new HippoKongEngine(
      ctx,
      canvas,
      handleGameEnd,
      handleScoreUpdate,
      handleLevelUp
    );

    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
      }
    };
  }, []);

  const handleGameEnd = async (finalScore: number, finalLevel: number, duration: number) => {
    console.log('🎮 Game ended', { finalScore, finalLevel, duration });
    
    setGameState('gameOver');
    setScore(finalScore);

    try {
      // Only earn credits if player rescued the princess (reached level 2+)
      // 1 credit per princess rescued, regardless of score
      const totalEarned = finalLevel > 1 ? Math.min(finalLevel - 1, 1) : 0;

      // Save game session
      if (user?.id) {
        const { data: sessionData } = await supabase
          .from('game_sessions')
          .insert([{
            user_id: user.id,
            game_type: 'hippo_kong',
            score: finalScore,
            duration_seconds: duration,
            credits_spent: entryCost,
            credits_earned: totalEarned,
            pipes_passed: 0,
            completed_at: new Date().toISOString(),
            metadata: {
              level: finalLevel,
              duration_seconds: duration,
              game_type: 'hippo_kong'
            }
          }])
          .select()
          .single();

        // Award credits if earned
        if (totalEarned > 0) {
          await earnCredits.mutateAsync({
            userId: user.id,
            amount: totalEarned,
            description: `Hippo Kong game completion - Score: ${finalScore}, Level: ${finalLevel}`,
            gameSessionId: sessionData?.id
          });
        }
      }

      if (totalEarned > 0) {
        toast.success(`Game Over! You earned ${totalEarned.toFixed(2)} credits!`);
      } else {
        toast.info("Game Over! Better luck next time!");
      }
    } catch (error) {
      console.error('Error saving game session:', error);
      toast.error("Game ended but couldn't save progress");
    }
  };

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
  };

  const handleLevelUp = (newLevel: number) => {
    setLevel(newLevel);
    toast.success(`Level ${newLevel}!`);
  };

  const startGame = async () => {
    if (!canPlay || !user?.id) {
      toast.error("This game is currently disabled");
      return;
    }

    if (credits < entryCost) {
      toast.error(`Need ${entryCost} credits to play`);
      return;
    }

    try {
      if (!user?.id) {
        toast.error("User not authenticated");
        return;
      }

      // Deduct credits
      await spendCredits.mutateAsync({
        userId: user.id,
        amount: entryCost,
        description: `Hippo Kong game entry`
      });

      // Reset engine and start countdown
      engineRef.current?.reset(); // Reset player position and game state
      setGameState('starting');
      setScore(0);
      setLevel(1);
      setTimeElapsed(0);
      
      let count = 3;
      setCountdown(count);
      
      const countdownInterval = setInterval(() => {
        count--;
        setCountdown(count);
        
        if (count === 0) {
          clearInterval(countdownInterval);
          setGameState('playing');
          engineRef.current?.start();
        }
      }, 1000);

    } catch (error) {
      console.error('Error starting game:', error);
      toast.error("Failed to start game");
    }
  };

  const pauseGame = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      engineRef.current?.pause();
    } else if (gameState === 'paused') {
      setGameState('playing');
      engineRef.current?.resume();
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setLevel(1);
    setTimeElapsed(0);
    engineRef.current?.reset();
  };

  const canStartGame = gameState === 'menu' || gameState === 'gameOver';
  const isPlaying = gameState === 'playing';
  const isPaused = gameState === 'paused';
  const isStarting = gameState === 'starting';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🦍 Hippo Kong
              <span className="text-sm font-normal text-muted-foreground">
                Score: {score} | Level: {level}
              </span>
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Credits: {credits?.toFixed(1) || 0}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full border border-border rounded-lg bg-slate-900"
            style={{ maxWidth: '100%', height: 'auto', aspectRatio: '4/3' }}
          />
          
          {isStarting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-6xl font-bold text-white">
                {countdown || "GO!"}
              </div>
            </div>
          )}

          {gameState === 'menu' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🏔️</div>
                <h3 className="text-2xl font-bold mb-2">Hippo Kong</h3>
                <p className="text-lg mb-4">Climb to the top while dodging barrels!</p>
                <p className="text-sm text-gray-300">Cost: {entryCost} credits</p>
              </div>
            </div>
          )}

          {gameState === 'gameOver' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/75 rounded-lg">
              <div className="text-center text-white">
                <div className="text-4xl mb-4">💀</div>
                <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
                <p className="text-lg mb-4">Final Score: {score}</p>
                <p className="text-lg mb-4">Level Reached: {level}</p>
              </div>
            </div>
          )}

          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-center text-white">
                <div className="text-4xl mb-4">⏸️</div>
                <h3 className="text-2xl font-bold">Paused</h3>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          {canStartGame && (
            <Button onClick={startGame} disabled={!canPlay}>
              <Play className="w-4 h-4 mr-2" />
              {gameState === 'gameOver' ? 'Play Again' : 'Start Game'}
            </Button>
          )}
          
          {(isPlaying || isPaused) && (
            <Button onClick={pauseGame} variant="outline">
              {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}
          
          {(isPlaying || isPaused || gameState === 'gameOver') && (
            <Button onClick={resetGame} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Use arrow keys to move and climb, spacebar to jump. Avoid the falling barrels!</p>
        </div>
      </CardContent>
    </Card>
  );
};