-- Create product_categories table for food/product categories
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for product_categories
CREATE POLICY "public_view_active_product_categories" 
ON public.product_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "suppliers_view_all_product_categories" 
ON public.product_categories 
FOR SELECT 
USING (has_role(auth.uid(), 'supplier'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins_manage_product_categories" 
ON public.product_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial food categories (bilingual)
INSERT INTO public.product_categories (name_en, name_ar, sort_order) VALUES
  ('Pizza', 'بيتزا', 1),
  ('Burgers', 'برجر', 2),
  ('Sandwiches', 'سندويشات', 3),
  ('Salads', 'سلطات', 4),
  ('Appetizers', 'مقبلات', 5),
  ('Main Dishes', 'أطباق رئيسية', 6),
  ('Desserts', 'حلويات', 7),
  ('Beverages', 'مشروبات', 8),
  ('Coffee', 'قهوة', 9),
  ('Tea', 'شاي', 10),
  ('Breakfast', 'إفطار', 11),
  ('Bakery Items', 'مخبوزات', 12),
  ('Pasta', 'معكرونة', 13),
  ('Seafood', 'مأكولات بحرية', 14),
  ('Grilled Items', 'مشويات', 15),
  ('Soups', 'شوربات', 16),
  ('Snacks', 'وجبات خفيفة', 17),
  ('Ice Cream', 'آيس كريم', 18),
  ('Juices', 'عصائر', 19),
  ('Smoothies', 'سموذي', 20);

-- Add trigger for updated_at
CREATE TRIGGER update_product_categories_updated_at
BEFORE UPDATE ON public.product_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();