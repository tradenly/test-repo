-- Add active field to ai_agent_signups table for tracking activation/deactivation
ALTER TABLE public.ai_agent_signups 
ADD COLUMN active boolean DEFAULT false;