
-- Create user_referrals table to store unique referral codes for each user
CREATE TABLE public.user_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral_transactions table to track successful referrals
CREATE TABLE public.referral_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  credits_awarded NUMERIC NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for user_referrals
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral codes" 
  ON public.user_referrals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes" 
  ON public.user_referrals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral codes" 
  ON public.user_referrals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add RLS policies for referral_transactions
ALTER TABLE public.referral_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral transactions" 
  ON public.referral_transactions 
  FOR SELECT 
  USING (auth.uid() = referrer_user_id);

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character alphanumeric code
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.user_referrals WHERE referral_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Function to create referral code for new users
CREATE OR REPLACE FUNCTION public.create_user_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_referrals (user_id, referral_code)
  VALUES (NEW.id, public.generate_referral_code());
  RETURN NEW;
END;
$$;

-- Trigger to automatically create referral code when user signs up
CREATE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_referral_code();

-- Function to process referral when user signs up with a code
CREATE OR REPLACE FUNCTION public.process_referral_signup(
  new_user_id UUID,
  referral_code_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_id UUID;
  current_balance NUMERIC;
BEGIN
  -- Find the referrer user
  SELECT user_id INTO referrer_id
  FROM public.user_referrals
  WHERE referral_code = referral_code_param;
  
  -- If no referrer found or user trying to refer themselves, return false
  IF referrer_id IS NULL OR referrer_id = new_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Get current referrer balance
  SELECT balance INTO current_balance
  FROM public.user_credits
  WHERE user_id = referrer_id;
  
  -- Update or create referrer credits
  IF current_balance IS NOT NULL THEN
    UPDATE public.user_credits
    SET 
      balance = balance + 5,
      updated_at = now()
    WHERE user_id = referrer_id;
  ELSE
    INSERT INTO public.user_credits (user_id, balance)
    VALUES (referrer_id, 5);
  END IF;
  
  -- Record the referral transaction
  INSERT INTO public.referral_transactions (
    referrer_user_id,
    referred_user_id,
    referral_code,
    credits_awarded,
    status,
    completed_at
  ) VALUES (
    referrer_id,
    new_user_id,
    referral_code_param,
    5,
    'completed',
    now()
  );
  
  -- Record the credit transaction
  INSERT INTO public.credit_transactions (
    user_id,
    transaction_type,
    amount,
    description,
    status,
    completed_at
  ) VALUES (
    referrer_id,
    'earned',
    5,
    'Referral bonus - friend signed up using code: ' || referral_code_param,
    'completed',
    now()
  );
  
  RETURN TRUE;
END;
$$;
