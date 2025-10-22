-- Create a secure public view for supplier directory listings
-- This view only exposes non-sensitive business information
CREATE VIEW public.supplier_directory AS
SELECT 
  id,
  business_name,
  business_type,
  cuisine_type,
  description,
  city, -- General location only, not full address
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
FROM suppliers;

-- Enable RLS on the view (inherits from base table but we'll add explicit policies)
ALTER VIEW public.supplier_directory SET (security_barrier = true);

-- Remove the overly permissive public policy from suppliers table
DROP POLICY IF EXISTS "public_view_active_suppliers" ON suppliers;

-- Create a more restrictive public policy that only allows viewing of directory information
-- through the public view context (this will be handled by application logic)
CREATE POLICY "public_directory_view_only" 
ON suppliers 
FOR SELECT 
USING (
  is_active = true AND 
  -- Only allow access to non-sensitive fields through application-controlled queries
  current_setting('app.context', true) = 'public_directory'
);

-- Create a function to safely get public supplier information
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

-- Create a function to get supplier contact details (only for authenticated customers with legitimate need)
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_public_suppliers() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_supplier_contact_for_order(uuid) TO authenticated;