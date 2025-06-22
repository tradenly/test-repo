
-- Fix the handle_new_user function to properly handle the app_role type and add error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create the user profile first (this should never fail)
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'preferred_username',
      SPLIT_PART(NEW.email, '@', 1)
    )
  );
  
  -- Initialize user credits (with error handling)
  BEGIN
    INSERT INTO public.user_credits (user_id, balance)
    VALUES (NEW.id, 10.0)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the entire function
    RAISE NOTICE 'Failed to create user credits for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Record the welcome credit transaction (with error handling)
  BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the entire function
    RAISE NOTICE 'Failed to create welcome credit transaction for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Assign default user role (with error handling and explicit type casting)
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the entire function
    RAISE NOTICE 'Failed to assign user role for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the triggers are properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_referral ON auth.users;

-- Create the main user creation trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create the referral code generation trigger
CREATE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_referral_code();
