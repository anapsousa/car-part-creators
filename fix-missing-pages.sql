-- =====================================================
-- Fix Missing Pages in Content Manager
-- This will check what pages exist and ensure all are visible
-- =====================================================

-- 1. Check what pages actually exist in the database
SELECT 
  page,
  COUNT(*) as row_count,
  MIN(created_at) as first_created,
  MAX(updated_at) as last_updated
FROM content_translations
GROUP BY page
ORDER BY page;

-- 2. Check if there are any NULL pages (shouldn't happen)
SELECT 
  'Rows with NULL page' as issue,
  COUNT(*) as count
FROM content_translations
WHERE page IS NULL;

-- 3. Check specific pages that should exist
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'about') THEN '✓' ELSE '✗' END || ' about' as page_check
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'contact') THEN '✓' ELSE '✗' END || ' contact'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'product') THEN '✓' ELSE '✗' END || ' product'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'shop') THEN '✓' ELSE '✗' END || ' shop'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'faq') THEN '✓' ELSE '✗' END || ' faq'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'cart') THEN '✓' ELSE '✗' END || ' cart'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'checkout') THEN '✓' ELSE '✗' END || ' checkout'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'auth') THEN '✓' ELSE '✗' END || ' auth'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'generator') THEN '✓' ELSE '✗' END || ' generator'
UNION ALL
SELECT CASE WHEN EXISTS (SELECT 1 FROM content_translations WHERE page = 'common') THEN '✓' ELSE '✗' END || ' common';

-- 4. Show sample content from missing pages
SELECT 
  '=== ABOUT PAGE ===' as section,
  content_key,
  page,
  section,
  LEFT(english_text, 50) as preview
FROM content_translations
WHERE page = 'about'
LIMIT 5

UNION ALL

SELECT 
  '=== CONTACT PAGE ===' as section,
  content_key,
  page,
  section,
  LEFT(english_text, 50) as preview
FROM content_translations
WHERE page = 'contact'
LIMIT 5

UNION ALL

SELECT 
  '=== PRODUCT PAGE ===' as section,
  content_key,
  page,
  section,
  LEFT(english_text, 50) as preview
FROM content_translations
WHERE page = 'product'
LIMIT 5

UNION ALL

SELECT 
  '=== SHOP PAGE ===' as section,
  content_key,
  page,
  section,
  LEFT(english_text, 50) as preview
FROM content_translations
WHERE page = 'shop'
LIMIT 5;

-- 5. Check RLS policies that might be filtering
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'content_translations';

