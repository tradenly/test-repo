
-- Emergency fix for Space Invaders excessive payouts
UPDATE public.game_settings 
SET 
  payout_multipliers = '{"base": 0.001, "bonus": 0.01, "wave_bonus": 0.01}'::jsonb,
  updated_at = NOW()
WHERE game_type = 'space_invaders';
