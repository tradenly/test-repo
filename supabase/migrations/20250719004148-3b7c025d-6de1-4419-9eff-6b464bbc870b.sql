
-- Create game_settings table for managing game configurations
CREATE TABLE public.game_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_type TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  entry_cost_credits NUMERIC NOT NULL DEFAULT 1.0,
  shield_cost NUMERIC DEFAULT 5.0,
  max_shields_purchasable INTEGER DEFAULT 3,
  payout_multipliers JSONB DEFAULT '{"base": 1.0, "bonus": 0.1}'::jsonb,
  special_features JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_game_type CHECK (game_type IN ('flappy_hippos', 'falling_logs', 'poopee_crush', 'miss_poopee_man'))
);

-- Enable Row Level Security
ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage all game settings" 
  ON public.game_settings 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view game settings" 
  ON public.game_settings 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Insert default settings for all current games
INSERT INTO public.game_settings (game_type, is_enabled, entry_cost_credits, shield_cost, max_shields_purchasable, payout_multipliers, special_features) VALUES
('flappy_hippos', true, 1.0, 5.0, 3, '{"base": 1.0, "bonus": 0.1, "shield_bonus": 0.05}'::jsonb, '{"has_shields": true, "speed_settings": ["beginner", "moderate", "advanced"]}'::jsonb),
('falling_logs', true, 1.0, null, null, '{"base": 1.0, "line_clear_bonus": 0.2, "level_bonus": 0.1}'::jsonb, '{"has_levels": true, "line_clear_rewards": true}'::jsonb),
('poopee_crush', true, 1.0, null, null, '{"base": 1.0, "match_bonus": 0.15, "combo_bonus": 0.25}'::jsonb, '{"has_boosters": true, "difficulty_levels": true}'::jsonb),
('miss_poopee_man', true, 1.0, null, null, '{"base": 1.0, "pellet_bonus": 0.05, "power_pellet_bonus": 0.3}'::jsonb, '{"has_power_pellets": true, "ghost_vulnerability": true}'::jsonb);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_game_settings_updated_at
  BEFORE UPDATE ON public.game_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
