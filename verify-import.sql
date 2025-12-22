-- =====================================================
-- Verification Query for Translation Import
-- Run this to verify all translations are imported correctly
-- =====================================================

-- 1. Total count and breakdown
SELECT 
  COUNT(*) as total_translations,
  COUNT(CASE WHEN portuguese_text IS NOT NULL THEN 1 END) as with_portuguese,
  COUNT(CASE WHEN portuguese_text IS NULL THEN 1 END) as missing_portuguese
FROM content_translations;

-- 2. Count by page (what you already saw)
SELECT 
  page,
  COUNT(*) as total_items,
  COUNT(CASE WHEN portuguese_text IS NOT NULL THEN 1 END) as with_portuguese,
  COUNT(CASE WHEN portuguese_text IS NULL THEN 1 END) as missing_portuguese
FROM content_translations
GROUP BY page
ORDER BY page;

-- 3. Check for SEO and keywords specifically
SELECT 
  content_key, 
  page, 
  section,
  CASE WHEN LENGTH(english_text) > 80 THEN LEFT(english_text, 80) || '...' ELSE english_text END as english_preview,
  portuguese_text IS NOT NULL as has_portuguese
FROM content_translations
WHERE content_key LIKE '%.seo.%' 
   OR content_key LIKE '%.keywords%'
   OR content_key IN ('home.hero.link_about', 'home.hero.link_custom_work', 'about.hero.link_manifesto', 'product.custom_work.question', 'product.custom_work.cta', 'nav.menu')
ORDER BY content_key;

-- 4. Check home page content (should have many items)
SELECT 
  content_key,
  section,
  content_type,
  CASE WHEN LENGTH(english_text) > 60 THEN LEFT(english_text, 60) || '...' ELSE english_text END as english_preview,
  portuguese_text IS NOT NULL as has_portuguese
FROM content_translations
WHERE page = 'home'
ORDER BY section, content_key
LIMIT 30;

-- 5. Find any missing Portuguese translations (should be minimal now)
SELECT 
  content_key,
  page,
  section,
  english_text,
  'Missing Portuguese' as issue
FROM content_translations
WHERE portuguese_text IS NULL
  AND page NOT IN ('terms', 'admin', 'dashboard') -- These might not need translations
ORDER BY page, content_key;

