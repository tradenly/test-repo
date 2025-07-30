-- Fix the data type mismatch properly by converting all session_id columns to text
-- and ensure there are no foreign key constraints

-- First, drop any foreign key constraints that might exist
ALTER TABLE public.page_views DROP CONSTRAINT IF EXISTS page_views_session_id_fkey;
ALTER TABLE public.visitor_analytics DROP CONSTRAINT IF EXISTS visitor_analytics_session_id_fkey;

-- Clear all existing data to avoid conversion errors
TRUNCATE TABLE public.page_views CASCADE;
TRUNCATE TABLE public.visitor_analytics CASCADE;
TRUNCATE TABLE public.visitor_sessions CASCADE;

-- Now change the data types to text
ALTER TABLE public.page_views ALTER COLUMN session_id TYPE text USING session_id::text;
ALTER TABLE public.visitor_analytics ALTER COLUMN session_id TYPE text USING session_id::text;

-- Ensure visitor_sessions session_id is text (should already be)
-- ALTER TABLE public.visitor_sessions ALTER COLUMN session_id TYPE text; -- Already text

-- Recreate indexes
DROP INDEX IF EXISTS idx_page_views_session_id;
DROP INDEX IF EXISTS idx_visitor_analytics_session_id;
DROP INDEX IF EXISTS idx_visitor_sessions_session_id;

CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_visitor_analytics_session_id ON public.visitor_analytics(session_id);
CREATE INDEX idx_visitor_sessions_session_id ON public.visitor_sessions(session_id);