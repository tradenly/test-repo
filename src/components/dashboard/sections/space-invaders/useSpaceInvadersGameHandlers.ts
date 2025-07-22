
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCreditOperations } from '@/hooks/useCreditOperations';
import { useGameSessions } from '@/hooks/useGameSessions';
import { useGamePermissions } from '@/hooks/useGamePermissions';

export const useSpaceInvadersGameHandlers = () => {
  const [isStarting, setIsStarting] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { spendCredits, addCredits } = useCreditOperations();
  const { createGameSession, updateGameSession } = useGameSessions();
  const { gameSettings } = useGamePermissions('space_invaders');

  const startGame = async () => {
    try {
      setIsStarting(true);
      setError(null);
      
      const entryCost = gameSettings?.entry_cost_credits || 1;
      
      // Spend credits to start the game
      await spendCredits(entryCost, 'Space Invaders game entry');
      
      // Create game session
      const gameSession = await createGameSession({
        game_type: 'space_invaders',
        credits_spent: entryCost,
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
    if (!currentGameId) return;
    
    try {
      const entryCost = gameSettings?.entry_cost_credits || 1;
      const baseMultiplier = gameSettings?.payout_multipliers?.base || 1.0;
      const bonusMultiplier = gameSettings?.payout_multipliers?.bonus || 0.1;
      const waveBonus = gameSettings?.payout_multipliers?.wave_bonus || 0.05;
      
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
        await addCredits(creditsEarned, `Space Invaders reward - Score: ${finalScore}`);
        
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
