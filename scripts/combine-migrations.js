import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function combineMigrations() {
  const migrationsDir = join(__dirname, '../supabase/migrations');
  const files = await readdir(migrationsDir);
  
  // Filter SQL files and sort by name (which includes timestamp)
  const sqlFiles = files
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  console.log(`Found ${sqlFiles.length} migration files`);
  
  let combinedSQL = `-- Combined Migration File
-- Generated automatically from all migration files
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/aliqjghojatlklyvcurs/sql/new

`;

  for (const file of sqlFiles) {
    const filePath = join(migrationsDir, file);
    const content = await readFile(filePath, 'utf-8');
    
    combinedSQL += `\n-- ============================================\n`;
    combinedSQL += `-- Migration: ${file}\n`;
    combinedSQL += `-- ============================================\n\n`;
    combinedSQL += content;
    combinedSQL += `\n\n`;
    
    console.log(`Added: ${file}`);
  }
  
  const outputPath = join(__dirname, '../supabase/combined-migrations.sql');
  await writeFile(outputPath, combinedSQL, 'utf-8');
  
  console.log(`\n✅ Combined migration file created: ${outputPath}`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Go to: https://supabase.com/dashboard/project/aliqjghojatlklyvcurs/sql/new`);
  console.log(`   2. Copy and paste the contents of: supabase/combined-migrations.sql`);
  console.log(`   3. Click "Run" to execute all migrations`);
}

combineMigrations().catch(console.error);

