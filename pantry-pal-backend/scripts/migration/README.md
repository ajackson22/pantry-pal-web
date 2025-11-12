# Pantry Pal Migration Tools

Complete data migration toolkit for moving data from an existing Supabase database to your new Pantry Pal backend.

## Quick Reference

```bash
# 1. Check setup
npm run migrate:check

# 2. Export from old database
npm run migrate:export

# 3. Import to new database
npm run migrate:import

# 4. Verify data integrity
npm run migrate:verify

# 5. Rollback if needed
npm run migrate:rollback
```

## Documentation

- 📖 **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Complete migration documentation (13KB)
  - Detailed setup instructions
  - User authentication migration strategies
  - Troubleshooting guide
  - Security best practices

- 🚀 **[QUICK_START.md](./QUICK_START.md)** - Quick reference guide (5KB)
  - Step-by-step migration in 5 steps
  - Common issues and solutions
  - Timeline estimates

## Scripts

### check-setup.ts
Validates environment variables before migration.

**Usage:**
```bash
npm run migrate:check
```

**Output:**
- ✅ Shows masked environment variables
- ❌ Lists missing configuration
- 📋 Provides next steps

---

### export-data.ts
Exports all data from source Supabase database.

**Usage:**
```bash
npm run migrate:export
```

**Features:**
- Exports 7 tables: pantry_items, recipes, recipe_images, meal_plans, shopping_list_items, user_recipe_data, user_settings
- Attempts to export user authentication data
- Creates manifest.json with metadata
- Shows progress and record counts

**Output:**
- `migration-data/` directory with JSON files
- `manifest.json` with export metadata

**Environment Variables:**
- `SOURCE_SUPABASE_URL` - Source database URL
- `SOURCE_SUPABASE_KEY` - Source service_role or anon key

---

### import-data.ts
Imports data to target Supabase database.

**Usage:**
```bash
npm run migrate:import
```

**Features:**
- ✅ Automatic backup before import
- ✅ Batch processing (100 records per batch)
- ✅ UPSERT mode (updates or inserts)
- ✅ Preserves relationships (correct import order)
- ✅ Progress logging
- ⚠️ 5-second warning before starting
- 🔄 Provides rollback instructions

**Import Order:**
1. recipes (no dependencies)
2. recipe_images (depends on recipes)
3. pantry_items (depends on users)
4. meal_plans (depends on recipes, users)
5. shopping_list_items (depends on users)
6. user_recipe_data (depends on recipes, users)
7. user_settings (depends on users)

**Output:**
- Data imported to target database
- Backup created in `migration-backups/backup-[timestamp]/`
- Summary with success/failure counts

**Environment Variables:**
- `TARGET_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `TARGET_SUPABASE_SERVICE_KEY` (required!)

---

### verify-integrity.ts
Verifies data integrity after import.

**Usage:**
```bash
npm run migrate:verify
```

**Checks:**
1. **Table Counts** - Verifies all tables accessible
2. **Foreign Key Integrity** - Confirms database constraints active
3. **Unique Constraints** - Checks for duplicates
4. **Data Types** - Validates required fields and enums
5. **Row Level Security** - Confirms RLS policies active

**Output:**
- ✅ Pass/fail for each check
- 📊 Summary of all checks
- 🎉 Success message or error details

---

### rollback.ts
Restores from automatic backup.

**Usage:**
```bash
npm run migrate:rollback
```

**Features:**
- Lists available backups (uses most recent)
- ⚠️ 10-second warning before rollback
- Deletes all current data
- Restores from backup
- Batch processing for large datasets

**Warning:** Destructive operation that cannot be undone!

**Use Cases:**
- Import failed with errors
- Data imported incorrectly
- Need to re-run migration

---

## Setup Instructions

### 1. Create Migration Config

```bash
cp .env.migration.example .env.migration
```

### 2. Edit `.env.migration`

```bash
# Source database (OLD)
SOURCE_SUPABASE_URL=https://old-project.supabase.co
SOURCE_SUPABASE_KEY=eyJhbGc...  # service_role key

# Target database (NEW)
TARGET_SUPABASE_SERVICE_KEY=eyJhbGc...  # service_role key
```

### 3. Load Environment Variables

**Linux/Mac:**
```bash
export $(cat .env.migration | xargs)
```

**Windows PowerShell:**
```powershell
Get-Content .env.migration | ForEach-Object {
  if ($_ -match '^([^=]+)=(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
  }
}
```

### 4. Verify Setup

```bash
npm run migrate:check
```

---

## Migration Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Migration Process                     │
└─────────────────────────────────────────────────────────┘

1. SETUP
   ├── Create .env.migration
   ├── Load environment variables
   └── Run migrate:check
        ↓
2. EXPORT
   ├── Connect to source database
   ├── Export all tables to JSON
   ├── Save to migration-data/
   └── Create manifest.json
        ↓
3. IMPORT
   ├── Check for existing data
   ├── Create automatic backup
   ├── Import data in batches
   ├── Preserve relationships
   └── Show summary
        ↓
4. VERIFY
   ├── Check table counts
   ├── Validate constraints
   ├── Verify data types
   └── Test RLS policies
        ↓
5. SUCCESS! 🎉
   └── Backend ready to use

   (If errors occur)
        ↓
   ROLLBACK
   └── Restore from backup
```

---

## File Structure

```
scripts/migration/
├── README.md                    # This file
├── MIGRATION_GUIDE.md           # Detailed guide
├── QUICK_START.md               # Quick reference
├── check-setup.ts               # Environment check
├── export-data.ts               # Export script
├── import-data.ts               # Import script
├── verify-integrity.ts          # Verification script
└── rollback.ts                  # Rollback script

# After migration:
migration-data/                  # Exported data
├── manifest.json
├── pantry_items.json
├── recipes.json
└── ...

migration-backups/               # Automatic backups
└── backup-2025-11-11-220000/
    ├── pantry_items.json
    └── ...

.env.migration                   # Your credentials (gitignored)
```

---

## Common Issues

### "Permission denied for schema auth"
**Solution:** Use service_role key, not anon key

### "Foreign key constraint violation"
**Solution:** Migrate users first (see User Migration in guide)

### "Environment variable not set"
**Solution:** Load .env.migration variables (see Setup step 3)

### "No manifest.json found"
**Solution:** Run export script first

### "Timeout during import"
**Solution:** Normal for large datasets, script uses batching

---

## Security Notes

🔒 **Important:**
- Never commit `.env.migration` to git (already in .gitignore)
- Service role keys bypass RLS - keep them secret
- Delete `.env.migration` after migration
- Secure backup files - they contain all user data
- Use `migrate:check` to verify setup without exposing keys

---

## Support

For issues not covered here:
1. Check [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed troubleshooting
2. Review console output for specific error messages
3. Verify environment variables with `migrate:check`
4. Check Supabase Dashboard → Logs

---

## Timeline

| Data Size | Export | Import | Verify | Total |
|-----------|--------|--------|--------|-------|
| < 1K      | 1 min  | 2 min  | 1 min  | ~5 min |
| 1K-10K    | 2 min  | 5 min  | 2 min  | ~10 min |
| 10K-100K  | 5 min  | 15 min | 3 min  | ~25 min |
| > 100K    | 10 min | 30 min | 5 min  | ~45 min |

---

## Best Practices

✅ **Before Migration:**
- Test on staging database first
- Backup both source and target
- Document current record counts
- Verify network connectivity

✅ **During Migration:**
- Monitor console output
- Don't interrupt the process
- Keep terminal window open
- Save logs for reference

✅ **After Migration:**
- Run verification script
- Test all API endpoints
- Verify user access
- Keep backups for 30 days

---

*Last updated: 2025-11-11*
