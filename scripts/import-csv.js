import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
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
 * Import CSV file into Supabase table
 * 
 * Usage: node scripts/import-csv.js <csv-file> <table-name>
 * 
 * Example: node scripts/import-csv.js products.csv products
 */
async function importCSV(csvFilePath, tableName) {
  try {
    console.log(`📂 Reading CSV file: ${csvFilePath}`);
    
    // Read CSV file
    const csvContent = readFileSync(csvFilePath, 'utf-8');
    
    // Detect delimiter (check for semicolon or comma)
    const delimiter = csvContent.includes(';') ? ';' : ',';
    
    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: delimiter
    });
    
    if (records.length === 0) {
      console.error('❌ No records found in CSV file');
      process.exit(1);
    }
    
    console.log(`📊 Found ${records.length} records to import`);
    console.log(`📋 Columns: ${Object.keys(records[0]).join(', ')}`);
    console.log(`\n🔄 Importing into table: ${tableName}...\n`);
    
    // Transform data if needed (handle arrays, JSON, etc.)
    const transformedRecords = records.map(record => {
      const transformed = { ...record };
      
      // Handle array columns (format: "item1,item2,item3")
      Object.keys(transformed).forEach(key => {
        const value = transformed[key];
        
        // Check if it looks like an array (comma-separated values)
        if (typeof value === 'string' && value.includes(',') && !value.startsWith('{')) {
          // Check if it's meant to be an array (you may need to customize this)
          // For now, we'll leave it as string unless it's a known array column
          if (key === 'images' || key.endsWith('_array')) {
            transformed[key] = `{${value.split(',').map(v => v.trim()).join(',')}}`;
          }
        }
        
        // Handle boolean strings
        if (value === 'true' || value === 'TRUE') transformed[key] = true;
        if (value === 'false' || value === 'FALSE') transformed[key] = false;
        
        // Handle numbers
        if (value !== '' && !isNaN(value) && value !== null) {
          const num = Number(value);
          if (!isNaN(num) && isFinite(num)) {
            transformed[key] = num;
          }
        }
      });
      
      return transformed;
    });
    
    // Insert in batches for better performance
    const batchSize = 100;
    let totalImported = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < transformedRecords.length; i += batchSize) {
      const batch = transformedRecords.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(transformedRecords.length / batchSize);
      
      console.log(`   Batch ${batchNum}/${totalBatches} (${batch.length} records)...`);
      
      const { data, error } = await supabase
        .from(tableName)
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`   ❌ Error in batch ${batchNum}:`, error.message);
        totalErrors += batch.length;
        
        // Try inserting one by one to find problematic records
        if (batch.length > 1) {
          console.log(`   🔍 Trying individual inserts to identify issues...`);
          for (const record of batch) {
            const { error: singleError } = await supabase
              .from(tableName)
              .insert(record);
            
            if (singleError) {
              console.error(`      ❌ Failed:`, JSON.stringify(record, null, 2));
              console.error(`      Error:`, singleError.message);
            } else {
              totalImported++;
            }
          }
        }
      } else {
        totalImported += batch.length;
        console.log(`   ✅ Successfully imported ${batch.length} records`);
      }
    }
    
    console.log(`\n✅ Import complete!`);
    console.log(`   Imported: ${totalImported} records`);
    if (totalErrors > 0) {
      console.log(`   Errors: ${totalErrors} records`);
    }
    
  } catch (error) {
    console.error('❌ Error importing CSV:', error.message);
    if (error.code === 'ENOENT') {
      console.error(`   File not found: ${csvFilePath}`);
    }
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node scripts/import-csv.js <csv-file> <table-name>');
  console.error('\nExample:');
  console.error('  node scripts/import-csv.js products.csv products');
  console.error('\nNote: Requires SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const [csvFile, tableName] = args;
importCSV(csvFile, tableName);

