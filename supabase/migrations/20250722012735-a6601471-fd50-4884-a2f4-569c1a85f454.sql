
-- Add Space Invaders game settings to the database
INSERT INTO game_settings (
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
  '{}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (game_type) DO NOTHING;
