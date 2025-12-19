-- Add image_url column to calc_prints for storing print photos
ALTER TABLE public.calc_prints ADD COLUMN IF NOT EXISTS image_url text;