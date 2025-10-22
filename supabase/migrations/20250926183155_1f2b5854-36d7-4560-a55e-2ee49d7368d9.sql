-- Fix security warnings from the linter

-- 1. Remove the SECURITY DEFINER view and replace with proper RLS policies
DROP VIEW IF EXISTS public.supplier_directory;

-- 2. Fix the functions by setting search_path properly
CREATE OR REPLACE FUNCTION get_public_suppliers()
RETURNS TABLE(
  id uuid,
  business_name varchar,
  business_type varchar,
  cuisine_type varchar,
  description text,
  city varchar,
  rating numeric,
  total_reviews integer,
  delivery_time_min integer,
  delivery_time_max integer,
  minimum_order numeric,
  delivery_fee numeric,
  delivery_radius_km numeric,
  logo_url text,
  cover_image_url text,
  is_featured boolean,
  is_verified boolean,
  is_active boolean,
  business_hours jsonb,
  created_at timestamptz,
  updated_at timestamptz
) 
LANGUAGE sql 
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    s.id,
    s.business_name,
    s.business_type,
    s.cuisine_type,
    s.description,
    s.city,
    s.rating,
    s.total_reviews,
    s.delivery_time_min,
    s.delivery_time_max,
    s.minimum_order,
    s.delivery_fee,
    s.delivery_radius_km,
    s.logo_url,
    s.cover_image_url,
    s.is_featured,
    s.is_verified,
    s.is_active,
    s.business_hours,
    s.created_at,
    s.updated_at
  FROM suppliers s
  WHERE s.is_active = true;
$$;

-- Fix the contact function search path
CREATE OR REPLACE FUNCTION get_supplier_contact_for_order(supplier_id uuid)
RETURNS TABLE(
  business_name varchar,
  phone varchar,
  email varchar,
  address text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    s.business_name,
    s.phone,
    s.email,
    s.address
  FROM suppliers s
  WHERE s.id = supplier_id 
    AND s.is_active = true
    AND auth.uid() IS NOT NULL -- Must be authenticated
    AND has_role(auth.uid(), 'customer'); -- Must be a customer
$$;

-- Replace the complex policy with a simpler approach
-- Remove the old policy completely
DROP POLICY IF EXISTS "public_directory_view_only" ON suppliers;

-- Create a new policy that completely restricts public access to the suppliers table
-- Public access will only be through the secure function
CREATE POLICY "no_public_direct_access" 
ON suppliers 
FOR SELECT 
USING (false); -- No direct public access

-- Re-enable the existing policies for authenticated users
-- (these should already exist but let's make sure)

-- Ensure suppliers can still manage their own data
DO $$
BEGIN
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
END $$;

-- Ensure admin access is maintained
DO $$
BEGIN
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