import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Convert CSV file to SQL INSERT statements
 * 
 * Usage: node scripts/csv-to-sql.js <csv-file> <table-name> [output-file]
 * 
 * Example: node scripts/csv-to-sql.js products.csv products products-import.sql
 */

function escapeSQLString(value) {
  if (value === null || value === undefined || value === '') {
    return 'NULL';
  }
  
  // Handle boolean values
  if (value === 'true' || value === true) return 'true';
  if (value === 'false' || value === false) return 'false';
  
  // Handle numbers
  if (!isNaN(value) && value !== '') {
    return value;
  }
  
  // Handle arrays (PostgreSQL array format)
  if (value.startsWith('{') && value.endsWith('}')) {
    return `'${value}'`;
  }
  
  // Handle JSON
  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      JSON.parse(value);
      return `'${value.replace(/'/g, "''")}'::jsonb`;
    } catch (e) {
      // Not valid JSON, treat as string
    }
  }
  
  // Escape single quotes and wrap in quotes
  return `'${String(value).replace(/'/g, "''")}'`;
}

function csvToSQL(csvFilePath, tableName, outputPath = null) {
  try {
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
    
    // Get column names from first record
    const columns = Object.keys(records[0]);
    
    // Generate SQL
    let sql = `-- SQL INSERT statements generated from ${csvFilePath}\n`;
    sql += `-- Table: ${tableName}\n`;
    sql += `-- Records: ${records.length}\n\n`;
    
    // Generate INSERT statements (batch for better performance)
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      sql += `INSERT INTO public.${tableName} (${columns.join(', ')})\n`;
      sql += `VALUES\n`;
      
      const values = batch.map(record => {
        const rowValues = columns.map(col => escapeSQLString(record[col]));
        return `  (${rowValues.join(', ')})`;
      });
      
      sql += values.join(',\n');
      sql += `\nON CONFLICT DO NOTHING;\n\n`;
    }
    
    // Write to file or output
    if (outputPath) {
      writeFileSync(outputPath, sql, 'utf-8');
      console.log(`✅ Generated SQL file: ${outputPath}`);
      console.log(`   ${records.length} records ready to import`);
      console.log(`\n📝 Next steps:`);
      console.log(`   1. Review the SQL file: ${outputPath}`);
      console.log(`   2. Go to: https://supabase.com/dashboard/project/aliqjghojatlklyvcurs/sql/new`);
      console.log(`   3. Copy and paste the SQL`);
      console.log(`   4. Click "Run" to import`);
    } else {
      console.log(sql);
    }
    
    return sql;
  } catch (error) {
    console.error('❌ Error converting CSV to SQL:', error.message);
    if (error.code === 'ENOENT') {
      console.error(`   File not found: ${csvFilePath}`);
    }
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node scripts/csv-to-sql.js <csv-file> <table-name> [output-file]');
  console.error('\nExample:');
  console.error('  node scripts/csv-to-sql.js products.csv products products-import.sql');
  process.exit(1);
}

const [csvFile, tableName, outputFile] = args;
csvToSQL(csvFile, tableName, outputFile);

