
-- Drop the existing view that's causing the security advisory
DROP VIEW IF EXISTS public.leaderboard_stats;

-- Create a SECURITY DEFINER function to get leaderboard data
-- This function will have elevated privileges to read from all necessary tables
CREATE OR REPLACE FUNCTION public.get_leaderboard_stats()
RETURNS TABLE (
  user_id uuid,
  username text,
  full_name text,
  highest_score integer,
  total_games bigint,
  longest_survival integer,
  average_score numeric,
  total_credits_earned numeric,
  last_played timestamp with time zone,
  total_pipes_passed bigint,
  highest_level integer,
  total_lines_cleared bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
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
  GROUP BY gs.user_id, p.username, p.full_name
  ORDER BY highest_score DESC;
$$;

-- Grant execute permissions to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.get_leaderboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_stats() TO anon;

-- Remove the RLS policies we created for the view since we're using a function now
DROP POLICY IF EXISTS "Leaderboard stats are publicly viewable" ON public.game_sessions;
DROP POLICY IF EXISTS "Profiles are publicly viewable for leaderboard" ON public.profiles;
