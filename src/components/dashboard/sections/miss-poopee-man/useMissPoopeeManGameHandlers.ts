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
        amount: 3,
        description: "Miss POOPEE-Man game play (3 lives)"
      });
      
      toast({
        title: "Game Started!",
        description: "3 credits deducted for 3 lives. Good luck!",
        className: "max-w-xs"
      });
    } catch (error) {
      console.error("Error spending credits:", error);
      toast({
        title: "Error",
        description: "Failed to start game. Please try again.",
        variant: "destructive",
        className: "max-w-xs"
      });
    }
  };

  const handleGameEnd = async (score: number, pelletsCount: number, duration: number) => {
    try {
      // Calculate credits earned based on performance
      let creditsEarned = 0;
      
      // Base rewards for pellets collected (reduced by half)
      creditsEarned += pelletsCount * 0.005;
      
      // Performance bonuses (reduced by half)
      if (score >= 50) creditsEarned += 0.05;   // Basic performance
      if (score >= 100) creditsEarned += 0.1;  // Good performance
      if (score >= 200) creditsEarned += 0.25;  // Great performance
      if (score >= 500) creditsEarned += 0.5;    // Excellent performance
      if (score >= 1000) creditsEarned += 1;   // Master level
      
      // Bonus for new high score (reduced by half)
      if (score > highScore) {
        creditsEarned += 0.5;
      }
      
      // Create game session record
      const gameSession = await createGameSession.mutateAsync({
        user_id: user.id,
        score,
        duration_seconds: duration,
        credits_spent: 3,
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
          className: "max-w-xs"
        });
      } else {
        toast({
          title: "Game Complete!",
          description: `Score: ${score} | Keep practicing to earn credits!`,
          className: "max-w-xs"
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