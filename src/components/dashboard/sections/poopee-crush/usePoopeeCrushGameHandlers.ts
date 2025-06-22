
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
      // Calculate credits earned based on score
      let creditsEarned = 0;
      if (score >= 1000) creditsEarned = 0.5;
      if (score >= 2500) creditsEarned = 1;
      if (score >= 5000) creditsEarned = 2;
      if (score >= 10000) creditsEarned = 5;

      // Bonus for new high score
      if (score > highScore) {
        creditsEarned += 1;
      }

      // Create game session record
      const gameSession = await createGameSessionMutation.mutateAsync({
        user_id: user.id,
        score,
        duration_seconds: 0, // POOPEE Crush is move-based, not time-based
        credits_spent: 1,
        credits_earned: creditsEarned,
        pipes_passed: 0, // Not applicable for POOPEE Crush
        metadata: {
          game_type: 'poopee_crush',
          moves_used: moves,
          final_score: score
        }
      });

      // Award credits if earned
      if (creditsEarned > 0) {
        await earnCreditsMutation.mutateAsync({
          userId: user.id,
          amount: creditsEarned,
          description: `POOPEE Crush game reward - Score: ${score}`,
          gameSessionId: gameSession.id
        });
      }

      let message = `Game over! Final score: ${score.toLocaleString()}`;
      if (creditsEarned > 0) {
        message += ` - Earned ${creditsEarned} credits!`;
      }
      if (score > highScore) {
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
        description: `Final score: ${score.toLocaleString()}`,
      });
    }
  };

  return {
    handleGameStart,
    handleGameEnd
  };
};
