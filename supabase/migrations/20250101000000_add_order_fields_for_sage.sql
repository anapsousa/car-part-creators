-- Migration: Add fields to orders table for Sage invoicing and proper payment tracking
-- This ensures Supabase is the source of truth for orders, Stripe is just payment collection

-- Add fields for customer information (normalized from guest/user data)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Add currency field (always EUR for now)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

-- Add payment method tracking (card, mbway, multibanco, apple_pay, google_pay, etc.)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add payment intent ID for linking to Stripe PaymentIntents
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Add paid timestamp (when payment was confirmed via webhook)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Add Sage invoicing fields
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS invoice_created BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Populate customer_email and customer_name from existing data
UPDATE orders 
SET 
  customer_email = COALESCE(guest_email, (SELECT email FROM auth.users WHERE id = user_id)),
  customer_name = COALESCE(guest_name, (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = user_id));

-- Set currency for existing orders
UPDATE orders SET currency = 'EUR' WHERE currency IS NULL;

-- Create index on invoice_created for easy filtering
CREATE INDEX IF NOT EXISTS idx_orders_invoice_created ON orders(invoice_created) WHERE invoice_created = FALSE;

-- Create index on paid_at for querying paid orders
CREATE INDEX IF NOT EXISTS idx_orders_paid_at ON orders(paid_at) WHERE paid_at IS NOT NULL;

-- Create index on payment_method for analytics
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method) WHERE payment_method IS NOT NULL;

-- Add product_name to order_items for Sage invoicing (store snapshot at time of purchase)
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_name TEXT;

-- Populate product_name from products table for existing order_items
UPDATE order_items oi
SET product_name = p.name
FROM products p
WHERE oi.product_id = p.id AND oi.product_name IS NULL;

-- Add comment explaining the architecture
COMMENT ON COLUMN orders.customer_email IS 'Customer email (normalized from guest_email or user email) - source of truth for invoicing';
COMMENT ON COLUMN orders.customer_name IS 'Customer name (normalized from guest_name or user name) - source of truth for invoicing';
COMMENT ON COLUMN orders.payment_method IS 'Payment method used: card, mbway, multibanco, apple_pay, google_pay, etc.';
COMMENT ON COLUMN orders.paid_at IS 'Timestamp when payment was confirmed via webhook (payment_intent.succeeded)';
COMMENT ON COLUMN orders.invoice_created IS 'Whether invoice has been created in Sage - used for manual invoicing workflow';
COMMENT ON COLUMN orders.invoice_number IS 'Sage invoice number after invoice is created';
COMMENT ON COLUMN orders.stripe_payment_intent_id IS 'Stripe PaymentIntent ID for delayed payment methods (MBWay, Multibanco)';
COMMENT ON COLUMN order_items.product_name IS 'Product name snapshot at time of purchase - for Sage invoicing even if product is deleted/renamed';

