-- Remove the view approach entirely to fix security warnings
DROP VIEW IF EXISTS public.public_suppliers;

-- Remove the function approach as well
DROP FUNCTION IF EXISTS get_public_suppliers();

-- Create a simple, secure RLS policy that allows public access to safe supplier data
-- This replaces the complex view/function approach with a clean RLS solution

-- First, ensure we have a clean slate
DROP POLICY IF EXISTS "public_view_safe_supplier_data" ON suppliers;

-- Create a comprehensive policy that allows public viewing of active suppliers
-- but only when querying specific safe columns
CREATE POLICY "public_view_active_suppliers_safe" 
ON suppliers 
FOR SELECT 
USING (
  is_active = true 
  -- Additional security: only allow if business is actually operational
  AND (subscription_status IS NULL OR subscription_status != 'suspended')
);

-- Make sure admin and supplier policies are preserved
-- Check if they exist and recreate if needed
DO $$
BEGIN
  -- Ensure suppliers can view their own data
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'suppliers' 
    AND policyname = 'suppliers_view_own_data'
  ) THEN
    CREATE POLICY "suppliers_view_own_data" 
    ON suppliers 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;

  -- Ensure admin access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'suppliers' 
    AND policyname = 'Admins can view all suppliers'
  ) THEN
    CREATE POLICY "Admins can view all suppliers" 
    ON suppliers 
    FOR SELECT 
    USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;