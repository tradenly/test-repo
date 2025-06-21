
-- Add metadata column to game_sessions table for storing game-specific data
ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Update leaderboard_stats view to include Tetris-specific metrics
DROP VIEW IF EXISTS public.leaderboard_stats;

CREATE VIEW public.leaderboard_stats AS
SELECT 
  gs.user_id,
  p.username,
  p.full_name,
  MAX(gs.score) as highest_score,
  COUNT(*) as total_games,
  MAX(gs.duration_seconds) as longest_survival,
  ROUND(AVG(gs.score)::numeric, 2) as average_score,
  SUM(gs.credits_earned) as total_credits_earned,
  MAX(gs.created_at) as last_played,
  -- Tetris-specific metrics
  MAX(CASE WHEN gs.game_type = 'falling_logs' THEN (gs.metadata->>'level')::integer END) as highest_level,
  SUM(CASE WHEN gs.game_type = 'falling_logs' THEN (gs.metadata->>'lines_cleared')::integer ELSE 0 END) as total_lines_cleared,
  -- Flappy Hippos specific
  SUM(CASE WHEN gs.game_type = 'flappy_hippos' THEN gs.pipes_passed ELSE 0 END) as total_pipes_passed
FROM public.game_sessions gs
LEFT JOIN public.profiles p ON gs.user_id = p.id
WHERE gs.completed_at IS NOT NULL
GROUP BY gs.user_id, p.username, p.full_name;

-- Create index for better performance on game type queries
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_type ON public.game_sessions(game_type);
CREATE INDEX IF NOT EXISTS idx_game_sessions_metadata ON public.game_sessions USING gin(metadata);
