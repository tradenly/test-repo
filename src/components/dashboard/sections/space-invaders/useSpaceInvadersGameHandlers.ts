
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
          initialAliens: 65
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
      
      // Safe type checking for payout multipliers with EMERGENCY reduced values
      const payoutMultipliers = gameSettings?.payout_multipliers;
      let baseMultiplier = 0.001; // EMERGENCY: Reduced from 1.0 to 0.001
      let bonusMultiplier = 0.01; // EMERGENCY: Reduced from 0.1 to 0.01
      let waveBonus = 0.01; // EMERGENCY: Reduced from 0.05 to 0.01

      if (payoutMultipliers && typeof payoutMultipliers === 'object') {
        const multipliers = payoutMultipliers as any;
        baseMultiplier = Math.min(multipliers.base || 0.001, 0.01); // Cap at 0.01
        bonusMultiplier = Math.min(multipliers.bonus || 0.01, 0.05); // Cap at 0.05
        waveBonus = Math.min(multipliers.wave_bonus || 0.01, 0.05); // Cap at 0.05
      }
      
      // EMERGENCY: Implement safer payout calculation with caps
      let creditsEarned = 0;
      
      if (finalScore > 0) {
        // Base credits from score - much reduced calculation
        creditsEarned = (finalScore / 100) * baseMultiplier; // Score divided by 100, then multiplied by tiny multiplier
        
        // Wave completion bonus - small fixed amount per wave
        const waveCredits = Math.max(0, (gameStats.wave - 1)) * waveBonus * entryCost;
        creditsEarned += waveCredits;
        
        // Accuracy bonus - only if very high accuracy
        if (gameStats.accuracy > 80) { // Increased threshold from 70 to 80
          creditsEarned += (finalScore / 100) * bonusMultiplier;
        }
        
        // Victory bonus - small reward
        if (gameStats.gameStatus === 'victory') {
          creditsEarned += entryCost * 0.5; // Reduced from 2x to 0.5x entry cost
        }
        
        // EMERGENCY: Hard cap maximum credits earned to prevent exploitation
        const maxEarnable = entryCost * 2; // Maximum 2x entry cost
        creditsEarned = Math.min(creditsEarned, maxEarnable);
        
        creditsEarned = Math.max(0, Math.round(creditsEarned * 100) / 100); // Round to 2 decimal places, ensure non-negative
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
          gameEndTime: Date.now(),
          payoutCalculation: {
            baseCredits: (finalScore / 100) * baseMultiplier,
            waveBonus: Math.max(0, (gameStats.wave - 1)) * waveBonus * entryCost,
            accuracyBonus: gameStats.accuracy > 80 ? (finalScore / 100) * bonusMultiplier : 0,
            victoryBonus: gameStats.gameStatus === 'victory' ? entryCost * 0.5 : 0,
            cappedAt: entryCost * 2
          }
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
          description: `Score: ${finalScore} | Earned ${creditsEarned.toFixed(2)} credits!`,
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
