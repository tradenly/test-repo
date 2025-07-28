-- Fix database security issues
-- 1. Add search_path to all functions for security

-- Update generate_referral_code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Update get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$function$;

-- Update process_confirmed_payment function
CREATE OR REPLACE FUNCTION public.process_confirmed_payment(payment_order_id uuid, transaction_hash text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  order_record public.credit_payment_orders%ROWTYPE;
  current_balance NUMERIC;
BEGIN
  -- Get the payment order
  SELECT * INTO order_record
  FROM public.credit_payment_orders
  WHERE id = payment_order_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update the payment order status
  UPDATE public.credit_payment_orders
  SET 
    status = 'confirmed',
    transaction_hash = process_confirmed_payment.transaction_hash,
    confirmed_at = now(),
    updated_at = now()
  WHERE id = payment_order_id;
  
  -- Get current user balance
  SELECT balance INTO current_balance
  FROM public.user_credits
  WHERE user_id = order_record.user_id;
  
  -- Update or insert user credits
  IF current_balance IS NOT NULL THEN
    UPDATE public.user_credits
    SET 
      balance = balance + order_record.credit_amount,
      updated_at = now()
    WHERE user_id = order_record.user_id;
  ELSE
    INSERT INTO public.user_credits (user_id, balance)
    VALUES (order_record.user_id, order_record.credit_amount);
  END IF;
  
  -- Record the transaction
  INSERT INTO public.credit_transactions (
    user_id,
    transaction_type,
    amount,
    description,
    status,
    completed_at,
    reference_id
  ) VALUES (
    order_record.user_id,
    'purchase',
    order_record.credit_amount,
    'USDC payment confirmed - ' || order_record.blockchain || ' - ' || process_confirmed_payment.transaction_hash,
    'completed',
    now(),
    payment_order_id
  );
  
  RETURN TRUE;
END;
$function$;

-- Update process_referral_signup function
CREATE OR REPLACE FUNCTION public.process_referral_signup(new_user_id uuid, referral_code_param text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

-- Update get_leaderboard_stats function
CREATE OR REPLACE FUNCTION public.get_leaderboard_stats()
 RETURNS TABLE(user_id uuid, username text, full_name text, highest_score integer, total_games bigint, longest_survival integer, average_score numeric, total_credits_earned numeric, last_played timestamp with time zone, total_pipes_passed bigint, highest_level integer, total_lines_cleared bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT 
    gs.user_id,
    p.username,
    p.full_name,
    MAX(gs.score) as highest_score,
    COUNT(*) as total_games,
    MAX(gs.duration_seconds) as longest_survival,
    AVG(gs.score) as average_score,
    SUM(gs.credits_earned) as total_credits_earned,
    MAX(gs.created_at) as last_played,
    SUM(gs.pipes_passed) as total_pipes_passed,
    COALESCE(MAX((gs.metadata->>'level')::integer), 0) as highest_level,
    COALESCE(SUM((gs.metadata->>'lines_cleared')::integer), 0) as total_lines_cleared
  FROM public.game_sessions gs
  LEFT JOIN public.profiles p ON gs.user_id = p.id
  WHERE gs.completed_at IS NOT NULL
  GROUP BY gs.user_id, p.username, p.full_name
  ORDER BY highest_score DESC;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

-- Update other functions with search_path
CREATE OR REPLACE FUNCTION public.create_user_referral_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_visitor_sessions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_contact_message_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Notify admins of new contact message
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    reference_id,
    reference_type
  )
  SELECT 
    ur.user_id,
    'New Contact Message',
    'New message from user: ' || NEW.subject,
    'contact_message',
    NEW.id,
    'contact_message'
  FROM public.user_roles ur
  WHERE ur.role = 'admin'::app_role;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_tool_request_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Only create notification if the message is from an admin
  IF NEW.is_admin_message = true THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      reference_id,
      reference_type
    )
    SELECT 
      tr.user_id,
      'Admin Reply to Your Tool Request',
      'An admin has replied to your tool request: ' || tr.subject,
      'tool_request_reply',
      tr.id,
      'tool_request'
    FROM public.tool_requests tr
    WHERE tr.id = NEW.tool_request_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_contact_reply_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Only create notification if the reply is from an admin
  IF NEW.is_admin_reply = true THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      reference_id,
      reference_type
    )
    SELECT 
      cm.user_id,
      'Admin Reply to Your Message',
      'An admin has replied to your message: ' || cm.subject,
      'contact_reply',
      cm.id,
      'contact_message'
    FROM public.contact_messages cm
    WHERE cm.id = NEW.contact_message_id;
  END IF;
  
  RETURN NEW;
END;
$function$;