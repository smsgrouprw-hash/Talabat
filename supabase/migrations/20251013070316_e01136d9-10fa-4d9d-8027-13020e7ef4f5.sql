-- Add Arabic language support columns to suppliers table
ALTER TABLE public.suppliers
ADD COLUMN IF NOT EXISTS business_name_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS address_ar TEXT;

-- Update existing suppliers to copy current values to English columns if needed
-- (This ensures backward compatibility)
COMMENT ON COLUMN public.suppliers.business_name_ar IS 'Business name in Arabic';
COMMENT ON COLUMN public.suppliers.description_ar IS 'Business description in Arabic';
COMMENT ON COLUMN public.suppliers.address_ar IS 'Business address in Arabic';