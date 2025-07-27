-- Add social media credentials fields to ai_agent_signups table
ALTER TABLE public.ai_agent_signups 
ADD COLUMN social_username TEXT,
ADD COLUMN social_password TEXT;