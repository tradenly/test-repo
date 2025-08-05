-- Add authentication method and scheduling fields to user_twitter_accounts table
ALTER TABLE public.user_twitter_accounts 
ADD COLUMN IF NOT EXISTS authentication_method TEXT DEFAULT 'oauth_v2' CHECK (authentication_method IN ('oauth_v1', 'oauth_v2'));

-- Add enhanced scheduling fields to ai_agent_schedules table
ALTER TABLE public.ai_agent_schedules
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS frequency_minutes INTEGER DEFAULT 60 CHECK (frequency_minutes >= 15),
ADD COLUMN IF NOT EXISTS max_posts_per_day INTEGER DEFAULT 24 CHECK (max_posts_per_day >= 1),
ADD COLUMN IF NOT EXISTS active_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7] CHECK (array_length(active_days, 1) >= 1),
ADD COLUMN IF NOT EXISTS keywords TEXT[],
ADD COLUMN IF NOT EXISTS reply_keywords TEXT[];