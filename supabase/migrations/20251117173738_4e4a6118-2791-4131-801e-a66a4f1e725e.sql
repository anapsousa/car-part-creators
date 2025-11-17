-- Make design-files bucket public so users can download their generated models
UPDATE storage.buckets 
SET public = true 
WHERE id = 'design-files';