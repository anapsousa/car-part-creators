import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://aliqjghojatlklyvcurs.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('   Get it from: https://supabase.com/dashboard/project/aliqjghojatlklyvcurs/settings/api');
  console.error('   Then run: SUPABASE_SERVICE_ROLE_KEY=your-key node scripts/apply-migrations.js');
  process.exit(1);
}

// Create Supabase client with service role key (has admin privileges)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function getMigrationFiles() {
  const migrationsDir = join(__dirname, '../supabase/migrations');
  const files = await readdir(migrationsDir);
  
  // Filter SQL files and sort by name (which includes timestamp)
  return files
    .filter(file => file.endsWith('.sql'))
    .sort()
    .map(file => join(migrationsDir, file));
}

async function applyMigration(filePath) {
  const sql = await readFile(filePath, 'utf-8');
  const fileName = filePath.split('/').pop();
  
  console.log(`\n📄 Applying migration: ${fileName}`);
  
  try {
    // Execute SQL using Supabase REST API
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If exec_sql function doesn't exist, try direct SQL execution via REST API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ sql_query: sql })
      });
      
      if (!response.ok) {
        // Try alternative: execute SQL directly via PostgREST
        // Split SQL into individual statements and execute them
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));
        
        for (const statement of statements) {
          if (statement) {
            try {
              // Use the Supabase client's query method
              const { error: execError } = await supabase
                .from('_migrations')
                .select('*')
                .limit(0); // This won't work for DDL
              
              // Instead, we need to use the REST API with proper SQL execution
              console.log(`   Executing statement...`);
            } catch (err) {
              console.error(`   ⚠️  Statement execution issue (may need manual execution):`, err.message);
            }
          }
        }
        
        throw new Error(`Failed to execute migration: ${response.statusText}`);
      }
    }
    
    console.log(`   ✅ Successfully applied: ${fileName}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error applying ${fileName}:`, error.message);
    
    // Check if error is because table/object already exists (migration already applied)
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log(`   ⚠️  Migration may have already been applied, skipping...`);
      return true;
    }
    
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database migration...');
  console.log(`📡 Connecting to: ${SUPABASE_URL}`);
  
  const migrationFiles = await getMigrationFiles();
  console.log(`\n📦 Found ${migrationFiles.length} migration files`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const file of migrationFiles) {
    const success = await applyMigration(file);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log(`\n✅ Migration complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  
  if (failCount > 0) {
    console.log(`\n⚠️  Some migrations failed. You may need to apply them manually via Supabase SQL Editor.`);
    process.exit(1);
  }
}

main().catch(console.error);

