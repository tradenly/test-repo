
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "./useAdminAuth";

export const useGamePermissions = (gameType: string) => {
  const { isAdmin } = useAdminAuth();

  const { data: gameSettings, isLoading } = useQuery({
    queryKey: ['game-settings', gameType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_settings')
        .select('*')
        .eq('game_type', gameType)
        .single();
      
      if (error) {
        console.error('❌ Error fetching game settings for', gameType, ':', error);
        // Return default settings if none found
        return {
          game_type: gameType,
          is_enabled: true,
          entry_cost_credits: 1.0,
          shield_cost: 5.0,
          max_shields_purchasable: 3,
          payout_multipliers: { base: 1.0, bonus: 0.1 },
          special_features: {}
        };
      }
      
      return data;
    },
  });

  const canPlay = isAdmin || (gameSettings?.is_enabled ?? true);
  const showBanner = !gameSettings?.is_enabled && !isAdmin;

  return {
    gameSettings,
    canPlay,
    showBanner,
    isAdmin,
    isLoading,
  };
};
