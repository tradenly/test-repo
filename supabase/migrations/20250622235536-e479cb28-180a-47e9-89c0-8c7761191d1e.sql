
-- Enable the admin to create users by ensuring proper RLS policies exist
-- Add policy to allow admins to insert into profiles (for manual user creation)
CREATE POLICY "Admins can insert profiles for new users"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Ensure admin can insert user credits for new users
CREATE POLICY "Admins can insert user credits for new users"
ON public.user_credits
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Ensure admin can insert user referrals for new users
CREATE POLICY "Admins can insert user referrals for new users"
ON public.user_referrals
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
