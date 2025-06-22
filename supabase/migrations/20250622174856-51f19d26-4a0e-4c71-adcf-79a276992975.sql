
-- Generate referral codes for existing users who don't have them
INSERT INTO public.user_referrals (user_id, referral_code)
SELECT 
  au.id,
  public.generate_referral_code()
FROM auth.users au
LEFT JOIN public.user_referrals ur ON au.id = ur.user_id
WHERE ur.user_id IS NULL;
