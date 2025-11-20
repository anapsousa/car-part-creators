import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://aliqjghojatlklyvcurs.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('\n📝 To get your service role key:');
  console.error('   1. Go to: https://supabase.com/dashboard/project/aliqjghojatlklyvcurs/settings/api');
  console.error('   2. Under "Project API keys", find the "service_role" key (secret)');
  console.error('   3. Copy it and run:');
  console.error('      SUPABASE_SERVICE_ROLE_KEY=your-service-role-key node scripts/apply-migrations-api.js');
  console.error('\n⚠️  WARNING: The service role key has admin privileges. Keep it secret!');
  process.exit(1);
}

async function applyMigrations() {
  console.log('🚀 Starting database migration...');
  console.log(`📡 Connecting to: ${SUPABASE_URL}\n`);

  // Read the combined migrations file
  const migrationsPath = join(__dirname, '../supabase/combined-migrations.sql');
  let sql;
  
  try {
    sql = await readFile(migrationsPath, 'utf-8');
    console.log('✅ Loaded combined migrations file\n');
  } catch (error) {
    console.error('❌ Error reading migrations file:', error.message);
    console.error('   Make sure to run: node scripts/combine-migrations.js first');
    process.exit(1);
  }

  // Split SQL into individual statements
  // Remove comments and split by semicolons, but be careful with functions and triggers
  const statements = sql
    .split(/;(?![^'"]*['"][^'"]*['"])/g) // Split by semicolon, but not inside quotes
    .map(s => s.trim())
    .filter(s => {
      // Filter out empty statements and comment-only lines
      const cleaned = s.replace(/--.*$/gm, '').trim();
      return cleaned.length > 0;
    });

  console.log(`📦 Found ${statements.length} SQL statements to execute\n`);

  // Execute each statement via Supabase REST API
  // Note: Supabase doesn't have a direct SQL execution endpoint via REST API
  // We'll need to use the Management API or execute via SQL Editor
  // For now, let's try using the PostgREST API with proper authentication
  
  console.log('⚠️  Direct SQL execution via REST API is not supported by Supabase.');
  console.log('   You have two options:\n');
  console.log('   Option 1: Manual execution (Recommended)');
  console.log('   1. Go to: https://supabase.com/dashboard/project/aliqjghojatlklyvcurs/sql/new');
  console.log('   2. Copy the contents of: supabase/combined-migrations.sql');
  console.log('   3. Paste and click "Run"\n');
  console.log('   Option 2: Use Supabase CLI');
  console.log('   1. Install Supabase CLI: https://supabase.com/docs/guides/cli');
  console.log('   2. Link your project: supabase link --project-ref aliqjghojatlklyvcurs');
  console.log('   3. Push migrations: supabase db push\n');
  
  // Try to use the Management API if available
  // This requires an access token, not the service role key
  console.log('💡 Alternatively, you can use the Supabase Management API with an access token.');
  console.log('   However, the easiest method is Option 1 above.\n');
}

applyMigrations().catch(console.error);

