-- =====================================================
-- DIAGNOSTIC: Check if all translations were imported
-- Run this to see exactly what's in the database
-- =====================================================

-- 1. FIRST: Check total count - should be 343+ (343 from JSON + any existing)
SELECT 
  'Total rows' as check_name,
  COUNT(*)::text as result,
  CASE WHEN COUNT(*) >= 343 THEN '✓ All imported' ELSE '✗ Missing rows' END as status
FROM content_translations;

-- 2. Check each major page has content
SELECT 
  page,
  COUNT(*) as row_count,
  COUNT(CASE WHEN portuguese_text IS NOT NULL THEN 1 END) as with_portuguese,
  CASE 
    WHEN page = 'home' AND COUNT(*) >= 50 THEN '✓'
    WHEN page = 'about' AND COUNT(*) >= 50 THEN '✓'
    WHEN page = 'contact' AND COUNT(*) >= 30 THEN '✓'
    WHEN page = 'product' AND COUNT(*) >= 20 THEN '✓'
    WHEN page = 'navigation' AND COUNT(*) >= 12 THEN '✓'
    WHEN page = 'shop' AND COUNT(*) >= 10 THEN '✓'
    ELSE '?'
  END as status
FROM content_translations
WHERE page IN ('home', 'about', 'contact', 'product', 'navigation', 'shop', 'faq', 'footer', 'cart', 'checkout', 'auth', 'generator', 'calculator')
GROUP BY page
ORDER BY page;

-- 3. Check for specific critical keys that MUST exist
SELECT 
  'Critical Keys Check' as check_type,
  COUNT(*) as found_count,
  CASE WHEN COUNT(*) = 6 THEN '✓ All present' ELSE '✗ Missing: ' || (6 - COUNT(*))::text END as status
FROM (
  SELECT 1 FROM content_translations WHERE content_key = 'home.hero.title'
  UNION ALL SELECT 1 WHERE content_key = 'home.seo.keywords'
  UNION ALL SELECT 1 WHERE content_key = 'nav.menu'
  UNION ALL SELECT 1 WHERE content_key = 'about.hero.link_manifesto'
  UNION ALL SELECT 1 WHERE content_key = 'product.custom_work.cta'
  UNION ALL SELECT 1 WHERE content_key = 'contact.seo.title'
) as critical_keys;

-- 4. Show sample from EACH page to verify content is there
SELECT 
  '=== HOME PAGE SAMPLE ===' as section,
  '' as content_key,
  '' as page,
  '' as preview
UNION ALL
SELECT 
  'Sample' as section,
  content_key,
  page,
  LEFT(english_text, 40) || '...' as preview
FROM content_translations
WHERE page = 'home'
ORDER BY content_key
LIMIT 5

UNION ALL

SELECT 
  '=== ABOUT PAGE SAMPLE ===' as section,
  '' as content_key,
  '' as page,
  '' as preview
UNION ALL
SELECT 
  'Sample' as section,
  content_key,
  page,
  LEFT(english_text, 40) || '...' as preview
FROM content_translations
WHERE page = 'about'
ORDER BY content_key
LIMIT 5

UNION ALL

SELECT 
  '=== PRODUCT PAGE SAMPLE ===' as section,
  '' as content_key,
  '' as page,
  '' as preview
UNION ALL
SELECT 
  'Sample' as section,
  content_key,
  page,
  LEFT(english_text, 40) || '...' as preview
FROM content_translations
WHERE page = 'product'
ORDER BY content_key
LIMIT 5;

-- 5. Count by section for home page (should have many sections)
SELECT 
  'Home page sections' as info,
  section,
  COUNT(*) as keys_in_section
FROM content_translations
WHERE page = 'home'
GROUP BY section
ORDER BY section;

