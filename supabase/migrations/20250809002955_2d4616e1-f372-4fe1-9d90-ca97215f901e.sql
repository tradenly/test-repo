-- Create page_views table for tracking individual page visits
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  view_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scroll_depth_percent INTEGER DEFAULT 0,
  interactions_count INTEGER DEFAULT 0,
  time_on_page_seconds INTEGER,
  exit_page BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on page_views
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts for page tracking
CREATE POLICY "Allow public page view inserts" 
ON public.page_views 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admins to view all page views
CREATE POLICY "Admins can view all page views" 
ON public.page_views 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for better performance
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_page_views_view_time ON public.page_views(view_time);