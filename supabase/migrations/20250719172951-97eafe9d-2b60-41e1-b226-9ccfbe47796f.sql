
-- Fix the handle_new_user function to properly extract numeric value from JSONB
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  welcome_credits_amount NUMERIC;
BEGIN
  -- Get the configurable welcome credits amount - fix JSONB casting
  SELECT (setting_value->>0)::numeric INTO welcome_credits_amount
  FROM public.system_settings 
  WHERE setting_key = 'welcome_credits_amount';
  
  -- Fall back to 10 if not found
  IF welcome_credits_amount IS NULL THEN
    welcome_credits_amount := 10.0;
  END IF;

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
    VALUES (NEW.id, welcome_credits_amount)
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
      welcome_credits_amount,
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
