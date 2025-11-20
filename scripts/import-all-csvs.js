import { readdir, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple .env file parser
function loadEnv() {
  try {
    const envPath = join(__dirname, '../.env');
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

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing environment variables');
  console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Get service role key from: https://supabase.com/dashboard/project/aliqjghojatlklyvcurs/settings/api');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Map CSV filenames to table names
function getTableName(filename) {
  if (filename.includes('content_translations')) return 'content_translations';
  if (filename.includes('products')) return 'products';
  if (filename.includes('user_roles')) return 'user_roles';
  if (filename.includes('profiles')) return 'profiles';
  if (filename.includes('designs')) return 'designs';
  return null;
}

async function importCSV(csvFilePath, tableName) {
  try {
    const csvContent = readFileSync(csvFilePath, 'utf-8');
    
    // Detect delimiter
    const delimiter = csvContent.includes(';') ? ';' : ',';
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: delimiter
    });
    
    if (records.length === 0) {
      console.log(`   ⚠️  No records found`);
      return { imported: 0, errors: 0 };
    }
    
    // Transform data
    const transformedRecords = records.map(record => {
      const transformed = { ...record };
      
      // Handle JSON arrays (like images column)
      Object.keys(transformed).forEach(key => {
        const value = transformed[key];
        
        if (typeof value === 'string') {
          // Handle JSON arrays
          if (value.startsWith('[') && value.endsWith(']')) {
            try {
              transformed[key] = JSON.parse(value);
            } catch (e) {
              // Keep as string if not valid JSON
            }
          }
          
          // Handle boolean strings
          if (value === 'true' || value === 'TRUE') transformed[key] = true;
          if (value === 'false' || value === 'FALSE') transformed[key] = false;
          
          // Handle empty strings as null for optional fields
          if (value === '' && key !== 'id') {
            // Keep empty strings for some fields, set null for others
            const nullableFields = ['description', 'portuguese_text', 'material', 'phone', 'address', 'city', 'postal_code', 'country', 'vat_number', 'company_name'];
            if (nullableFields.includes(key)) {
              transformed[key] = null;
            }
          }
          
          // Handle numbers
          if (value !== '' && !isNaN(value) && value !== null && value !== 'true' && value !== 'false') {
            const num = Number(value);
            if (!isNaN(num) && isFinite(num) && (key.includes('price') || key.includes('quantity') || key.includes('width') || key.includes('height') || key.includes('depth') || key.includes('year'))) {
              transformed[key] = num;
            }
          }
        }
      });
      
      return transformed;
    });
    
    // Insert in batches
    const batchSize = 100;
    let totalImported = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < transformedRecords.length; i += batchSize) {
      const batch = transformedRecords.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from(tableName)
        .upsert(batch, { onConflict: 'id' })
        .select();
      
      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
        totalErrors += batch.length;
      } else {
        totalImported += batch.length;
      }
    }
    
    return { imported: totalImported, errors: totalErrors };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { imported: 0, errors: 1 };
  }
}

async function main() {
  const csvsDir = join(__dirname, '../../csvs to import');
  
  console.log('🚀 Starting batch CSV import...\n');
  console.log(`📂 Reading CSV files from: ${csvsDir}\n`);
  
  try {
    const files = await readdir(csvsDir);
    const csvFiles = files.filter(f => f.endsWith('.csv')).sort();
    
    if (csvFiles.length === 0) {
      console.error('❌ No CSV files found in "csvs to import" directory');
      process.exit(1);
    }
    
    console.log(`📦 Found ${csvFiles.length} CSV files to import:\n`);
    
    const results = [];
    
    for (const file of csvFiles) {
      const tableName = getTableName(file);
      if (!tableName) {
        console.log(`⏭️  Skipping ${file} (unknown table)`);
        continue;
      }
      
      const filePath = join(csvsDir, file);
      console.log(`📄 Importing ${file} → ${tableName}...`);
      
      const result = await importCSV(filePath, tableName);
      results.push({ file, tableName, ...result });
      
      if (result.errors === 0) {
        console.log(`   ✅ Imported ${result.imported} records\n`);
      } else {
        console.log(`   ⚠️  Imported ${result.imported}, Errors: ${result.errors}\n`);
      }
    }
    
    console.log('\n📊 Import Summary:');
    console.log('═'.repeat(50));
    results.forEach(({ file, tableName, imported, errors }) => {
      const status = errors === 0 ? '✅' : '⚠️';
      console.log(`${status} ${file}`);
      console.log(`   Table: ${tableName}`);
      console.log(`   Imported: ${imported} records`);
      if (errors > 0) {
        console.log(`   Errors: ${errors}`);
      }
      console.log('');
    });
    
    const totalImported = results.reduce((sum, r) => sum + r.imported, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
    
    console.log(`\n✅ Total: ${totalImported} records imported`);
    if (totalErrors > 0) {
      console.log(`⚠️  Total errors: ${totalErrors}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

