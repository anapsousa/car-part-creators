-- =====================================================
-- Fix Admin Content Manager Access
-- This ensures admins can see ALL content_translations rows
-- =====================================================

-- Step 1: Check current RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'content_translations'
ORDER BY policyname;

-- Step 2: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Admins have full access to content_translations" ON public.content_translations;
DROP POLICY IF EXISTS "Authenticated users can view content" ON public.content_translations;
DROP POLICY IF EXISTS "Authenticated users can view all content" ON public.content_translations;
DROP POLICY IF EXISTS "Service role has full access" ON public.content_translations;
DROP POLICY IF EXISTS "Public can view content" ON public.content_translations;
DROP POLICY IF EXISTS "Admins can view all content" ON public.content_translations;
DROP POLICY IF EXISTS "Admins can insert content" ON public.content_translations;
DROP POLICY IF EXISTS "Admins can update content" ON public.content_translations;
DROP POLICY IF EXISTS "Admins can delete content" ON public.content_translations;

-- Step 3: Create comprehensive admin policy (allows admins to see and modify everything)
CREATE POLICY "Admins have full access to content_translations"
  ON public.content_translations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Step 4: Create policy for ALL authenticated users to READ everything
-- This ensures admins can see all content even if the admin check has issues
CREATE POLICY "All authenticated users can view all content"
  ON public.content_translations
  FOR SELECT
  TO authenticated
  USING (true);

-- Step 5: Also allow service role (for migrations and scripts)
CREATE POLICY "Service role has full access"
  ON public.content_translations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Step 5: Ensure RLS is enabled
ALTER TABLE public.content_translations ENABLE ROW LEVEL SECURITY;

-- Step 6: Verify what pages exist
SELECT 
  'Pages in database' as info,
  page,
  COUNT(*) as row_count
FROM content_translations
GROUP BY page
ORDER BY page;

-- Step 7: Check if specific pages are missing
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'about') THEN '✓' ELSE '✗' END || ' about page' as check_result
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'contact') THEN '✓' ELSE '✗' END || ' contact page'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'product') THEN '✓' ELSE '✗' END || ' product page'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'shop') THEN '✓' ELSE '✗' END || ' shop page'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'faq') THEN '✓' ELSE '✗' END || ' faq page'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'cart') THEN '✓' ELSE '✗' END || ' cart page'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'checkout') THEN '✓' ELSE '✗' END || ' checkout page'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'auth') THEN '✓' ELSE '✗' END || ' auth page'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'generator') THEN '✓' ELSE '✗' END || ' generator page'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'common') THEN '✓' ELSE '✗' END || ' common page';

