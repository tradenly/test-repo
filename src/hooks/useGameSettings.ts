
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type GameSettings = Database['public']['Tables']['game_settings']['Row'];
type GameSettingsUpdate = Database['public']['Tables']['game_settings']['Update'];

export const useGameSettings = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['game-settings'],
    queryFn: async () => {
      console.log('🎮 Fetching game settings');
      const { data, error } = await supabase
        .from('game_settings')
        .select('*')
        .order('game_type');
      
      if (error) {
        console.error('❌ Error fetching game settings:', error);
        throw error;
      }
      
      console.log('✅ Game settings fetched:', data);
      return data as GameSettings[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ gameType, updates }: { gameType: string; updates: Partial<GameSettingsUpdate> }) => {
      console.log('🎮 Updating game settings for:', gameType, updates);
      
      const { data, error } = await supabase
        .from('game_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('game_type', gameType)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error updating game settings:', error);
        throw error;
      }
      
      console.log('✅ Game settings updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-settings'] });
    },
  });

  return {
    data,
    isLoading,
    error,
    updateGameSettings: (gameType: string, updates: Partial<GameSettingsUpdate>) =>
      updateMutation.mutateAsync({ gameType, updates }),
    isUpdating: updateMutation.isPending,
  };
};
