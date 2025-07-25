-- Create visitor sessions table for tracking all website visitors
CREATE TABLE public.visitor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID NULL, -- NULL for anonymous visitors, populated if they log in
  ip_address INET NOT NULL,
  user_agent TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE NULL,
  duration_seconds INTEGER NULL,
  page_count INTEGER NOT NULL DEFAULT 0,
  is_bounce BOOLEAN NOT NULL DEFAULT true,
  referrer TEXT NULL,
  utm_source TEXT NULL,
  utm_medium TEXT NULL,
  utm_campaign TEXT NULL,
  utm_term TEXT NULL,
  utm_content TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create page views table for detailed page tracking
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.visitor_sessions(id) ON DELETE CASCADE,
  user_id UUID NULL, -- NULL for anonymous visitors
  page_path TEXT NOT NULL,
  page_title TEXT NULL,
  view_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_on_page_seconds INTEGER NULL,
  exit_page BOOLEAN NOT NULL DEFAULT false,
  scroll_depth_percent INTEGER NULL DEFAULT 0,
  interactions_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visitor analytics table for IP geolocation and device data
CREATE TABLE public.visitor_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.visitor_sessions(id) ON DELETE CASCADE,
  country_code TEXT NULL,
  country_name TEXT NULL,
  region TEXT NULL,
  city TEXT NULL,
  timezone TEXT NULL,
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  isp TEXT NULL,
  device_type TEXT NULL, -- desktop, mobile, tablet
  browser_name TEXT NULL,
  browser_version TEXT NULL,
  os_name TEXT NULL,
  os_version TEXT NULL,
  screen_resolution TEXT NULL,
  viewport_size TEXT NULL,
  is_mobile BOOLEAN NOT NULL DEFAULT false,
  is_bot BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create traffic sources table for referrer tracking
CREATE TABLE public.traffic_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.visitor_sessions(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- direct, search, social, referral, email, campaign
  source_name TEXT NULL, -- google, facebook, twitter, etc.
  referrer_domain TEXT NULL,
  search_terms TEXT NULL,
  campaign_id TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_sources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access only
CREATE POLICY "Admins can view all visitor sessions" 
ON public.visitor_sessions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage visitor sessions" 
ON public.visitor_sessions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all page views" 
ON public.page_views 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage page views" 
ON public.page_views 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all visitor analytics" 
ON public.visitor_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage visitor analytics" 
ON public.visitor_analytics 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all traffic sources" 
ON public.traffic_sources 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage traffic sources" 
ON public.traffic_sources 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_visitor_sessions_start_time ON public.visitor_sessions(start_time);
CREATE INDEX idx_visitor_sessions_user_id ON public.visitor_sessions(user_id);
CREATE INDEX idx_visitor_sessions_ip_address ON public.visitor_sessions(ip_address);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_page_views_view_time ON public.page_views(view_time);
CREATE INDEX idx_visitor_analytics_session_id ON public.visitor_analytics(session_id);
CREATE INDEX idx_visitor_analytics_country_code ON public.visitor_analytics(country_code);
CREATE INDEX idx_traffic_sources_session_id ON public.traffic_sources(session_id);
CREATE INDEX idx_traffic_sources_source_type ON public.traffic_sources(source_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_visitor_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_visitor_sessions_updated_at
BEFORE UPDATE ON public.visitor_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_visitor_sessions_updated_at();

-- Allow public inserts for tracking (we'll validate in edge function)
CREATE POLICY "Allow public inserts to visitor sessions" 
ON public.visitor_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public inserts to page views" 
ON public.page_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public inserts to visitor analytics" 
ON public.visitor_analytics 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public inserts to traffic sources" 
ON public.traffic_sources 
FOR INSERT 
WITH CHECK (true);

-- Allow public updates for session end tracking
CREATE POLICY "Allow public updates to visitor sessions" 
ON public.visitor_sessions 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public updates to page views" 
ON public.page_views 
FOR UPDATE 
USING (true);