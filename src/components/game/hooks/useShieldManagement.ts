
import { useCallback } from 'react';
import { useSpendCredits } from "@/hooks/useCreditOperations";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { toast } from "sonner";
import type { GameEngine } from '../GameEngine';

interface UseShieldManagementProps {
  gameRef: React.MutableRefObject<GameEngine | null>;
  credits: number;
  totalShields: number;
  buyShieldsState: () => void;
}

export const useShieldManagement = ({ 
  gameRef, 
  credits, 
  totalShields, 
  buyShieldsState 
}: UseShieldManagementProps) => {
  const { user } = useUnifiedAuth();
  const spendCredits = useSpendCredits();

  // Centralized shield management function
  const updateGameEngineShields = useCallback((newTotalShields: number) => {
    console.log("🛡️ Updating game engine shields to:", newTotalShields);
    if (gameRef.current) {
      gameRef.current.updateShields(newTotalShields);
    }
  }, [gameRef]);

  const buyShields = useCallback(async () => {
    if (!user?.id || credits < 5) {
      toast.error("Not enough credits to buy shields!");
      return;
    }

    console.log("💰 Purchasing shields...");
    try {
      await spendCredits.mutateAsync({
        userId: user.id,
        amount: 5,
        description: "Purchased 3 shields in Flappy Hippos"
      });
      
      // Update state first
      buyShieldsState();
      
      // Calculate new total and immediately sync with game engine
      const newTotalShields = totalShields + 3;
      updateGameEngineShields(newTotalShields);
      
      toast.success("3 shields purchased! They are added to your current game.");
    } catch (error) {
      console.error("Error purchasing shields:", error);
      toast.error("Failed to purchase shields");
    }
  }, [user?.id, credits, spendCredits, buyShieldsState, totalShields, updateGameEngineShields]);

  return {
    updateGameEngineShields,
    buyShields,
    isPurchasing: spendCredits.isPending
  };
};
