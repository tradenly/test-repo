-- Fix the core issues and simplify the architecture

-- First, let's create a proper Twitter OAuth tokens table
CREATE TABLE IF NOT EXISTS public.user_twitter_oauth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  twitter_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, twitter_user_id)
);

-- Enable RLS
ALTER TABLE public.user_twitter_oauth ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own Twitter OAuth tokens"
ON public.user_twitter_oauth
FOR ALL
USING (auth.uid() = user_id);

-- Create a simpler agent posts table
CREATE TABLE IF NOT EXISTS public.agent_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  twitter_oauth_id UUID NOT NULL REFERENCES public.user_twitter_oauth(id),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, posted, failed
  twitter_post_id TEXT,
  error_message TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own agent posts"
ON public.agent_posts
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_twitter_oauth_user_id ON public.user_twitter_oauth(user_id);
CREATE INDEX IF NOT EXISTS idx_user_twitter_oauth_active ON public.user_twitter_oauth(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_agent_posts_user_id ON public.agent_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_posts_status ON public.agent_posts(status);