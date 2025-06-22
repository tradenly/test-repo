

-- Update the handle_new_user function to better support Google OAuth users AND award welcome credits
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

