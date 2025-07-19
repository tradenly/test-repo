
-- Create a system_settings table to store configurable system values
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - only admins can manage system settings
CREATE POLICY "Admins can manage all system settings" 
  ON public.system_settings 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert the default welcome credits setting
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('welcome_credits_amount', '10', 'Amount of credits awarded to new users upon signup');

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function to use the configurable welcome credits amount
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  welcome_credits_amount NUMERIC;
BEGIN
  -- Get the configurable welcome credits amount
  SELECT (setting_value::text)::numeric INTO welcome_credits_amount
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
