import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * Flatten nested object to dot notation
 */
function flattenObject(obj, prefix = '') {
  const result = {};

  if (obj === null || Array.isArray(obj)) {
    return result;
  }

  if (typeof obj === 'object') {
    for (const key in obj) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      Object.assign(result, flattenObject(obj[key], newPrefix));
    }
  } else {
    result[prefix] = String(obj);
  }

  return result;
}

/**
 * Extract page and section from content_key
 */
function extractPageAndSection(contentKey) {
  const parts = contentKey.split('.');
  
  if (parts.length < 2) {
    return { page: 'common', section: 'general' };
  }

  const page = parts[0];
  
  // Special handling for nav
  if (page === 'nav') {
    return { page: 'navigation', section: 'nav' };
  }
  
  // For SEO keys, always use 'seo' as section
  if (contentKey.includes('.seo.')) {
    return { page, section: 'seo' };
  }
  
  // For other keys, use the second part as section
  const section = parts[1];
  
  return { page, section };
}

/**
 * Determine content type based on key
 */
function getContentType(contentKey) {
  if (contentKey.includes('.title') || contentKey.includes('.heading')) {
    return 'heading';
  }
  if (contentKey.includes('.cta') || contentKey.includes('.button') || contentKey.includes('.submit')) {
    return 'button';
  }
  if (contentKey.includes('.placeholder')) {
    return 'placeholder';
  }
  if (contentKey.includes('.label')) {
    return 'label';
  }
  if (contentKey.includes('.seo.')) {
    return 'seo';
  }
  if (contentKey.includes('.keywords')) {
    return 'seo';
  }
  return 'text';
}

/**
 * Escape SQL string
 */
function escapeSQL(str) {
  if (!str) return 'NULL';
  return "'" + str.replace(/'/g, "''").replace(/\n/g, '\\n') + "'";
}

/**
 * Generate SQL import script using individual INSERT statements
 */
function generateSQL() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const enPath = join(__dirname, '../src/i18n/locales/en.json');
  const ptPath = join(__dirname, '../src/i18n/locales/pt.json');
  
  console.log('📂 Reading translation files...\n');
  
  const enContent = JSON.parse(readFileSync(enPath, 'utf-8'));
  const ptContent = JSON.parse(readFileSync(ptPath, 'utf-8'));
  
  // Flatten both JSON files
  const enFlat = flattenObject(enContent);
  const ptFlat = flattenObject(ptContent);
  
  console.log(`📊 Found ${Object.keys(enFlat).length} English keys`);
  console.log(`📊 Found ${Object.keys(ptFlat).length} Portuguese keys\n`);
  
  // Get all unique keys
  const allKeys = new Set([...Object.keys(enFlat), ...Object.keys(ptFlat)]);
  
  // Generate SQL INSERT statements
  const inserts = [];
  
  for (const contentKey of allKeys) {
    const englishText = enFlat[contentKey] || '';
    const portugueseText = ptFlat[contentKey] || null;
    
    if (!englishText && !portugueseText) {
      continue;
    }
    
    const { page, section } = extractPageAndSection(contentKey);
    const contentType = getContentType(contentKey);
    
    // Create description
    let description = `Content key: ${contentKey}`;
    if (contentKey.includes('.seo.')) {
      description = `SEO metadata: ${contentKey}`;
    } else if (contentKey.includes('.keywords')) {
      description = `SEO keywords: ${contentKey}`;
    }
    
    inserts.push({
      content_key: contentKey,
      content_type: contentType,
      page: page,
      section: section,
      english_text: englishText || '',
      portuguese_text: portugueseText,
      description: description
    });
  }
  
  // Generate SQL with individual INSERT statements in a loop
  let sql = `-- =====================================================
-- Complete Content Translations Import
-- This script imports ALL translations from en.json and pt.json
-- Uses individual INSERT statements in a loop for reliability
-- =====================================================

CREATE OR REPLACE FUNCTION public.import_all_translations()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_data RECORD;
  v_count INTEGER := 0;
  v_error TEXT;
BEGIN
  -- Delete all existing translations first (optional - comment out if you want to keep existing)
  -- DELETE FROM public.content_translations;
  
  -- Process each translation
`;

  // Add data as a temporary table insert
  sql += `  -- Insert all translations using a VALUES clause\n`;
  sql += `  INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, portuguese_text, description) VALUES\n`;
  
  inserts.forEach((item, index) => {
    const comma = index < inserts.length - 1 ? ',' : '';
    sql += `    (${escapeSQL(item.content_key)}, ${escapeSQL(item.content_type)}, ${escapeSQL(item.page)}, ${escapeSQL(item.section)}, ${escapeSQL(item.english_text)}, ${item.portuguese_text ? escapeSQL(item.portuguese_text) : 'NULL'}, ${escapeSQL(item.description)})${comma}\n`;
  });

  sql += `  ON CONFLICT (content_key) DO UPDATE SET
    content_type = EXCLUDED.content_type,
    page = EXCLUDED.page,
    section = EXCLUDED.section,
    english_text = EXCLUDED.english_text,
    portuguese_text = EXCLUDED.portuguese_text,
    description = EXCLUDED.description,
    updated_at = NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Import completed: % rows processed', v_count;
  
EXCEPTION
  WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
    RAISE EXCEPTION 'Error during import at row %: %', v_count + 1, v_error;
END;
$$;

-- Execute the function
SELECT public.import_all_translations();

-- Clean up
DROP FUNCTION IF EXISTS public.import_all_translations();

-- Verification queries
SELECT 
  page,
  COUNT(*) as total_items,
  COUNT(CASE WHEN portuguese_text IS NOT NULL THEN 1 END) as with_portuguese,
  COUNT(CASE WHEN portuguese_text IS NULL THEN 1 END) as missing_portuguese
FROM content_translations
GROUP BY page
ORDER BY page;

-- Show a sample of imported content
SELECT content_key, page, section, 
  CASE WHEN LENGTH(english_text) > 50 THEN LEFT(english_text, 50) || '...' ELSE english_text END as english_preview,
  portuguese_text IS NOT NULL as has_portuguese
FROM content_translations
ORDER BY page, section, content_key
LIMIT 50;
`;

  return sql;
}

// Generate and write SQL file
const sql = generateSQL();
const outputPath = join(dirname(fileURLToPath(import.meta.url)), '../complete-translations-import-simple.sql');
writeFileSync(outputPath, sql, 'utf-8');

console.log(`✅ Generated SQL file: complete-translations-import-simple.sql`);
console.log(`   Total translations: ${Object.keys(flattenObject(JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/i18n/locales/en.json'), 'utf-8')))).length}`);
console.log(`\n📋 This version uses a single INSERT with all values - try this if the batched version fails.\n`);

