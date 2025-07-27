-- Create AI Agent signups table
CREATE TABLE public.ai_agent_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  platform TEXT NOT NULL,
  cardano_wallet_address TEXT NOT NULL,
  
  -- Agent Profile
  agent_name TEXT,
  category TEXT,
  ticker TEXT,
  policy_id TEXT,
  market_cap_value NUMERIC,
  crypto_network TEXT,
  image_url TEXT,
  age INTEGER,
  bio TEXT,
  
  -- Agent Personality
  description TEXT,
  personality TEXT,
  first_message TEXT,
  response_style TEXT,
  adjectives TEXT,
  tone TEXT,
  appearance TEXT,
  
  -- Agent Posting Settings
  social_profile TEXT,
  posting_probability INTEGER DEFAULT 5,
  timeline_reply_probability INTEGER DEFAULT 1,
  voice_model TEXT,
  voice_type TEXT,
  trigger_api_key TEXT,
  
  -- Status and timestamps
  status TEXT DEFAULT 'pending',
  verified BOOLEAN DEFAULT false,
  ppee_tokens_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_agent_signups ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own AI agent signups" 
ON public.ai_agent_signups 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI agent signups" 
ON public.ai_agent_signups 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI agent signups" 
ON public.ai_agent_signups 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all AI agent signups" 
ON public.ai_agent_signups 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all AI agent signups" 
ON public.ai_agent_signups 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_agent_signups_updated_at
BEFORE UPDATE ON public.ai_agent_signups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();