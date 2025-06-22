
import { useToast } from "@/hooks/use-toast";
import { useSpendCredits, useEarnCredits } from "@/hooks/useCreditOperations";
import { useCreateGameSession } from "@/hooks/useGameSessions";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { logger } from "@/utils/logger";

interface UsePoopeeCrushGameHandlersProps {
  user: UnifiedUser;
  highScore: number;
}

export const usePoopeeCrushGameHandlers = ({ user, highScore }: UsePoopeeCrushGameHandlersProps) => {
  const { toast } = useToast();
  const spendCreditsMutation = useSpendCredits();
  const earnCreditsMutation = useEarnCredits();
  const createGameSessionMutation = useCreateGameSession();

  const handleGameStart = async () => {
    try {
      console.log("🎮 [Game Handlers] Starting POOPEE Crush game for user:", user.id);
      
      await spendCreditsMutation.mutateAsync({
        userId: user.id,
        amount: 1,
        description: "POOPEE Crush game entry fee"
      });

      console.log("✅ [Game Handlers] Game started successfully");
      
      toast({
        title: "Game Started!",
        description: "1 credit deducted. Good luck crushing those POOPEEs! 💩",
      });
    } catch (error) {
      logger.error("❌ [Game Handlers] Error starting game:", error);
      
      // Check if it's an insufficient credits error
      const errorMessage = error instanceof Error ? error.message : "Failed to start game";
      
      toast({
        title: "Cannot Start Game",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error; // Re-throw so the game doesn't start
    }
  };

  const handleGameEnd = async (score: number, moves: number) => {
    try {
      console.log("🏁 [Game Handlers] Ending POOPEE Crush game with score:", score);
      
      // CRITICAL FIX: Ensure score is always an integer to prevent database errors
      const integerScore = Math.floor(score);
      
      // Calculate credits earned based on score with more generous rewards
      let creditsEarned = 0;
      if (integerScore >= 500) creditsEarned = 0.5;    // Much lower threshold
      if (integerScore >= 1000) creditsEarned = 1;     // Achievable threshold
      if (integerScore >= 2000) creditsEarned = 2;     // Good performance
      if (integerScore >= 4000) creditsEarned = 3;     // Great performance
      if (integerScore >= 6000) creditsEarned = 5;     // Excellent performance

      // Bonus for new high score
      const isNewHighScore = integerScore > highScore;
      if (isNewHighScore) {
        creditsEarned += 1;
      }

      console.log("💰 [Game Handlers] Credits earned calculation:", {
        score: integerScore,
        highScore,
        isNewHighScore,
        creditsEarned
      });

      // Create game session record with integer score
      const gameSession = await createGameSessionMutation.mutateAsync({
        user_id: user.id,
        score: integerScore, // Always integer
        duration_seconds: 0, // POOPEE Crush is move-based, not time-based
        credits_spent: 1,
        credits_earned: creditsEarned,
        pipes_passed: 0, // Not applicable for POOPEE Crush
        metadata: {
          game_type: 'poopee_crush',
          moves_used: moves,
          final_score: integerScore,
          is_new_high_score: isNewHighScore
        }
      });

      // Award credits if earned
      if (creditsEarned > 0) {
        await earnCreditsMutation.mutateAsync({
          userId: user.id,
          amount: creditsEarned,
          description: `POOPEE Crush game reward - Score: ${integerScore}${isNewHighScore ? ' (NEW HIGH SCORE!)' : ''}`,
          gameSessionId: gameSession.id
        });
      }

      let message = `Game over! Final score: ${integerScore.toLocaleString()}`;
      if (creditsEarned > 0) {
        message += ` - Earned ${creditsEarned} credits! 🎉`;
      }
      if (isNewHighScore) {
        message += " 🏆 NEW HIGH SCORE!";
      }

      console.log("✅ [Game Handlers] Game ended successfully:", message);

      toast({
        title: "Game Complete!",
        description: message,
      });

    } catch (error) {
      logger.error("❌ [Game Handlers] Error ending game:", error);
      
      // Still show the score even if credit operations fail
      toast({
        title: "Game Ended",
        description: `Final score: ${Math.floor(score).toLocaleString()}`,
      });
    }
  };

  return {
    handleGameStart,
    handleGameEnd,
    isStarting: spendCreditsMutation.isPending,
    isEnding: earnCreditsMutation.isPending || createGameSessionMutation.isPending
  };
};
