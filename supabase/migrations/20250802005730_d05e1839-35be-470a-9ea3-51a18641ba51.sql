-- Create a linking table for agents to Twitter accounts
CREATE TABLE IF NOT EXISTS public.agent_twitter_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  twitter_account_id UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_id, twitter_account_id)
);

-- Enable RLS
ALTER TABLE public.agent_twitter_links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own agent twitter links"
ON public.agent_twitter_links
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.ai_agent_signups 
  WHERE ai_agent_signups.id = agent_twitter_links.agent_id 
  AND ai_agent_signups.user_id = auth.uid()
));

-- Update ai_agent_schedules to properly link to Twitter accounts
ALTER TABLE public.ai_agent_schedules 
ADD COLUMN IF NOT EXISTS agent_signup_id UUID,
ADD COLUMN IF NOT EXISTS twitter_account_id UUID;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_twitter_links_agent_id ON public.agent_twitter_links(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_twitter_links_twitter_account_id ON public.agent_twitter_links(twitter_account_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_schedules_agent_signup_id ON public.ai_agent_schedules(agent_signup_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_schedules_twitter_account_id ON public.ai_agent_schedules(twitter_account_id);