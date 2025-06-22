
-- First, drop any existing trigger to ensure clean state
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_referral ON auth.users;

-- Update the handle_new_user function to properly support Google OAuth and award credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- For Google OAuth users, the metadata structure is different
  -- Google provides: full_name, avatar_url, email, email_verified, etc.
  
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1) -- fallback to email username part
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'preferred_username',
      SPLIT_PART(NEW.email, '@', 1) -- fallback to email username part
    )
  );
  
  -- Initialize user credits for new users (10 credits welcome bonus)
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (NEW.id, 10.0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Record the welcome credit transaction
  INSERT INTO public.credit_transactions (
    user_id,
    transaction_type,
    amount,
    description,
    status,
    completed_at
  ) VALUES (
    NEW.id,
    'bonus',
    10.0,
    'Welcome bonus for new user signup',
    'completed',
    now()
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger to call handle_new_user on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create the trigger for referral code generation
CREATE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_referral_code();

-- Backfill credits for recent users who didn't receive welcome credits
-- First, identify users who don't have any credit transactions
WITH users_without_welcome_credits AS (
  SELECT DISTINCT u.id, u.email
  FROM auth.users u
  LEFT JOIN public.credit_transactions ct ON u.id = ct.user_id AND ct.description LIKE '%Welcome bonus%'
  WHERE ct.id IS NULL
    AND u.created_at > '2025-06-20'::timestamp -- Only recent users
)
INSERT INTO public.user_credits (user_id, balance)
SELECT id, 10.0
FROM users_without_welcome_credits
ON CONFLICT (user_id) DO UPDATE SET balance = user_credits.balance + 10.0;

-- Record welcome credit transactions for backfilled users
WITH users_without_welcome_credits AS (
  SELECT DISTINCT u.id, u.email
  FROM auth.users u
  LEFT JOIN public.credit_transactions ct ON u.id = ct.user_id AND ct.description LIKE '%Welcome bonus%'
  WHERE ct.id IS NULL
    AND u.created_at > '2025-06-20'::timestamp -- Only recent users
)
INSERT INTO public.credit_transactions (
  user_id,
  transaction_type,
  amount,
  description,
  status,
  completed_at
) 
SELECT 
  id,
  'bonus',
  10.0,
  'Welcome bonus (backfilled for existing user)',
  'completed',
  now()
FROM users_without_welcome_credits;
