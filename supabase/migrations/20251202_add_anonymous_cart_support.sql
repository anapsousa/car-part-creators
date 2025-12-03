-- Migration to add support for anonymous carts and guest checkout
-- This migration modifies the cart_items and orders tables to allow anonymous users to add items to their cart
-- and complete orders as guests without requiring authentication.
-- RLS policies will be updated in a separate migration to handle anonymous access.
-- After applying this migration, regenerate TypeScript types automatically.

-- Section 1: Modify cart_items table to support anonymous sessions
-- Add session_id column for anonymous cart identification
ALTER TABLE public.cart_items ADD COLUMN session_id TEXT;

-- Allow user_id to be NULL for anonymous carts
ALTER TABLE public.cart_items ALTER COLUMN user_id DROP NOT NULL;

-- Remove the existing unique constraint that only considers user_id
ALTER TABLE public.cart_items DROP CONSTRAINT cart_items_user_id_product_id_key;

-- Add check constraint to ensure either user_id or session_id is present, but not both
ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_user_or_session_check
    CHECK ((user_id IS NOT NULL AND session_id IS NULL) OR (user_id IS NULL AND session_id IS NOT NULL));

-- Create index on session_id for performance
CREATE INDEX idx_cart_items_session_id ON public.cart_items(session_id);

-- Create partial unique index for authenticated users
CREATE UNIQUE INDEX cart_items_unique_user_product ON public.cart_items(user_id, product_id) WHERE user_id IS NOT NULL;

-- Create partial unique index for anonymous sessions
CREATE UNIQUE INDEX cart_items_unique_session_product ON public.cart_items(session_id, product_id) WHERE session_id IS NOT NULL;

-- Section 2: Modify orders table to support guest orders
-- Allow user_id to be NULL for guest orders
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Add columns for guest order information
ALTER TABLE public.orders ADD COLUMN guest_email TEXT;
ALTER TABLE public.orders ADD COLUMN guest_name TEXT;
ALTER TABLE public.orders ADD COLUMN is_guest_order BOOLEAN DEFAULT false;

-- Add check constraint to ensure orders have either a user_id or guest details
ALTER TABLE public.orders ADD CONSTRAINT orders_user_or_guest_check
    CHECK ((user_id IS NOT NULL AND is_guest_order = false) OR (user_id IS NULL AND is_guest_order = true AND guest_email IS NOT NULL));

-- Create index on guest_email for guest order lookups
CREATE INDEX idx_orders_guest_email ON public.orders(guest_email) WHERE is_guest_order = true;

-- Create index on is_guest_order for filtering orders by type
CREATE INDEX idx_orders_is_guest ON public.orders(is_guest_order);

-- Section 3: Create function for cleaning up abandoned anonymous carts
-- This function deletes cart items for anonymous sessions that are older than 30 days
-- It should be scheduled to run daily using pg_cron or an external cron job
CREATE OR REPLACE FUNCTION cleanup_abandoned_carts() RETURNS void AS $$
BEGIN
    DELETE FROM public.cart_items
    WHERE session_id IS NOT NULL
    AND created_at < NOW() - INTERVAL '30 days';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in cleanup_abandoned_carts: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;