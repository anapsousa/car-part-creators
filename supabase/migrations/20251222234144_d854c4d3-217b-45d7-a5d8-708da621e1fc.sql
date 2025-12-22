-- Create separate storage buckets for different content types
-- Product images stay public, user-generated content becomes private

-- Create private bucket for user-generated 3D designs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-designs', 'user-designs', false)
ON CONFLICT (id) DO NOTHING;

-- Create private bucket for user reference images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-references', 'user-references', false)
ON CONFLICT (id) DO NOTHING;

-- Create private bucket for calculator print images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('calc-prints', 'calc-prints', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for user-designs bucket
-- Users can upload their own design files (folder structure: {user_id}/{filename})
CREATE POLICY "Users can upload own design files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-designs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own design files
CREATE POLICY "Users can view own design files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-designs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own design files
CREATE POLICY "Users can update own design files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-designs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own design files
CREATE POLICY "Users can delete own design files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-designs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Service role can manage all design files (for edge functions)
CREATE POLICY "Service role can manage design files"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'user-designs')
WITH CHECK (bucket_id = 'user-designs');

-- RLS Policies for user-references bucket
CREATE POLICY "Users can upload own reference images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-references' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own reference images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-references' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own reference images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-references' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for calc-prints bucket
CREATE POLICY "Users can upload own calc print images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'calc-prints' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own calc print images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'calc-prints' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own calc print images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'calc-prints' AND
  auth.uid()::text = (storage.foldername(name))[1]
);