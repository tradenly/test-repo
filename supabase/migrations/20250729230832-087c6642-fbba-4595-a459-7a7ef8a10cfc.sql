-- Remove foreign key constraints and fix the session_id data type issues
-- We need to drop the foreign keys first, then fix data types

-- Drop foreign key constraints if they exist
ALTER TABLE public.page_views DROP CONSTRAINT IF EXISTS page_views_session_id_fkey;
ALTER TABLE public.visitor_analytics DROP CONSTRAINT IF EXISTS visitor_analytics_session_id_fkey;

-- Clean up any orphaned data first
DELETE FROM public.page_views WHERE session_id NOT IN (SELECT session_id FROM public.visitor_sessions WHERE session_id IS NOT NULL);
DELETE FROM public.visitor_analytics WHERE session_id NOT IN (SELECT session_id FROM public.visitor_sessions WHERE session_id IS NOT NULL);

-- Now alter the data types to text to match visitor_sessions
ALTER TABLE public.page_views ALTER COLUMN session_id TYPE text;
ALTER TABLE public.visitor_analytics ALTER COLUMN session_id TYPE text;

-- Add indexes for better performance on traffic analytics queries
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_start_time ON public.visitor_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_view_time ON public.page_views(view_time);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_session_id ON public.visitor_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON public.visitor_sessions(session_id);

-- Clean up any remaining invalid data
DELETE FROM public.page_views WHERE session_id IS NULL OR session_id = '';
DELETE FROM public.visitor_analytics WHERE session_id IS NULL OR session_id = '';
DELETE FROM public.visitor_sessions WHERE session_id IS NULL OR session_id = '';