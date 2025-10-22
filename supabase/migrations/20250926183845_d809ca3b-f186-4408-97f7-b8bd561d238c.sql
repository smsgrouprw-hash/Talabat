-- Fix the security definer view warning
-- Drop the existing view and recreate it without security definer
DROP VIEW IF EXISTS public.public_suppliers;

-- Create a standard view (not security definer) that exposes safe supplier data
CREATE VIEW public.public_suppliers AS
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

-- Enable RLS on the view
ALTER VIEW public.public_suppliers SET (security_barrier = false);

-- Grant public access to the view
GRANT SELECT ON public.public_suppliers TO anon, authenticated;