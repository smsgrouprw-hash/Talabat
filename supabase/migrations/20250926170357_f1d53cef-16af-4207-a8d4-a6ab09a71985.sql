-- Add multilingual fields to products table
ALTER TABLE products 
ADD COLUMN name_en TEXT,
ADD COLUMN name_ar TEXT,
ADD COLUMN description_en TEXT,
ADD COLUMN description_ar TEXT;

-- Update existing products to use name_en field
UPDATE products SET name_en = name WHERE name_en IS NULL;

-- Make name_en required (since we're replacing the name field functionality)
ALTER TABLE products ALTER COLUMN name_en SET NOT NULL;

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Create RLS policies for product images
CREATE POLICY "Suppliers can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid() IN (
    SELECT user_id 
    FROM suppliers 
    WHERE auth.uid() = user_id
  )
);

CREATE POLICY "Suppliers can update their product images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'product-images' 
  AND auth.uid() IN (
    SELECT user_id 
    FROM suppliers 
    WHERE auth.uid() = user_id
  )
);

CREATE POLICY "Suppliers can delete their product images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'product-images' 
  AND auth.uid() IN (
    SELECT user_id 
    FROM suppliers 
    WHERE auth.uid() = user_id
  )
);

CREATE POLICY "Anyone can view product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');