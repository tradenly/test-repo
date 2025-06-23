
-- Phase 1: Clean up duplicate referral codes for donna@email.com
-- First, let's remove the duplicate referral code (keeping the older one)
DELETE FROM public.user_referrals 
WHERE user_id = '4e4e6aba-4749-4929-8873-b250b5015928' 
AND referral_code = 'DA9466CD';

-- Add unique constraint on user_id to prevent future duplicates
ALTER TABLE public.user_referrals 
ADD CONSTRAINT user_referrals_user_id_unique UNIQUE (user_id);

-- Phase 3: Fix the trigger to prevent duplicate creation
-- Drop and recreate the trigger function with better duplicate checking
DROP FUNCTION IF EXISTS public.create_user_referral_code() CASCADE;

CREATE OR REPLACE FUNCTION public.create_user_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Only create referral code if one doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM public.user_referrals WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_referrals (user_id, referral_code)
    VALUES (NEW.id, public.generate_referral_code());
  END IF;
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_referral_code();
