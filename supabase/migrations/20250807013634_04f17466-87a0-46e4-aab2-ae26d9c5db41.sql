-- Phase 1: Clean Slate Database Setup
-- Drop existing Twitter-related tables and functions
DROP TABLE IF EXISTS user_twitter_accounts CASCADE;
DROP TABLE IF EXISTS user_twitter_oauth CASCADE;
DROP TABLE IF EXISTS agent_twitter_links CASCADE;
DROP TABLE IF EXISTS agent_posts CASCADE;

-- Create new user_twitter_connections table with proper OAuth 2.0 fields
CREATE TABLE public.user_twitter_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  twitter_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  display_name TEXT,
  profile_image_url TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT DEFAULT 'tweet.read tweet.write users.read',
  is_active BOOLEAN NOT NULL DEFAULT true,
  connection_status TEXT NOT NULL DEFAULT 'active',
  last_used_at TIMESTAMP WITH TIME ZONE,
  rate_limit_reset TIMESTAMP WITH TIME ZONE,
  rate_limit_remaining INTEGER DEFAULT 300,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, twitter_user_id)
);

-- Create agent_posts table with proper user tracking
CREATE TABLE public.agent_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_signup_id UUID NOT NULL,
  twitter_connection_id UUID NOT NULL,
  content TEXT NOT NULL,
  twitter_post_id TEXT,
  post_type TEXT NOT NULL DEFAULT 'agent_generated',
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  posted_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comprehensive logging table
CREATE TABLE public.twitter_api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  twitter_connection_id UUID,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_data JSONB,
  response_data JSONB,
  status_code INTEGER,
  error_message TEXT,
  execution_time_ms INTEGER,
  rate_limit_remaining INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create OAuth state management table
CREATE TABLE public.oauth_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  state_token TEXT NOT NULL UNIQUE,
  code_verifier TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_twitter_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twitter_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_twitter_connections
CREATE POLICY "Users can manage their own Twitter connections" 
ON public.user_twitter_connections 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all Twitter connections" 
ON public.user_twitter_connections 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for agent_posts
CREATE POLICY "Users can manage their own agent posts" 
ON public.agent_posts 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all agent posts" 
ON public.agent_posts 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for twitter_api_logs
CREATE POLICY "Users can view their own Twitter API logs" 
ON public.twitter_api_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all Twitter API logs" 
ON public.twitter_api_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for oauth_states
CREATE POLICY "Users can manage their own OAuth states" 
ON public.oauth_states 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_twitter_connections_user_id ON public.user_twitter_connections(user_id);
CREATE INDEX idx_user_twitter_connections_active ON public.user_twitter_connections(user_id, is_active);
CREATE INDEX idx_agent_posts_user_id ON public.agent_posts(user_id);
CREATE INDEX idx_agent_posts_status ON public.agent_posts(status, scheduled_for);
CREATE INDEX idx_twitter_api_logs_user_id ON public.twitter_api_logs(user_id);
CREATE INDEX idx_oauth_states_token ON public.oauth_states(state_token);
CREATE INDEX idx_oauth_states_expires ON public.oauth_states(expires_at);

-- Create function to clean up expired OAuth states
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_states()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.oauth_states 
  WHERE expires_at < now() - INTERVAL '1 hour';
END;
$$;

-- Create function to update connection last_used_at
CREATE OR REPLACE FUNCTION public.update_twitter_connection_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_twitter_connections 
  SET last_used_at = now(), updated_at = now()
  WHERE id = NEW.twitter_connection_id;
  RETURN NEW;
END;
$$;

-- Create trigger for updating connection usage
CREATE TRIGGER update_twitter_connection_usage_trigger
  AFTER INSERT ON public.agent_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_twitter_connection_usage();

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_user_twitter_connections_updated_at
  BEFORE UPDATE ON public.user_twitter_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_posts_updated_at
  BEFORE UPDATE ON public.agent_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();