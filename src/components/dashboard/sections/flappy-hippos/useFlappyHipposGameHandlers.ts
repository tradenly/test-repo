
import { useSpendCredits, useEarnCredits } from "@/hooks/useCreditOperations";
import { useCreateGameSession } from "@/hooks/useGameSessions";
import { useToast } from "@/hooks/use-toast";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface UseFlappyHipposGameHandlersProps {
  user: UnifiedUser;
  highScore: number;
}

export const useFlappyHipposGameHandlers = ({ user, highScore }: UseFlappyHipposGameHandlersProps) => {
  const createGameSession = useCreateGameSession();
  const spendCredits = useSpendCredits();
  const earnCredits = useEarnCredits();
  const { toast } = useToast();

  const handleGameStart = async () => {
    try {
      await spendCredits.mutateAsync({
        userId: user.id,
        amount: 1,
        description: "Flappy Hippos game play"
      });
      
      toast({
        title: "Game Started!",
        description: "1 credit deducted. Good luck!",
      });
    } catch (error) {
      console.error("Error spending credits:", error);
      toast({
        title: "Error",
        description: "Failed to start game. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleGameEnd = async (score: number, pipesPassedCount: number, duration: number) => {
    try {
      // Calculate credits earned based on performance
      let creditsEarned = 0;
      
      // Base rewards
      if (score >= 1) creditsEarned += 0.1; // Basic participation
      if (score >= 5) creditsEarned += 0.2; // Getting started
      if (score >= 10) creditsEarned += 0.5; // Good performance
      if (score >= 25) creditsEarned += 1; // Great performance
      if (score >= 50) creditsEarned += 2; // Excellent performance
      if (score >= 100) creditsEarned += 5; // Master level
      
      // Bonus for new high score
      if (score > highScore) {
        creditsEarned += 1;
      }
      
      // Create game session record
      const gameSession = await createGameSession.mutateAsync({
        user_id: user.id,
        score,
        duration_seconds: duration,
        credits_spent: 1,
        credits_earned: creditsEarned,
        pipes_passed: pipesPassedCount
      });
      
      // Award credits if earned
      if (creditsEarned > 0) {
        await earnCredits.mutateAsync({
          userId: user.id,
          amount: creditsEarned,
          description: `Flappy Hippos reward - Score: ${score}`,
          gameSessionId: gameSession.id
        });
        
        toast({
          title: "Game Complete!",
          description: `Score: ${score} | Earned: ${creditsEarned.toFixed(1)} credits`,
        });
      } else {
        toast({
          title: "Game Complete!",
          description: `Score: ${score} | Keep practicing to earn credits!`,
        });
      }
    } catch (error) {
      console.error("Error recording game session:", error);
      toast({
        title: "Game Recorded",
        description: `Final Score: ${score}`,
      });
    }
  };

  return {
    handleGameStart,
    handleGameEnd
  };
};
