-- Create storage bucket for business images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-images', 'business-images', true);

-- Create RLS policies for business images
CREATE POLICY "Suppliers can upload business images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'business-images' 
  AND auth.uid() IN (
    SELECT user_id 
    FROM suppliers 
    WHERE auth.uid() = user_id
  )
);

CREATE POLICY "Suppliers can update their business images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'business-images' 
  AND auth.uid() IN (
    SELECT user_id 
    FROM suppliers 
    WHERE auth.uid() = user_id
  )
);

CREATE POLICY "Suppliers can delete their business images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'business-images' 
  AND auth.uid() IN (
    SELECT user_id 
    FROM suppliers 
    WHERE auth.uid() = user_id
  )
);

CREATE POLICY "Anyone can view business images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'business-images');