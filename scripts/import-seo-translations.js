import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Simple .env file parser
function loadEnv() {
  try {
    const envPath = join(dirname(fileURLToPath(import.meta.url)), '../.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          let value = valueParts.join('=');
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          env[key.trim()] = value.trim();
        }
      }
    });
    
    return env;
  } catch (error) {
    return {};
  }
}

// Load environment variables
const env = loadEnv();

const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing environment variables');
  console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Make sure your .env file has both variables set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
    // Primitive value: add it to the result
    result[prefix] = String(obj);
  }

  return result;
}

/**
 * Extract page and section from content_key
 * Examples:
 *   "home.seo.title" -> page: "home", section: "seo"
 *   "nav.menu" -> page: "navigation", section: "nav"
 *   "product.custom_work.question" -> page: "product", section: "custom_work"
 */
function extractPageAndSection(contentKey) {
  const parts = contentKey.split('.');
  
  if (parts.length < 2) {
    return { page: 'common', section: 'general' };
  }

  const page = parts[0];
  const section = parts.slice(1, -1).join('_') || parts[1];
  
  // Special handling for navigation
  if (page === 'nav') {
    return { page: 'navigation', section: 'nav' };
  }
  
  return { page, section };
}

/**
 * Determine content type based on key
 */
function getContentType(contentKey) {
  if (contentKey.includes('.title') || contentKey.includes('.heading')) {
    return 'heading';
  }
  if (contentKey.includes('.cta') || contentKey.includes('.button')) {
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
  return 'text';
}

/**
 * Import translations from JSON files
 */
async function importTranslations() {
  try {
    console.log('📂 Reading translation files...\n');
    
    // Read JSON files
    const enPath = join(dirname(fileURLToPath(import.meta.url)), '../src/i18n/locales/en.json');
    const ptPath = join(dirname(fileURLToPath(import.meta.url)), '../src/i18n/locales/pt.json');
    
    const enContent = JSON.parse(readFileSync(enPath, 'utf-8'));
    const ptContent = JSON.parse(readFileSync(ptPath, 'utf-8'));
    
    // Flatten both JSON files
    const enFlat = flattenObject(enContent);
    const ptFlat = flattenObject(ptContent);
    
    console.log(`📊 Found ${Object.keys(enFlat).length} English keys`);
    console.log(`📊 Found ${Object.keys(ptFlat).length} Portuguese keys\n`);
    
    // Prepare records for insertion
    const records = [];
    const keysToImport = new Set([
      // SEO keys
      'home.seo.title',
      'home.seo.description',
      'home.seo.keywords',
      'home.seo.og_title',
      'home.seo.og_description',
      'about.seo.title',
      'about.seo.description',
      'about.seo.og_title',
      'about.seo.og_description',
      'contact.seo.title',
      'contact.seo.description',
      'contact.seo.og_title',
      'contact.seo.og_description',
      'product.seo.car_parts.title',
      'product.seo.car_parts.description',
      'product.seo.home_decor.title',
      'product.seo.home_decor.description',
      'product.seo.personalised.title',
      'product.seo.personalised.description',
      // Link text
      'home.hero.link_about',
      'home.hero.link_custom_work',
      'about.hero.link_manifesto',
      // Product custom work
      'product.custom_work.question',
      'product.custom_work.cta',
      // Navigation
      'nav.menu'
    ]);
    
    // Process each key
    for (const contentKey of keysToImport) {
      const englishText = enFlat[contentKey];
      const portugueseText = ptFlat[contentKey] || null;
      
      if (!englishText) {
        console.warn(`⚠️  Missing English text for: ${contentKey}`);
        continue;
      }
      
      const { page, section } = extractPageAndSection(contentKey);
      const contentType = getContentType(contentKey);
      
      records.push({
        content_key: contentKey,
        content_type: contentType,
        page: page,
        section: section,
        english_text: englishText,
        portuguese_text: portugueseText,
        description: `Auto-imported SEO and translation key: ${contentKey}`
      });
    }
    
    console.log(`🔄 Preparing to import ${records.length} records...\n`);
    
    // Check existing records
    const { data: existing } = await supabase
      .from('content_translations')
      .select('content_key');
    
    const existingKeys = new Set(existing?.map(r => r.content_key) || []);
    const newRecords = records.filter(r => !existingKeys.has(r.content_key));
    const updateRecords = records.filter(r => existingKeys.has(r.content_key));
    
    console.log(`   New records: ${newRecords.length}`);
    console.log(`   Existing records: ${updateRecords.length}\n`);
    
    // Insert new records
    if (newRecords.length > 0) {
      console.log('📥 Inserting new records...');
      const batchSize = 50;
      
      for (let i = 0; i < newRecords.length; i += batchSize) {
        const batch = newRecords.slice(i, i + batchSize);
        const { error } = await supabase
          .from('content_translations')
          .insert(batch);
        
        if (error) {
          console.error(`   ❌ Error inserting batch:`, error.message);
          // Try one by one
          for (const record of batch) {
            const { error: singleError } = await supabase
              .from('content_translations')
              .insert(record);
            
            if (singleError) {
              console.error(`      ❌ Failed: ${record.content_key} - ${singleError.message}`);
            } else {
              console.log(`      ✅ Inserted: ${record.content_key}`);
            }
          }
        } else {
          console.log(`   ✅ Inserted batch of ${batch.length} records`);
        }
      }
    }
    
    // Update existing records
    if (updateRecords.length > 0) {
      console.log('\n🔄 Updating existing records...');
      
      for (const record of updateRecords) {
        const { error } = await supabase
          .from('content_translations')
          .update({
            english_text: record.english_text,
            portuguese_text: record.portuguese_text,
            content_type: record.content_type,
            description: record.description
          })
          .eq('content_key', record.content_key);
        
        if (error) {
          console.error(`   ❌ Error updating ${record.content_key}:`, error.message);
        } else {
          console.log(`   ✅ Updated: ${record.content_key}`);
        }
      }
    }
    
    console.log('\n✅ Import complete!');
    console.log(`   Total processed: ${records.length} records`);
    console.log(`   New: ${newRecords.length}`);
    console.log(`   Updated: ${updateRecords.length}\n`);
    
  } catch (error) {
    console.error('❌ Error importing translations:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the import
importTranslations();

