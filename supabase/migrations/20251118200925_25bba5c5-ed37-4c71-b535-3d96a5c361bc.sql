-- Create storage policies for product images in design-files bucket
-- Allow admins to upload product images
CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'design-files' 
  AND (storage.foldername(name))[1] = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Allow admins to update product images
CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'design-files' 
  AND (storage.foldername(name))[1] = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Allow admins to delete product images
CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'design-files' 
  AND (storage.foldername(name))[1] = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Allow everyone to view product images (since bucket is public)
CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'design-files' 
  AND (storage.foldername(name))[1] = 'product-images'
);