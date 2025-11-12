# Pantry Pal Data Migration Guide

This guide explains how to migrate data from an existing Supabase database to your new Pantry Pal backend.

## Overview

The migration process consists of three main steps:
1. **Export** data from source database
2. **Import** data to target database
3. **Verify** data integrity

All scripts include automatic backups, error handling, and rollback capabilities.

---

## Prerequisites

### Required Information

Before starting, gather these credentials:

**Source Database (OLD):**
- Supabase URL
- Supabase Service Role Key (or anon key for read-only)

**Target Database (NEW):**
- Already configured in your `.env` file
- Service Role Key required (not the anon key)

### Getting Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the `service_role` key (keep this secret!)

⚠️ **Warning:** The service role key bypasses Row Level Security. Never expose it in client-side code.

---

## Step 1: Export Data from Source Database

### Setup

1. Create a `.env.migration` file in the project root:

```bash
# Source database (your OLD Supabase project)
SOURCE_SUPABASE_URL=https://your-old-project.supabase.co
SOURCE_SUPABASE_KEY=your-source-service-role-key

# Target database (your NEW Pantry Pal backend)
# These should already be in .env, but can be overridden here
TARGET_SUPABASE_URL=https://your-new-project.supabase.co
TARGET_SUPABASE_SERVICE_KEY=your-target-service-role-key
```

2. Load environment variables:

```bash
# On Linux/Mac:
export $(cat .env.migration | xargs)

# On Windows (PowerShell):
Get-Content .env.migration | ForEach-Object {
  if ($_ -match '^([^=]+)=(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
  }
}
```

### Run Export

```bash
# Install dependencies if needed
npm install

# Run export script
npx tsx scripts/migration/export-data.ts
```

### What Gets Exported

The script exports all data from these tables:
- ✅ pantry_items
- ✅ recipes
- ✅ recipe_images
- ✅ meal_plans
- ✅ shopping_list_items
- ✅ user_recipe_data
- ✅ user_settings
- ℹ️ users (auth data - see User Migration section)

### Output

Data is exported to `migration-data/` directory:

```
migration-data/
├── manifest.json          # Export metadata
├── pantry_items.json
├── recipes.json
├── recipe_images.json
├── meal_plans.json
├── shopping_list_items.json
├── user_recipe_data.json
├── user_settings.json
└── users.json            # If available
```

### Export Troubleshooting

**Issue:** "Failed to fetch users"
- **Cause:** Using anon key instead of service_role key
- **Solution:** Use service_role key from Supabase dashboard

**Issue:** "Table not found"
- **Cause:** Table doesn't exist in source database
- **Solution:** Table will be skipped, migration continues

**Issue:** "Connection timeout"
- **Cause:** Network issues or incorrect URL
- **Solution:** Verify SOURCE_SUPABASE_URL is correct

---

## Step 2: Import Data to Target Database

### Important Notes Before Import

⚠️ **Backup:** The script automatically creates a backup before importing

⚠️ **UPSERT Mode:** Import uses UPSERT (update or insert)
- Existing records with matching IDs will be **overwritten**
- New records will be **inserted**

⚠️ **User IDs:** The script preserves user_id values
- If users don't exist in target auth.users table, you'll get foreign key errors
- See User Migration section below

### Run Import

```bash
# Make sure environment variables are set (see Step 1)
# Run import script
npx tsx scripts/migration/import-data.ts
```

### Import Process

The script will:
1. ✅ Check for existing data (warns if found)
2. ✅ Create automatic backup in `migration-backups/`
3. ✅ Import data in correct order (respecting foreign keys)
4. ✅ Use batching for large datasets
5. ✅ Verify import with record counts
6. ✅ Provide rollback instructions if errors occur

### Import Order

Data is imported in this order to maintain referential integrity:

1. recipes (no dependencies)
2. recipe_images (depends on recipes)
3. pantry_items (depends on users)
4. meal_plans (depends on recipes, users)
5. shopping_list_items (depends on users)
6. user_recipe_data (depends on recipes, users)
7. user_settings (depends on users)

### Import Troubleshooting

**Issue:** "Foreign key constraint violation"
- **Cause:** Referenced user_id doesn't exist in auth.users
- **Solution:** Import users first (see User Migration)

**Issue:** "Unique constraint violation"
- **Cause:** Duplicate IDs in data
- **Solution:** Check source data, may need to clean duplicates

**Issue:** "Batch failed"
- **Cause:** Data validation error (wrong type, missing required field)
- **Solution:** Check error message, fix data in JSON file, re-run import

---

## Step 3: Verify Data Integrity

After import, verify everything migrated correctly:

```bash
npx tsx scripts/migration/verify-integrity.ts
```

### Verification Checks

The script performs these checks:

1. **Table Counts**
   - Verifies all tables are accessible
   - Shows record count for each table

2. **Foreign Key Integrity**
   - Checks for orphaned records
   - Verifies all relationships are valid

3. **Unique Constraints**
   - Ensures no duplicate values in unique columns
   - Checks recipe_images.recipe_id
   - Checks user_settings.user_id

4. **Data Types**
   - Validates required fields are present
   - Checks enum values (location, meal_type, etc.)

5. **Row Level Security**
   - Confirms RLS policies are active

### Manual Verification

Additionally, manually verify in Supabase Dashboard:

1. Open Table Editor
2. Check sample records from each table
3. Verify user associations are correct
4. Test API endpoints with real requests

---

## User Authentication Migration

User migration is the most complex part because it involves the `auth.users` table.

### Option 1: Users Re-register (Recommended for Small User Bases)

**Pros:** Simple, secure, no auth migration needed
**Cons:** Users must create new accounts

**Process:**
1. Migrate all data (pantry, recipes, etc.)
2. Note the user_id mappings from `users.json`
3. Users sign up with same email
4. Manually update user_id in tables (or write a mapping script)

### Option 2: Supabase Auth Migration (For Larger User Bases)

**Pros:** Users keep credentials, seamless experience
**Cons:** More complex, requires database access

**Process:**

1. Export auth.users from source:
```sql
-- Run this in source database SQL editor
COPY (
  SELECT id, email, encrypted_password, email_confirmed_at,
         created_at, updated_at, raw_app_meta_data, raw_user_meta_data
  FROM auth.users
) TO STDOUT WITH CSV HEADER;
```

2. Save output to `users.csv`

3. Import to target database:
```sql
-- Run this in target database SQL editor
-- First, temporarily disable triggers
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- Import users
COPY auth.users (id, email, encrypted_password, email_confirmed_at,
                 created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
FROM '/path/to/users.csv' WITH CSV HEADER;

-- Re-enable triggers
ALTER TABLE auth.users ENABLE TRIGGER ALL;
```

4. Verify users can log in

### Option 3: Supabase CLI Migration

Use Supabase CLI for complete auth migration:

```bash
# Install Supabase CLI
npm install -g supabase

# Dump auth schema from source
supabase db dump --db-url "postgresql://[SOURCE_CONNECTION_STRING]" \
  --schema auth > auth_dump.sql

# Restore to target
psql "postgresql://[TARGET_CONNECTION_STRING]" < auth_dump.sql
```

---

## Rollback Procedure

If something goes wrong, you can rollback to the automatic backup:

```bash
npx tsx scripts/migration/rollback.ts
```

### Rollback Process

The script will:
1. List available backups (most recent is used)
2. Show 10-second warning
3. Delete all current data
4. Restore from backup

⚠️ **Warning:** Rollback is destructive and cannot be undone!

### Manual Rollback

If automated rollback fails:

1. Go to `migration-backups/backup-[timestamp]/`
2. For each table, copy the JSON data
3. Use Supabase Dashboard → Table Editor → Insert
4. Or use SQL:

```sql
-- Example for pantry_items
DELETE FROM pantry_items;
INSERT INTO pantry_items (id, user_id, name, ...)
VALUES (...data from JSON...);
```

---

## Common Issues and Solutions

### Issue: "Permission denied for schema auth"

**Cause:** Not using service_role key
**Solution:** Use service_role key, not anon key

### Issue: "Row level security policy violation"

**Cause:** RLS blocking insert with service_role key (shouldn't happen)
**Solution:** Verify you're using service_role key correctly

### Issue: "Timeout errors during import"

**Cause:** Large dataset or slow connection
**Solution:**
- Script uses batching (100 records per batch)
- Increase timeout in import-data.ts if needed
- Check network connection

### Issue: "Data looks correct but API returns empty"

**Cause:** RLS policies blocking access
**Solution:**
- Verify user_id in data matches authenticated user
- Check RLS policies in Supabase Dashboard
- Test with service_role key to bypass RLS

### Issue: "Some recipes missing after import"

**Cause:** Foreign key constraint on recipe_images or meal_plans
**Solution:**
- Check import logs for errors
- Verify source data has valid relationships
- Import recipes first, then dependent tables

---

## Post-Migration Checklist

After successful migration:

- [ ] Run integrity verification script
- [ ] Test authentication (sign in with existing user)
- [ ] Test API endpoints:
  - [ ] GET /api/pantry
  - [ ] GET /api/recipes
  - [ ] GET /api/meal-plans
  - [ ] GET /api/shopping-list
  - [ ] GET /api/settings
- [ ] Verify data in Supabase Dashboard
- [ ] Check RLS policies are working
- [ ] Test recipe creation/update
- [ ] Test meal plan creation
- [ ] Archive migration files:
  - [ ] Keep backup in safe location
  - [ ] Document migration date
  - [ ] Save user_id mappings if needed

---

## Migration Script Reference

### Environment Variables

```bash
# Export script
SOURCE_SUPABASE_URL=        # Source database URL
SOURCE_SUPABASE_KEY=        # Source service_role or anon key

# Import script
TARGET_SUPABASE_URL=        # Target database URL (or use NEXT_PUBLIC_SUPABASE_URL)
TARGET_SUPABASE_SERVICE_KEY=# Target service_role key (required!)

# Can also use from .env
NEXT_PUBLIC_SUPABASE_URL=   # Used if TARGET_SUPABASE_URL not set
```

### Script Usage

```bash
# Export data
npx tsx scripts/migration/export-data.ts

# Import data
npx tsx scripts/migration/import-data.ts

# Verify integrity
npx tsx scripts/migration/verify-integrity.ts

# Rollback to backup
npx tsx scripts/migration/rollback.ts
```

### Files Created

```
migration-data/          # Exported data
├── manifest.json
├── *.json files

migration-backups/       # Automatic backups
└── backup-[timestamp]/
    └── *.json files
```

---

## Support

If you encounter issues not covered in this guide:

1. Check Supabase logs in Dashboard → Logs
2. Review error messages in console output
3. Verify environment variables are correct
4. Check source data integrity
5. Ensure sufficient database permissions

---

## Security Notes

🔒 **Important Security Practices:**

1. **Never commit `.env.migration`** - Add to `.gitignore`
2. **Never expose service_role key** - Only use server-side
3. **Delete service_role keys** from environment after migration
4. **Secure backup files** - Contains all user data
5. **Review RLS policies** - Ensure they're restrictive enough

---

## Best Practices

✅ **Before Migration:**
- Test on a staging database first
- Document current record counts
- Backup both source and target databases
- Verify network connectivity

✅ **During Migration:**
- Monitor console output for errors
- Don't interrupt the process
- Keep terminal window open
- Save logs for reference

✅ **After Migration:**
- Run integrity checks
- Test all API endpoints
- Verify user access patterns
- Keep backups for 30 days minimum

---

## Migration Timeline

**Estimated time based on data size:**

| Records | Export | Import | Verify | Total |
|---------|--------|--------|--------|-------|
| < 1K    | 1 min  | 2 min  | 1 min  | ~5 min |
| 1K-10K  | 2 min  | 5 min  | 2 min  | ~10 min |
| 10K-100K| 5 min  | 15 min | 3 min  | ~25 min |
| > 100K  | 10 min | 30 min | 5 min  | ~45 min |

*Times are approximate and depend on network speed and hardware*

---

## Success!

Once migration is complete and verified:

🎉 Your Pantry Pal backend is ready to use!

Next steps:
1. Update frontend environment variables
2. Test user authentication flow
3. Deploy backend to production
4. Monitor for any issues

---

*Last updated: 2025-11-11*
