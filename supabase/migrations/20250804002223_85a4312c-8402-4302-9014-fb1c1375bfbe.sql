-- Create table for storing user Twitter account connections
CREATE TABLE public.user_twitter_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  twitter_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  display_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, twitter_user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_twitter_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own Twitter accounts" 
ON public.user_twitter_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Twitter accounts" 
ON public.user_twitter_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Twitter accounts" 
ON public.user_twitter_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Twitter accounts" 
ON public.user_twitter_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_twitter_accounts_updated_at
BEFORE UPDATE ON public.user_twitter_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();