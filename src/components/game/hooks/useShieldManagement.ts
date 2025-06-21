
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
    console.log("🛡️ useShieldManagement: Updating game engine shields to:", newTotalShields);
    if (gameRef.current) {
      gameRef.current.updateShields(newTotalShields);
    }
  }, [gameRef]);

  const buyShields = useCallback(async () => {
    if (!user?.id || credits < 5) {
      toast.error("Not enough credits to buy shields!");
      return;
    }

    console.log("💰 useShieldManagement: Starting shield purchase process...");
    try {
      await spendCredits.mutateAsync({
        userId: user.id,
        amount: 5,
        description: "Purchased 3 shields in Flappy Hippos"
      });
      
      console.log("💰 useShieldManagement: Credits spent successfully, updating state...");
      
      // Update the state first - this will trigger a re-render and useEffect
      buyShieldsState();
      
      toast.success("3 shields purchased! They are added to your current game.");
    } catch (error) {
      console.error("Error purchasing shields:", error);
      toast.error("Failed to purchase shields");
    }
  }, [user?.id, credits, spendCredits, buyShieldsState]);

  return {
    updateGameEngineShields,
    buyShields,
    isPurchasing: spendCredits.isPending
  };
};
