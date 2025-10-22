-- Ensure proper storage policies for business-images bucket

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can upload to business-images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view business-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete from business-images" ON storage.objects;

-- Allow admins to upload images
CREATE POLICY "Admins can upload to business-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow everyone to view images (since bucket is public)
CREATE POLICY "Public can view business-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'business-images');

-- Allow admins to delete images
CREATE POLICY "Admins can delete from business-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update images
CREATE POLICY "Admins can update business-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'business-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);