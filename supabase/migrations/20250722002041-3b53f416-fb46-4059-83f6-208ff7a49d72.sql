
-- Add Space Invaders game settings to the game_settings table
INSERT INTO public.game_settings (
  game_type,
  is_enabled,
  entry_cost_credits,
  shield_cost,
  max_shields_purchasable,
  payout_multipliers,
  special_features
) VALUES (
  'space_invaders',
  true,
  1.0,
  NULL,
  NULL,
  '{"base": 1.0, "bonus": 0.1, "wave_bonus": 0.05}'::jsonb,
  '{"waves_enabled": true, "power_ups": false}'::jsonb
) ON CONFLICT (game_type) DO NOTHING;
