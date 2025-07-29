-- Clear all traffic data and fix the data type issues properly
-- First truncate all tables to avoid any data type conflicts

TRUNCATE TABLE public.page_views CASCADE;
TRUNCATE TABLE public.visitor_analytics CASCADE; 
TRUNCATE TABLE public.visitor_sessions CASCADE;

-- Now fix the session_id data types to be consistent (all text)
-- These should already be text but let's ensure it

-- Add indexes for better performance on traffic analytics queries
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_start_time ON public.visitor_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_view_time ON public.page_views(view_time);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_session_id ON public.visitor_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON public.visitor_sessions(session_id);