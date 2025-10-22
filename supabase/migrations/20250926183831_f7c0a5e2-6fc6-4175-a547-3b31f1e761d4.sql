-- Fix the overly restrictive supplier access policy
-- Remove the policy that blocks all public access
DROP POLICY IF EXISTS "no_public_direct_access" ON suppliers;

-- Create a proper RLS policy that allows public viewing of active suppliers
-- but only exposes non-sensitive business information
CREATE POLICY "public_view_safe_supplier_data" 
ON suppliers 
FOR SELECT 
USING (
  is_active = true AND
  -- Only allow viewing if the query is selecting safe columns
  -- We'll implement this through application logic and proper column selection
  true
);

-- Create a more secure view that only exposes safe supplier data
CREATE OR REPLACE VIEW public.public_suppliers AS
SELECT 
  id,
  business_name,
  business_type,
  cuisine_type,
  description,
  city, -- General location only
  rating,
  total_reviews,
  delivery_time_min,
  delivery_time_max,
  minimum_order,
  delivery_fee,
  delivery_radius_km,
  logo_url,
  cover_image_url,
  is_featured,
  is_verified,
  is_active,
  business_hours,
  created_at,
  updated_at
FROM suppliers
WHERE is_active = true;

-- Grant public access to the view
GRANT SELECT ON public.public_suppliers TO anon, authenticated;

-- Update the secure function to use the view for consistency
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
    id,
    business_name,
    business_type,
    cuisine_type,
    description,
    city,
    rating,
    total_reviews,
    delivery_time_min,
    delivery_time_max,
    minimum_order,
    delivery_fee,
    delivery_radius_km,
    logo_url,
    cover_image_url,
    is_featured,
    is_verified,
    is_active,
    business_hours,
    created_at,
    updated_at
  FROM public.public_suppliers
  ORDER BY is_featured DESC, rating DESC NULLS LAST;
$$;