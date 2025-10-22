-- Fix RLS policies to allow handle_new_user() function to insert records

-- Update suppliers INSERT policy to allow service role access
DROP POLICY IF EXISTS "suppliers_insert_own_data" ON public.suppliers;

CREATE POLICY "suppliers_insert_own_data" 
ON public.suppliers 
FOR INSERT 
WITH CHECK (
  -- Allow authenticated users to insert their own record
  (auth.uid() = user_id) 
  OR 
  -- Allow service role (handle_new_user function) to insert records
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

-- Add INSERT policy for subscriptions table to allow service role access
CREATE POLICY "service_role_can_insert_subscriptions" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (
  -- Allow service role to insert subscriptions (for handle_new_user function)
  auth.uid() IS NULL
  OR
  -- Allow admins to insert subscriptions
  has_role(auth.uid(), 'admin'::app_role)
);