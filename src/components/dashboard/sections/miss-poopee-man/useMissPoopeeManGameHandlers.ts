
import { useCreateGameSession } from "@/hooks/useGameSessions";
import { useSpendCredits, useEarnCredits } from "@/hooks/useCreditOperations";
import { useToast } from "@/hooks/use-toast";

export const useMissPoopeeManGameHandlers = () => {
  const createGameSession = useCreateGameSession();
  const spendCredits = useSpendCredits();
  const earnCredits = useEarnCredits();
  const { toast } = useToast();

  const handleGameStart = async (userId: string) => {
    try {
      await spendCredits.mutateAsync({
        userId,
        amount: 1,
        description: "Miss POOPEE-Man game entry fee"
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Cannot Start Game",
        description: error.message || "Insufficient credits to start game",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleGameEnd = async (
    userId: string, 
    gameData: {
      score: number;
      duration: number;
      level: number;
      lives: number;
      pelletsEaten: number;
      gameStatus: string;
    }
  ) => {
    try {
      // Calculate credits earned based on performance
      let creditsEarned = 0;
      if (gameData.score > 0) {
        creditsEarned = Math.floor(gameData.score / 100); // 1 credit per 100 points
        if (gameData.gameStatus === 'level-complete') {
          creditsEarned += 5; // Bonus for completing level
        }
      }

      // Record game session
      await createGameSession.mutateAsync({
        user_id: userId,
        score: gameData.score,
        duration_seconds: gameData.duration,
        credits_spent: 1,
        credits_earned: creditsEarned,
        pipes_passed: 0, // Not applicable for this game
        metadata: {
          game_type: 'miss_poopee_man',
          level: gameData.level,
          lives_remaining: gameData.lives,
          pellets_eaten: gameData.pelletsEaten,
          game_status: gameData.gameStatus
        }
      });

      // Award credits if earned
      if (creditsEarned > 0) {
        await earnCredits.mutateAsync({
          userId,
          amount: creditsEarned,
          description: `Miss POOPEE-Man game completed - Level ${gameData.level}`,
        });
      }

      return { success: true, creditsEarned };
    } catch (error) {
      console.error('Error handling game end:', error);
      toast({
        title: "Error",
        description: "Failed to save game results",
        variant: "destructive"
      });
      return { success: false, creditsEarned: 0 };
    }
  };

  return {
    handleGameStart,
    handleGameEnd,
    isCreatingSession: createGameSession.isPending,
    isSpendingCredits: spendCredits.isPending,
    isEarningCredits: earnCredits.isPending
  };
};
