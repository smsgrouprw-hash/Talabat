-- Add social media and business links to suppliers table
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS google_business_url text,
ADD COLUMN IF NOT EXISTS youtube_url text,
ADD COLUMN IF NOT EXISTS facebook_url text,
ADD COLUMN IF NOT EXISTS instagram_url text;

COMMENT ON COLUMN public.suppliers.google_business_url IS 'Google My Business profile URL';
COMMENT ON COLUMN public.suppliers.youtube_url IS 'YouTube channel URL';
COMMENT ON COLUMN public.suppliers.facebook_url IS 'Facebook page URL';
COMMENT ON COLUMN public.suppliers.instagram_url IS 'Instagram profile URL';