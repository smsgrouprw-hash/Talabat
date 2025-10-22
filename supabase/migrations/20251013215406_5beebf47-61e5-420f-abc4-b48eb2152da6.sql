-- Create promotional_slides table for slideshow management
CREATE TABLE IF NOT EXISTS public.promotional_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  image_url TEXT NOT NULL,
  discount_text TEXT,
  discount_text_ar TEXT,
  button_url TEXT DEFAULT '/customer-suppliers',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotional_slides ENABLE ROW LEVEL SECURITY;

-- Public can view active slides
CREATE POLICY "public_view_active_slides"
ON public.promotional_slides
FOR SELECT
USING (is_active = true);

-- Admins can manage all slides
CREATE POLICY "admins_manage_slides"
ON public.promotional_slides
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create app_settings table for featured restaurants mode
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage settings
CREATE POLICY "admins_manage_settings"
ON public.app_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public can view settings
CREATE POLICY "public_view_settings"
ON public.app_settings
FOR SELECT
USING (true);

-- Insert default featured restaurants settings
INSERT INTO public.app_settings (setting_key, setting_value)
VALUES 
  ('featured_restaurants_mode', '{"mode": "automatic", "limit": 5}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_promotional_slides_updated_at
  BEFORE UPDATE ON public.promotional_slides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();