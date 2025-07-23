-- Drop the existing constraint
ALTER TABLE public.game_settings DROP CONSTRAINT valid_game_type;

-- Add new constraint with hippo_kong included
ALTER TABLE public.game_settings 
ADD CONSTRAINT valid_game_type 
CHECK (game_type = ANY (ARRAY['flappy_hippos'::text, 'falling_logs'::text, 'poopee_crush'::text, 'miss_poopee_man'::text, 'space_invaders'::text, 'hippo_kong'::text]));

-- Now insert the hippo_kong game settings
INSERT INTO public.game_settings (
  game_type,
  is_enabled,
  entry_cost_credits,
  payout_multipliers,
  special_features,
  created_at,
  updated_at
) VALUES (
  'hippo_kong',
  true,
  1.0,
  '{"base": 0.01, "bonus": 0.05, "time_bonus": 0.005}'::jsonb,
  '{"max_payout_multiplier": 2.0, "single_screen": true, "climbing_game": true}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (game_type) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  entry_cost_credits = EXCLUDED.entry_cost_credits,
  payout_multipliers = EXCLUDED.payout_multipliers,
  special_features = EXCLUDED.special_features,
  updated_at = NOW();