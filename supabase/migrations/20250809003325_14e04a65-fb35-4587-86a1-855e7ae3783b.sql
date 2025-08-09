-- Fix page_views RLS policy to match session-based tracking
DROP POLICY IF EXISTS "Allow public page view inserts" ON public.page_views;

-- Create new policy that allows anonymous inserts for tracking
CREATE POLICY "Allow anonymous page view inserts" 
ON public.page_views 
FOR INSERT 
WITH CHECK (true);

-- Allow updates for anonymous tracking
CREATE POLICY "Allow anonymous page view updates" 
ON public.page_views 
FOR UPDATE 
USING (true);