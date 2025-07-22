-- Drop the existing constraint
ALTER TABLE public.game_settings DROP CONSTRAINT valid_game_type;

-- Add new constraint with space_invaders included
ALTER TABLE public.game_settings 
ADD CONSTRAINT valid_game_type 
CHECK (game_type = ANY (ARRAY['flappy_hippos'::text, 'falling_logs'::text, 'poopee_crush'::text, 'miss_poopee_man'::text, 'space_invaders'::text]));

-- Now insert the space_invaders game settings
INSERT INTO public.game_settings (
  game_type,
  is_enabled,
  entry_cost_credits,
  payout_multipliers,
  special_features,
  created_at,
  updated_at
) VALUES (
  'space_invaders',
  true,
  1.0,
  '{"base": 1.0, "bonus": 0.1, "wave_bonus": 0.05}'::jsonb,
  '{"waves_enabled": true, "power_ups": false}'::jsonb,
  NOW(),
  NOW()
);