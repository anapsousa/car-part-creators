-- Migration to fix overly permissive RLS policies on the profiles table
-- This migration addresses a critical security vulnerability where the profiles table
-- allowed anonymous/unauthenticated users (public role) to access sensitive personal
-- identifiable information (PII) including emails, phone numbers, addresses, VAT numbers,
-- and company names. This violates the principle of least privilege and creates a security risk.
-- 
-- The migration replaces the existing policies that granted public access with restrictive
-- policies that only allow authenticated users to access their own profile data. An additional
-- admin-only policy is added to support the admin dashboard functionality in AdminStats.tsx.
-- 
-- Security improvements:
-- - Anonymous users can no longer query or modify profile data
-- - Authenticated users can only access their own profile (auth.uid() = id)
-- - Admins can view all profiles for analytics (using has_role function)
-- - Prevents aggregate queries from leaking information across user boundaries
-- 
-- Expected outcome: Enhanced security without breaking legitimate functionality.

-- Section 1: Drop existing overly permissive policies
-- These policies allowed public role access, which is a security vulnerability
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Section 2: Verify RLS is enabled
-- Ensure Row Level Security is enabled on the profiles table (idempotent operation)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Section 3: Create authenticated user policies
-- These policies restrict access to logged-in users only, ensuring users can only access their own data
CREATE POLICY "Authenticated users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Section 4: Create admin policy
-- Allow admins to view all profiles for dashboard analytics (used in AdminStats.tsx)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));