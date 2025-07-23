-- Add Hippo Kong game settings to the database
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