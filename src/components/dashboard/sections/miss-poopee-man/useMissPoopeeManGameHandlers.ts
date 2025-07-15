import { useSpendCredits, useEarnCredits } from "@/hooks/useCreditOperations";
import { useCreateGameSession } from "@/hooks/useGameSessions";
import { useToast } from "@/hooks/use-toast";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";

interface UseMissPoopeeManGameHandlersProps {
  user: UnifiedUser;
  highScore: number;
}

export const useMissPoopeeManGameHandlers = ({ user, highScore }: UseMissPoopeeManGameHandlersProps) => {
  const createGameSession = useCreateGameSession();
  const spendCredits = useSpendCredits();
  const earnCredits = useEarnCredits();
  const { toast } = useToast();

  const handleGameStart = async () => {
    try {
      await spendCredits.mutateAsync({
        userId: user.id,
        amount: 1,
        description: "Miss POOPEE-Man game play"
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

  const handleGameEnd = async (score: number, pelletsCount: number, duration: number) => {
    try {
      // Calculate credits earned based on performance
      let creditsEarned = 0;
      
      // Base rewards for pellets collected
      creditsEarned += pelletsCount * 0.01;
      
      // Performance bonuses
      if (score >= 50) creditsEarned += 0.1;   // Basic performance
      if (score >= 100) creditsEarned += 0.2;  // Good performance
      if (score >= 200) creditsEarned += 0.5;  // Great performance
      if (score >= 500) creditsEarned += 1;    // Excellent performance
      if (score >= 1000) creditsEarned += 2;   // Master level
      
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
        pipes_passed: pelletsCount, // Repurpose pipes_passed for pellets collected
        metadata: {
          game_type: 'miss_poopee_man',
          pellets_collected: pelletsCount
        }
      });
      
      // Award credits if earned
      if (creditsEarned > 0) {
        await earnCredits.mutateAsync({
          userId: user.id,
          amount: creditsEarned,
          description: `Miss POOPEE-Man reward - Score: ${score}`,
          gameSessionId: gameSession.id
        });
        
        toast({
          title: "Game Complete!",
          description: `Score: ${score} | Earned: ${creditsEarned.toFixed(2)} credits`,
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