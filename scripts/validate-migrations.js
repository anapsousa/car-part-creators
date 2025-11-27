import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migrationsDir = join(__dirname, '../supabase/migrations');

// ANSI color codes for console output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  reset: '\x1b[0m'
};

function validateFileName(filename) {
  const errors = [];
  const warnings = [];

  // Check filename pattern: YYYYMMDD_*.sql or YYYYMMDDHHMMSS_*.sql
  const pattern = /^\d{8}(_\d{6})?_.+\.sql$/;
  if (!pattern.test(filename)) {
    errors.push(`Filename does not match required pattern (YYYYMMDD_description.sql or YYYYMMDDHHMMSS_description.sql)`);
  }

  // Warn about spaces or special characters
  if (filename.includes(' ') || /[^a-zA-Z0-9_.-]/.test(filename)) {
    warnings.push(`Filename contains spaces or special characters (use underscores instead)`);
  }

  return { errors, warnings };
}

function validateSqlSyntax(content, filename) {
  const errors = [];
  const warnings = [];

  const lines = content.split('\n');
  let inFunction = false;
  let parenCount = 0;
  let bracketCount = 0;
  let quoteCount = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    // Skip comments
    if (line.startsWith('--')) continue;

    // Track function definitions
    if (line.toUpperCase().includes('CREATE FUNCTION') || line.toUpperCase().includes('CREATE OR REPLACE FUNCTION')) {
      inFunction = true;
    }
    if (line.toUpperCase().includes('END;') && inFunction) {
      inFunction = false;
    }

    // Track quotes
    for (const char of line) {
      if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
      if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
    }

    // Track parentheses and brackets (only if not in quotes)
    if (!inSingleQuote && !inDoubleQuote) {
      for (const char of line) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        if (char === '[') bracketCount++;
        if (char === ']') bracketCount--;
      }
    }

    // Check for trailing commas in INSERT
    if (line.toUpperCase().includes('INSERT INTO') && line.includes(',')) {
      const nextLines = lines.slice(i + 1, i + 3).join(' ').trim();
      if (!nextLines.includes(')') && !nextLines.includes('VALUES')) {
        warnings.push(`Line ${lineNum}: Potential trailing comma in INSERT statement`);
      }
    }

    // Check for missing semicolons (basic check, excluding function bodies)
    if (!inFunction && !line.startsWith('--') && line.length > 0 && !line.endsWith(';') && !line.toUpperCase().includes('BEGIN') && !line.toUpperCase().includes('END')) {
      const nextLine = lines[i + 1]?.trim() || '';
      if (!nextLine.startsWith('--') && nextLine.length > 0) {
        errors.push(`Line ${lineNum}: Missing semicolon at end of statement`);
      }
    }

    // Check for empty statements
    if (line === ';') {
      warnings.push(`Line ${lineNum}: Empty statement (multiple semicolons)`);
    }
  }

  // Check for unmatched parentheses/brackets/quotes
  if (parenCount !== 0) errors.push('Unmatched parentheses in SQL');
  if (bracketCount !== 0) errors.push('Unmatched brackets in SQL');
  if (inSingleQuote) errors.push('Unclosed single quote');
  if (inDoubleQuote) errors.push('Unclosed double quote');

  // Basic SQL injection check (look for string concatenation)
  if (content.includes('||') || content.includes('+')) {
    warnings.push('Potential SQL injection risk detected (string concatenation)');
  }

  return { errors, warnings };
}

function validateRlsPatterns(content, filename) {
  const warnings = [];

  const upperContent = content.toUpperCase();

  // Detect INSERT/UPDATE/DELETE statements
  const dataOps = [];
  const insertMatches = content.match(/INSERT\s+INTO\s+\w+/gi);
  const updateMatches = content.match(/UPDATE\s+\w+/gi);
  const deleteMatches = content.match(/DELETE\s+FROM\s+\w+/gi);

  if (insertMatches) dataOps.push(...insertMatches);
  if (updateMatches) dataOps.push(...updateMatches);
  if (deleteMatches) dataOps.push(...deleteMatches);

  if (dataOps.length > 0) {
    // Check if wrapped in SECURITY DEFINER function
    const hasSecurityDefiner = upperContent.includes('SECURITY DEFINER');
    const hasRlsDisable = upperContent.includes('ALTER TABLE') && upperContent.includes('DISABLE ROW LEVEL SECURITY');
    const hasRlsEnable = upperContent.includes('ALTER TABLE') && upperContent.includes('ENABLE ROW LEVEL SECURITY');

    if (!hasSecurityDefiner && !hasRlsDisable) {
      warnings.push(`Direct data manipulation detected (${dataOps.length} operations). Consider using SECURITY DEFINER functions or temporary RLS disable for RLS-protected tables`);
    } else if (hasRlsDisable && !hasRlsEnable) {
      warnings.push('RLS disabled but not re-enabled. Ensure RLS is re-enabled after operations');
    }
  }

  return { errors: [], warnings };
}

function validateIdempotency(content, filename) {
  const warnings = [];

  const upperContent = content.toUpperCase();

  // Check for INSERT without ON CONFLICT
  const insertStatements = content.match(/INSERT\s+INTO\s+\w+/gi);
  if (insertStatements) {
    const hasOnConflict = upperContent.includes('ON CONFLICT');
    if (!hasOnConflict) {
      warnings.push('INSERT statements lack ON CONFLICT clauses. Consider adding for idempotency');
    }
  }

  // Check for CREATE without IF NOT EXISTS or OR REPLACE
  const createStatements = content.match(/CREATE\s+(TABLE|INDEX|VIEW|FUNCTION)\s+\w+/gi);
  if (createStatements) {
    const hasIfNotExists = upperContent.includes('IF NOT EXISTS');
    const hasOrReplace = upperContent.includes('OR REPLACE');
    if (!hasIfNotExists && !hasOrReplace) {
      warnings.push('CREATE statements lack IF NOT EXISTS or OR REPLACE. Consider adding for idempotency');
    }
  }

  return { errors: [], warnings };
}

function validateSecurityDefiner(content, filename) {
  const warnings = [];

  const upperContent = content.toUpperCase();

  if (upperContent.includes('SECURITY DEFINER')) {
    // Check for SET search_path
    if (!upperContent.includes('SET SEARCH_PATH')) {
      warnings.push('SECURITY DEFINER function lacks SET search_path = public (security best practice)');
    }

    // Check for function cleanup
    if (!upperContent.includes('DROP FUNCTION')) {
      warnings.push('SECURITY DEFINER function is not dropped after use. Add DROP FUNCTION IF EXISTS at the end');
    }

    // Check function name (basic check)
    const funcMatch = content.match(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(\w+)/i);
    if (funcMatch) {
      const funcName = funcMatch[1];
      if (funcName.length < 5 || !/[a-zA-Z]/.test(funcName)) {
        warnings.push('SECURITY DEFINER function name is not descriptive or unique');
      }
    }
  }

  return { errors: [], warnings };
}

async function validateMigrationFile(filePath) {
  const filename = filePath.split('/').pop();
  const issues = { errors: [], warnings: [] };

  try {
    const content = await readFile(filePath, 'utf-8');

    // Run all validations
    const fileNameResult = validateFileName(filename);
    const syntaxResult = validateSqlSyntax(content, filename);
    const rlsResult = validateRlsPatterns(content, filename);
    const idempotencyResult = validateIdempotency(content, filename);
    const securityResult = validateSecurityDefiner(content, filename);

    // Collect all issues
    issues.errors.push(...fileNameResult.errors, ...syntaxResult.errors, ...rlsResult.errors, ...idempotencyResult.errors, ...securityResult.errors);
    issues.warnings.push(...fileNameResult.warnings, ...syntaxResult.warnings, ...rlsResult.warnings, ...idempotencyResult.warnings, ...securityResult.warnings);

  } catch (error) {
    issues.errors.push(`Failed to read file: ${error.message}`);
  }

  return { filename, issues };
}

function displayResults(results) {
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const result of results) {
    const { filename, issues } = result;
    const { errors, warnings } = issues;

    console.log(`\n📄 ${filename}:`);

    if (errors.length === 0 && warnings.length === 0) {
      console.log(`${colors.green}✅ No issues found${colors.reset}`);
    } else {
      errors.forEach(error => {
        console.log(`${colors.red}❌ ${error}${colors.reset}`);
        totalErrors++;
      });
      warnings.forEach(warning => {
        console.log(`${colors.yellow}⚠️  ${warning}${colors.reset}`);
        totalWarnings++;
      });
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Files checked: ${results.length}`);
  console.log(`   Total errors: ${totalErrors}`);
  console.log(`   Total warnings: ${totalWarnings}`);

  return totalErrors;
}

async function main() {
  console.log('🔍 Validating migration files...');

  try {
    const files = await readdir(migrationsDir);
    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort()
      .map(file => join(migrationsDir, file));

    if (sqlFiles.length === 0) {
      console.log('⚠️  No SQL migration files found');
      return;
    }

    console.log(`📦 Found ${sqlFiles.length} migration files`);

    const results = [];
    for (const file of sqlFiles) {
      const result = await validateMigrationFile(file);
      results.push(result);
    }

    const totalErrors = displayResults(results);

    if (totalErrors > 0) {
      console.log(`\n${colors.red}❌ Validation failed with ${totalErrors} errors${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`\n${colors.green}✅ Validation passed${colors.reset}`);
      process.exit(0);
    }

  } catch (error) {
    console.error(`❌ Error during validation: ${error.message}`);
    process.exit(1);
  }
}

main();