-- Migration to update RLS policies for anonymous carts and guest checkout support
-- This migration removes the old RLS policies that only allowed authenticated users
-- and replaces them with new policies that support both authenticated users (via user_id)
-- and anonymous users (via session_id for carts, is_guest_order for orders).
-- Security for anonymous sessions relies on the application correctly filtering queries by session_id.
-- Guest orders should be filtered by specific order_id or guest_email in the application.
-- The cleanup_abandoned_carts() function should be scheduled to run daily.
-- After applying this migration, anonymous cart and guest checkout features will be fully operational.

-- Section 1: Remove old RLS policies for cart_items
DROP POLICY IF EXISTS "Users can view their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON public.cart_items;

-- Section 2: Create new RLS policies for cart_items
-- Policy for SELECT: Allow authenticated users to view their own items or anonymous users to view items by session
CREATE POLICY "Users and anonymous can view cart items"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Policy for INSERT: Allow authenticated users to insert their own items or anonymous users to insert by session
CREATE POLICY "Users and anonymous can insert cart items"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

-- Policy for UPDATE: Allow authenticated users to update their own items or anonymous users to update by session
CREATE POLICY "Users and anonymous can update cart items"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Policy for DELETE: Allow authenticated users to delete their own items or anonymous users to delete by session
CREATE POLICY "Users and anonymous can delete cart items"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Section 3: Remove old RLS policies for orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- Section 4: Create new RLS policies for orders
-- Policy for SELECT by users and guests: Allow authenticated users to view their own orders or guests to view their orders
CREATE POLICY "Users and guests can view their orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR is_guest_order = true);

-- Policy for SELECT by admins: Allow admins to view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Policy for INSERT: Allow authenticated users to create their own orders or guests to create orders
CREATE POLICY "Users and guests can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR is_guest_order = true);

-- Policy for UPDATE by admins: Allow admins to update orders
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));