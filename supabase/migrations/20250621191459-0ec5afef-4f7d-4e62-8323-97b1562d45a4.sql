
-- Create indexes for better leaderboard query performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_score_desc ON public.game_sessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_pipes_passed_desc ON public.game_sessions(pipes_passed DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_duration_desc ON public.game_sessions(duration_seconds DESC);

-- Create a view for leaderboard data to make queries easier
CREATE OR REPLACE VIEW public.leaderboard_stats AS
SELECT 
  gs.user_id,
  p.username,
  p.full_name,
  MAX(gs.score) as highest_score,
  COUNT(*) as total_games,
  MAX(gs.duration_seconds) as longest_survival,
  AVG(gs.score) as average_score,
  SUM(gs.credits_earned) as total_credits_earned,
  MAX(gs.created_at) as last_played
FROM public.game_sessions gs
LEFT JOIN public.profiles p ON gs.user_id = p.id
WHERE gs.completed_at IS NOT NULL
GROUP BY gs.user_id, p.username, p.full_name;

-- Add RLS policy for the view (make it publicly readable for leaderboards)
CREATE POLICY "Leaderboard stats are publicly viewable" 
  ON public.game_sessions 
  FOR SELECT 
  USING (true);
