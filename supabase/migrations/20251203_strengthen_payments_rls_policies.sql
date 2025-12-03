-- Migration to strengthen RLS policies on the payments table
-- This migration addresses critical security vulnerabilities in the payments table
-- where payment records could be accessed by unauthorized users if RLS is misconfigured.
-- 
-- Current state: The payments table has three RLS policies that allow authenticated users
-- to view/create their own payments and admins to view all payments.
-- 
-- Security gaps: No explicit policy blocking anonymous access, no admin UPDATE policy for
-- payment corrections, no DELETE policy for GDPR compliance, and risks from unfiltered
-- aggregate queries.
-- 
-- The fix: Drop existing policies, verify RLS is enabled, and recreate comprehensive policies
-- with proper role restrictions. Add admin-only UPDATE and DELETE policies for payment
-- corrections and GDPR compliance.
-- 
-- Security improvements: Prevent anonymous access, enable admin corrections, support GDPR
-- compliance, and ensure proper role-based access control.
-- 
-- Application responsibility: Aggregate queries MUST filter by user_id in application code
-- to prevent information leakage (reference UserDashboard.tsx line 108 and AdminStats.tsx line 59).

-- Section 1: Drop existing policies
-- These policies are being dropped to recreate them with proper restrictions
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;

-- Section 2: Verify RLS enabled
-- Ensure Row Level Security is enabled on the payments table (idempotent operation)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Section 3: Create user policies
-- These policies restrict access to authenticated users only, ensuring users can only access payments where they are the owner
CREATE POLICY "Authenticated users can view their own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create their own payments"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Section 4: Create admin policies
-- Allow admins to view all payments for analytics dashboard (used in AdminStats.tsx line 59)
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update payment status for manual corrections (e.g., refunds, status fixes)
CREATE POLICY "Admins can update payment status"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete payments for GDPR compliance and data cleanup
CREATE POLICY "Admins can delete payments"
  ON public.payments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Section 5: Security notes
-- Anonymous users are explicitly blocked (no policies grant access to anon or public roles)
-- Service role operations (Stripe webhooks in stripe-webhook/index.ts lines 78-84) bypass RLS and work correctly
-- Application code MUST filter aggregate queries by user_id to prevent information leakage
-- Reference specific files: UserDashboard.tsx (line 108 filters by user_id), AdminStats.tsx (line 59 uses admin role)
-- Edge functions use service role key which bypasses RLS: create-checkout/index.ts (lines 53-64), stripe-webhook/index.ts (lines 78-84)