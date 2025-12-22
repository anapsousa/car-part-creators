-- =====================================================
-- Check Import Status - Run this to see what's actually imported
-- =====================================================

-- 1. Total count - should be 343 from JSON files (plus any existing rows)
SELECT 
  'Total rows in database' as metric,
  COUNT(*)::text as value
FROM content_translations;

-- 2. Count rows that should be from our JSON import (based on content_key patterns)
SELECT 
  'Rows from JSON import (estimated)' as metric,
  COUNT(*)::text as value
FROM content_translations
WHERE content_key LIKE 'nav.%'
   OR content_key LIKE 'home.%'
   OR content_key LIKE 'shop.%'
   OR content_key LIKE 'product.%'
   OR content_key LIKE 'cart.%'
   OR content_key LIKE 'wishlist.%'
   OR content_key LIKE 'generator.%'
   OR content_key LIKE 'about.%'
   OR content_key LIKE 'contact.%'
   OR content_key LIKE 'faq.%'
   OR content_key LIKE 'auth.%'
   OR content_key LIKE 'checkout.%'
   OR content_key LIKE 'common.%'
   OR content_key LIKE 'footer.%'
   OR content_key LIKE 'calculator.%';

-- 3. Check if all expected keys are present
-- Home page keys
SELECT 
  'Home page keys' as check_type,
  COUNT(*) as found_count,
  CASE 
    WHEN COUNT(*) >= 50 THEN '✓ Good'
    ELSE '✗ Missing keys'
  END as status
FROM content_translations
WHERE page = 'home';

-- Navigation keys
SELECT 
  'Navigation keys' as check_type,
  COUNT(*) as found_count,
  CASE 
    WHEN COUNT(*) >= 12 THEN '✓ Good'
    ELSE '✗ Missing keys'
  END as status
FROM content_translations
WHERE page = 'navigation';

-- Product keys
SELECT 
  'Product keys' as check_type,
  COUNT(*) as found_count,
  CASE 
    WHEN COUNT(*) >= 15 THEN '✓ Good'
    ELSE '✗ Missing keys'
  END as status
FROM content_translations
WHERE page = 'product';

-- 4. Show sample of what's actually in each page
SELECT 
  page,
  section,
  COUNT(*) as count,
  STRING_AGG(content_key, ', ' ORDER BY content_key LIMIT 5) as sample_keys
FROM content_translations
WHERE page IN ('home', 'about', 'contact', 'product', 'navigation', 'shop')
GROUP BY page, section
ORDER BY page, section
LIMIT 30;

-- 5. Check for specific keys that should exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM content_translations WHERE content_key = 'home.hero.title') THEN '✓'
    ELSE '✗'
  END || ' home.hero.title' as key_check
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM content_translations WHERE content_key = 'home.seo.keywords') THEN '✓'
    ELSE '✗'
  END || ' home.seo.keywords' as key_check
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM content_translations WHERE content_key = 'nav.menu') THEN '✓'
    ELSE '✗'
  END || ' nav.menu' as key_check
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM content_translations WHERE content_key = 'product.custom_work.cta') THEN '✓'
    ELSE '✗'
  END || ' product.custom_work.cta' as key_check
UNION ALL
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM content_translations WHERE content_key = 'about.hero.link_manifesto') THEN '✓'
    ELSE '✗'
  END || ' about.hero.link_manifesto' as key_check;

