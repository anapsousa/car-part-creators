# Database Migrations

This directory contains SQL migration files for the Supabase database. Migrations are used to evolve the database schema and data over time in a controlled, versioned manner.

## Overview

Migrations are SQL scripts that modify the database structure (schema) or insert/update data. They are automatically applied during deployment via Lovable, ensuring that the production database stays in sync with the codebase.

For local development and testing, refer to the main project README's "Database Migrations" section for commands like `supabase db reset` to apply migrations locally.

Migration files follow a timestamp-based naming convention: `YYYYMMDD_description.sql` (e.g., `20251126_add_cms_content_for_all_components.sql`). This ensures migrations are applied in chronological order.

## RLS (Row Level Security) Implications

Supabase migrations run in a privileged context without an authenticated user session. This means Row Level Security (RLS) policies, which restrict data access based on the current user, are enforced during migration execution.

Direct `INSERT`, `UPDATE`, or `DELETE` statements on RLS-protected tables will fail unless the migration has appropriate privileges or bypasses RLS. Two approved patterns handle this:

1. **SECURITY DEFINER Functions (Recommended)**: Create temporary functions with `SECURITY DEFINER` to execute operations with elevated privileges. This is the preferred method as it maintains security while allowing necessary data operations. Use this for most data insertions in migrations.

2. **Temporary RLS Disable (Use Sparingly)**: Temporarily disable RLS on the table, perform operations, then re-enable RLS. This should only be used when SECURITY DEFINER functions are not suitable, as it temporarily removes security protections. Always re-enable RLS immediately after operations.

**Security Warnings**: SECURITY DEFINER functions run with the privileges of the function definer (typically the database owner), so ensure they are used only for trusted operations and cleaned up after use. Avoid hardcoding sensitive data in migrations.

## Migration Patterns & Examples

### Pattern 1: Schema Changes

Schema changes (DDL) like creating tables, altering columns, or adding indexes do not require RLS workarounds since they operate on the schema level, not data.

Example:
```sql
CREATE TABLE IF NOT EXISTS public.new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_new_table_name ON public.new_table(name);
```

### Pattern 2: Data Insertion with SECURITY DEFINER

For inserting data into RLS-protected tables, wrap operations in a SECURITY DEFINER function. Based on `20251126_add_cms_content_for_all_components.sql`:

```sql
CREATE OR REPLACE FUNCTION public.insert_cms_content_batch()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, description) VALUES
  ('example.key', 'text', 'example', 'section', 'Example Text', 'Description')
  ON CONFLICT (content_key) DO UPDATE SET
    content_type = EXCLUDED.content_type,
    english_text = EXCLUDED.english_text;
END;
$$;

SELECT public.insert_cms_content_batch();

DROP FUNCTION IF EXISTS public.insert_cms_content_batch();
```

This pattern includes:
- Function creation with `SECURITY DEFINER`, `LANGUAGE plpgsql`, and `SET search_path = public` for security.
- `INSERT` with `ON CONFLICT` for idempotency.
- Function invocation via `SELECT`.
- Cleanup with `DROP FUNCTION IF EXISTS`.

See also `20251120_setup_admin_user.sql` for another SECURITY DEFINER example.

### Pattern 3: Idempotent Operations

Ensure migrations can be run multiple times safely (idempotent). Use `ON CONFLICT DO NOTHING/UPDATE`, `IF NOT EXISTS`, or `CREATE OR REPLACE`.

Examples:
- `INSERT ... ON CONFLICT (unique_column) DO NOTHING;`
- `CREATE TABLE IF NOT EXISTS ...;`
- `CREATE OR REPLACE FUNCTION ...;`

Reference `20251119_add_missing_content_keys.sql` for direct INSERT (works only if RLS allows unauthenticated inserts).

## Testing Checklist

### Local Testing (Required)

1. Ensure Supabase CLI and Docker are installed.
2. Run `supabase start` to start the local instance.
3. Run `supabase db reset` to apply all migrations from scratch.
4. Verify no errors in terminal output.
5. Check data insertion using `supabase db diff` or SQL queries (e.g., `SELECT * FROM public.content_translations;`).
6. Test the application locally (`npm run dev`) to ensure functionality works.

### Syntax Validation

1. Run `node scripts/validate-migrations.js` to check for SQL syntax issues.
2. Ensure no trailing commas, missing semicolons, or syntax errors.

### Pre-Deployment Checklist

1. Verify file naming follows `YYYYMMDD_description.sql`.
2. Confirm idempotency (safe to re-run).
3. Test rollback if applicable (though Supabase migrations are forward-only).
4. Review security (e.g., SECURITY DEFINER functions).
5. Ensure no long-running locks on tables.

## Common Pitfalls

- Missing semicolons at statement ends.
- Trailing commas in INSERT statements before closing parentheses.
- Forgetting `ON CONFLICT` clauses, causing duplicate key errors on re-runs.
- Direct INSERT on RLS-protected tables without SECURITY DEFINER (fails silently or errors).
- Not cleaning up temporary functions (use `DROP FUNCTION IF EXISTS`).
- Hardcoding sensitive data (e.g., passwords) in migrations.
- Not testing locally before pushing (can break production).

## Validation Script Usage

Run `node scripts/validate-migrations.js` before committing to check for:
- Syntax errors (missing semicolons, trailing commas, unmatched brackets).
- RLS pattern compliance (warns on unprotected data operations).
- Idempotency issues (missing ON CONFLICT).
- File naming conventions.
- SECURITY DEFINER best practices (e.g., SET search_path).

The script outputs errors (❌) in red and warnings (⚠️) in yellow, with suggestions. It exits with code 1 on errors, 0 otherwise.

## Pre-Commit Hook Setup (Optional)

For automatic validation:

1. Install Husky: `npm install --save-dev husky`
2. Initialize Husky: `npx husky init`
3. Create pre-commit hook: `echo "node scripts/validate-migrations.js" > .husky/pre-commit`
4. Make executable: `chmod +x .husky/pre-commit`

This is optional; run the script manually if preferred.

## Additional Resources

- [Supabase Migration Documentation](https://supabase.com/docs/guides/migrations)
- [PostgreSQL SECURITY DEFINER](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)
- Main project README for environment setup and local testing.
```
