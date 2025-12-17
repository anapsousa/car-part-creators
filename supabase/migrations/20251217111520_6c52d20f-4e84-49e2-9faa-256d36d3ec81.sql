-- Make the design-files bucket public so product images can be displayed
UPDATE storage.buckets SET public = true WHERE id = 'design-files';