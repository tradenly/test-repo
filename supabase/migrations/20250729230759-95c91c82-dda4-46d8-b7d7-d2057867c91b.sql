-- Fix session_id data type inconsistency in traffic analytics tables
-- The visitor_sessions table uses text for session_id, but page_views and visitor_analytics expect uuid

-- First, let's standardize on using proper UUIDs for session_id across all tables
-- We'll modify page_views and visitor_analytics to use text to match visitor_sessions

ALTER TABLE public.page_views ALTER COLUMN session_id TYPE text;
ALTER TABLE public.visitor_analytics ALTER COLUMN session_id TYPE text;

-- Add indexes for better performance on traffic analytics queries
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_start_time ON public.visitor_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_view_time ON public.page_views(view_time);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_session_id ON public.visitor_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON public.visitor_sessions(session_id);

-- Clean up any invalid data
DELETE FROM public.page_views WHERE session_id IS NULL OR session_id = '';
DELETE FROM public.visitor_analytics WHERE session_id IS NULL OR session_id = '';
DELETE FROM public.visitor_sessions WHERE session_id IS NULL OR session_id = '';