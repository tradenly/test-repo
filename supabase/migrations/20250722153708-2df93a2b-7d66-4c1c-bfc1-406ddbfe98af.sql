-- Ensure Space Invaders game settings exist in the database
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
) ON CONFLICT (game_type) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  entry_cost_credits = EXCLUDED.entry_cost_credits,
  payout_multipliers = EXCLUDED.payout_multipliers,
  special_features = EXCLUDED.special_features,
  updated_at = NOW();