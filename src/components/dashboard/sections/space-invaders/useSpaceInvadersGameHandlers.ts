
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSpendCredits, useEarnCredits } from '@/hooks/useCreditOperations';
import { useGamePermissions } from '@/hooks/useGamePermissions';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';

export const useSpaceInvadersGameHandlers = () => {
  const [isStarting, setIsStarting] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useUnifiedAuth();
  const spendCredits = useSpendCredits();
  const earnCredits = useEarnCredits();
  const { gameSettings } = useGamePermissions('space_invaders');

  const createGameSession = async (sessionData: any) => {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert([sessionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  };

  const updateGameSession = async (sessionId: string, updates: any) => {
    const { error } = await supabase
      .from('game_sessions')
      .update(updates)
      .eq('id', sessionId);
    
    if (error) throw error;
  };

  const startGame = async () => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setIsStarting(true);
      setError(null);
      
      const entryCost = gameSettings?.entry_cost_credits || 1;
      
      // Spend credits to start the game
      await spendCredits.mutateAsync({
        userId: user.id,
        amount: entryCost,
        description: 'Space Invaders game entry'
      });
      
      // Create game session
      const gameSession = await createGameSession({
        user_id: user.id,
        game_type: 'space_invaders',
        credits_spent: entryCost,
        score: 0,
        duration_seconds: 0,
        pipes_passed: 0,
        metadata: {
          gameStartTime: Date.now(),
          wave: 1,
          initialAliens: 50
        }
      });
      
      setCurrentGameId(gameSession.id);
      
      toast({
        title: "Game Started! 🛸",
        description: `Spent ${entryCost} credits. Defend Earth from the alien invasion!`,
      });
      
    } catch (error: any) {
      console.error('Error starting Space Invaders game:', error);
      setError(error.message || 'Failed to start game');
      toast({
        title: "Failed to Start Game",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsStarting(false);
    }
  };

  const endGame = async (finalScore: number, gameStats: any) => {
    if (!currentGameId || !user?.id) return;
    
    try {
      const entryCost = gameSettings?.entry_cost_credits || 1;
      
      // Safe type checking for payout multipliers
      const payoutMultipliers = gameSettings?.payout_multipliers;
      let baseMultiplier = 1.0;
      let bonusMultiplier = 0.1;
      let waveBonus = 0.05;

      if (payoutMultipliers && typeof payoutMultipliers === 'object') {
        const multipliers = payoutMultipliers as any;
        baseMultiplier = multipliers.base || 1.0;
        bonusMultiplier = multipliers.bonus || 0.1;
        waveBonus = multipliers.wave_bonus || 0.05;
      }
      
      // Calculate credits earned based on score and performance
      let creditsEarned = 0;
      
      if (finalScore > 0) {
        // Base credits from score
        creditsEarned = finalScore * 0.01 * baseMultiplier;
        
        // Bonus for completing waves
        const waveCredits = (gameStats.wave - 1) * waveBonus * entryCost;
        creditsEarned += waveCredits;
        
        // Accuracy bonus
        if (gameStats.accuracy > 70) {
          creditsEarned += finalScore * bonusMultiplier;
        }
        
        // Victory bonus
        if (gameStats.gameStatus === 'victory') {
          creditsEarned += entryCost * 2; // Double entry cost as victory bonus
        }
        
        creditsEarned = Math.round(creditsEarned * 100) / 100; // Round to 2 decimal places
      }

      // Update game session
      await updateGameSession(currentGameId, {
        score: finalScore,
        credits_earned: creditsEarned,
        completed_at: new Date().toISOString(),
        duration_seconds: Math.floor((Date.now() - (gameStats.gameStartTime || Date.now())) / 1000),
        metadata: {
          ...gameStats,
          finalWave: gameStats.wave,
          aliensDestroyed: gameStats.aliensDestroyed,
          totalAliens: gameStats.totalAliens,
          accuracy: gameStats.accuracy,
          gameEndTime: Date.now()
        }
      });

      // Award credits if earned
      if (creditsEarned > 0) {
        await earnCredits.mutateAsync({
          userId: user.id,
          amount: creditsEarned,
          description: `Space Invaders reward - Score: ${finalScore}`,
          gameSessionId: currentGameId
        });
        
        toast({
          title: "Game Complete! 🎉",
          description: `Score: ${finalScore} | Earned ${creditsEarned} credits!`,
        });
      } else {
        toast({
          title: "Game Over",
          description: `Final Score: ${finalScore}. Better luck next time!`,
        });
      }

      setCurrentGameId(null);
      
    } catch (error: any) {
      console.error('Error ending Space Invaders game:', error);
      setError(error.message || 'Failed to save game results');
      toast({
        title: "Error Saving Game",
        description: error.message || "Game results may not have been saved properly.",
        variant: "destructive",
      });
    }
  };

  return {
    startGame,
    endGame,
    isStarting,
    currentGameId,
    error
  };
};
