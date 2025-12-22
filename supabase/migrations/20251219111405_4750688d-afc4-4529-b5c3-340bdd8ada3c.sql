-- Add missing columns for guest checkout support
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS is_guest_order boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS guest_email text,
ADD COLUMN IF NOT EXISTS guest_name text;

-- Make user_id nullable to support guest orders
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;