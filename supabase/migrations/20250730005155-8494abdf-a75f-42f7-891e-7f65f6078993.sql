-- Create tables for Twitter integration and AI agent orchestration

-- Twitter account connections for users
CREATE TABLE IF NOT EXISTS public.user_twitter_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twitter_user_id text NOT NULL,
  username text NOT NULL,
  display_name text,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, twitter_user_id)
);

-- Enhanced agent tasks for Twitter operations
CREATE TABLE IF NOT EXISTS public.ai_agent_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id uuid,
  twitter_account_id uuid REFERENCES public.user_twitter_accounts(id) ON DELETE CASCADE,
  task_type text NOT NULL, -- 'post', 'reply', 'like', 'retweet'
  content jsonb NOT NULL, -- tweet text, media, reply_to_id, etc.
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  scheduled_for timestamp with time zone,
  executed_at timestamp with time zone,
  error_message text,
  twitter_response jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Agent posting schedules and configurations
CREATE TABLE IF NOT EXISTS public.ai_agent_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL,
  twitter_account_id uuid NOT NULL REFERENCES public.user_twitter_accounts(id) ON DELETE CASCADE,
  frequency_minutes integer NOT NULL DEFAULT 60,
  active_hours_start integer NOT NULL DEFAULT 9, -- 24hr format
  active_hours_end integer NOT NULL DEFAULT 21,
  days_of_week integer[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}', -- 1=Mon, 7=Sun
  keywords text[] NOT NULL DEFAULT '{}',
  reply_keywords text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(agent_id, twitter_account_id)
);

-- Agent activity logs
CREATE TABLE IF NOT EXISTS public.ai_agent_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL,
  task_id uuid REFERENCES public.ai_agent_tasks(id) ON DELETE SET NULL,
  log_level text NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error'
  message text NOT NULL,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_twitter_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own Twitter accounts" ON public.user_twitter_accounts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own agent tasks" ON public.ai_agent_tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own agent schedules" ON public.ai_agent_schedules
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own agent logs" ON public.ai_agent_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all logs for monitoring
CREATE POLICY "Admins can view all agent logs" ON public.ai_agent_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_ai_agent_tasks_user_id ON public.ai_agent_tasks(user_id);
CREATE INDEX idx_ai_agent_tasks_status ON public.ai_agent_tasks(status);
CREATE INDEX idx_ai_agent_tasks_scheduled_for ON public.ai_agent_tasks(scheduled_for);
CREATE INDEX idx_ai_agent_schedules_user_id ON public.ai_agent_schedules(user_id);
CREATE INDEX idx_ai_agent_schedules_active ON public.ai_agent_schedules(is_active);
CREATE INDEX idx_ai_agent_logs_user_id ON public.ai_agent_logs(user_id);
CREATE INDEX idx_ai_agent_logs_created_at ON public.ai_agent_logs(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_twitter_accounts_updated_at
  BEFORE UPDATE ON public.user_twitter_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_agent_tasks_updated_at
  BEFORE UPDATE ON public.ai_agent_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();