
-- Drop and recreate the leaderboard_stats view to fix Security Definer issue
DROP VIEW IF EXISTS public.leaderboard_stats;

-- Recreate the view as a regular view (not SECURITY DEFINER)
CREATE VIEW public.leaderboard_stats AS
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
  SUM(gs.pipes_passed) as total_pipes_passed,
  COALESCE(MAX((gs.metadata->>'level')::integer), 0) as highest_level,
  COALESCE(SUM((gs.metadata->>'lines_cleared')::integer), 0) as total_lines_cleared
FROM public.game_sessions gs
LEFT JOIN public.profiles p ON gs.user_id = p.id
WHERE gs.completed_at IS NOT NULL
GROUP BY gs.user_id, p.username, p.full_name;

-- Grant SELECT permissions to authenticated and anonymous users
GRANT SELECT ON public.leaderboard_stats TO authenticated;
GRANT SELECT ON public.leaderboard_stats TO anon;

-- Ensure the underlying tables have appropriate RLS policies
-- Add a policy to game_sessions to allow public read access for leaderboard purposes
DROP POLICY IF EXISTS "Leaderboard stats are publicly viewable" ON public.game_sessions;
CREATE POLICY "Leaderboard stats are publicly viewable" 
  ON public.game_sessions 
  FOR SELECT 
  USING (completed_at IS NOT NULL);

-- Add a policy to profiles to allow public read access for leaderboard purposes  
DROP POLICY IF EXISTS "Profiles are publicly viewable for leaderboard" ON public.profiles;
CREATE POLICY "Profiles are publicly viewable for leaderboard" 
  ON public.profiles 
  FOR SELECT 
  USING (true);
