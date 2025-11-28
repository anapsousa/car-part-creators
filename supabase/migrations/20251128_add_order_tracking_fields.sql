-- Add tracking fields to orders table for order tracking functionality
ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN estimated_delivery DATE;

-- Create index on tracking_number for faster lookups
CREATE INDEX idx_orders_tracking_number ON public.orders(tracking_number);