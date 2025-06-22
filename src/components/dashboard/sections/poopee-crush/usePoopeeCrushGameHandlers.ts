
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
      await spendCreditsMutation.mutateAsync({
        userId: user.id,
        amount: 1,
        description: "POOPEE Crush game entry fee"
      });

      toast({
        title: "Game Started!",
        description: "1 credit deducted. Good luck crushing those POOPEEs!",
      });
    } catch (error) {
      logger.error("Error starting game:", error);
      toast({
        title: "Error",
        description: "Failed to start game. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGameEnd = async (score: number, moves: number) => {
    try {
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
      if (integerScore > highScore) {
        creditsEarned += 1;
      }

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
          final_score: integerScore
        }
      });

      // Award credits if earned
      if (creditsEarned > 0) {
        await earnCreditsMutation.mutateAsync({
          userId: user.id,
          amount: creditsEarned,
          description: `POOPEE Crush game reward - Score: ${integerScore}`,
          gameSessionId: gameSession.id
        });
      }

      let message = `Game over! Final score: ${integerScore.toLocaleString()}`;
      if (creditsEarned > 0) {
        message += ` - Earned ${creditsEarned} credits!`;
      }
      if (integerScore > highScore) {
        message += " 🎉 NEW HIGH SCORE!";
      }

      toast({
        title: "Game Complete!",
        description: message,
      });

    } catch (error) {
      logger.error("Error ending game:", error);
      toast({
        title: "Game Ended",
        description: `Final score: ${Math.floor(score).toLocaleString()}`,
      });
    }
  };

  return {
    handleGameStart,
    handleGameEnd
  };
};
