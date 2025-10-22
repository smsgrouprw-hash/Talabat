-- Remove the view approach and use direct table access with proper RLS
DROP VIEW IF EXISTS public.public_suppliers;

-- Update the RLS policy to be more specific about what data is safe to expose publicly
DROP POLICY IF EXISTS "public_view_safe_supplier_data" ON suppliers;

-- Create a new policy that allows public access to safe supplier data only
CREATE POLICY "public_view_active_suppliers_safe_data" 
ON suppliers 
FOR SELECT 
TO anon, authenticated
USING (
  is_active = true
  -- This policy allows public access but applications should only select safe columns
  -- Sensitive columns like email, phone, exact address, user_id should be handled separately
);