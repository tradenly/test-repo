
-- Drop the existing view and recreate it without SECURITY DEFINER
DROP VIEW IF EXISTS public.leaderboard_stats;

-- Recreate the view without SECURITY DEFINER to avoid RLS conflicts
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
  MAX(gs.created_at) as last_played,
  MAX(gs.pipes_passed) as total_pipes_passed,
  0 as highest_level,
  0 as total_lines_cleared
FROM public.game_sessions gs
LEFT JOIN public.profiles p ON gs.user_id = p.id
WHERE gs.completed_at IS NOT NULL
GROUP BY gs.user_id, p.username, p.full_name;

-- Grant appropriate permissions to the view
GRANT SELECT ON public.leaderboard_stats TO authenticated;
GRANT SELECT ON public.leaderboard_stats TO anon;
