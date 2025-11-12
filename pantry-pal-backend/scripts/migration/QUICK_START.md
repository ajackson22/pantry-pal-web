# Migration Quick Start Guide

Follow these steps to migrate your data from an old Supabase database to your new Pantry Pal backend.

## Prerequisites

✅ Node.js 18+ installed
✅ Source Supabase credentials (old database)
✅ Target Supabase credentials (new database - already in `.env`)
✅ Service role keys for both databases

---

## Step 1: Setup (5 minutes)

### 1.1 Install Dependencies

```bash
npm install
```

### 1.2 Create Migration Config

```bash
cp .env.migration.example .env.migration
```

### 1.3 Edit `.env.migration`

Open `.env.migration` and fill in:

```bash
# OLD database
SOURCE_SUPABASE_URL=https://your-old-project.supabase.co
SOURCE_SUPABASE_KEY=eyJhbG...  # service_role key

# NEW database (service_role key only - URL from .env)
TARGET_SUPABASE_SERVICE_KEY=eyJhbG...  # service_role key
```

**Where to find service_role key:**
1. Open Supabase Dashboard
2. Go to Settings → API
3. Copy "service_role" key (keep secret!)

### 1.4 Load Environment Variables

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

---

## Step 2: Export Data (5-10 minutes)

```bash
npm run migrate:export
```

✅ Exports all tables from old database
✅ Saves to `migration-data/` directory
✅ Creates `manifest.json` with metadata

**What gets exported:**
- pantry_items
- recipes
- recipe_images
- meal_plans
- shopping_list_items
- user_recipe_data
- user_settings
- users (if accessible)

---

## Step 3: Import Data (10-20 minutes)

```bash
npm run migrate:import
```

✅ Creates automatic backup first
✅ Imports all data in correct order
✅ Uses batching for large datasets
✅ Shows progress for each table

**What happens:**
1. Checks for existing data (warns if found)
2. Creates backup in `migration-backups/`
3. Imports data using UPSERT (updates or inserts)
4. Verifies record counts

⚠️ **Note:** Import uses UPSERT mode
- Records with same IDs will be overwritten
- New records will be inserted

---

## Step 4: Verify Data (2 minutes)

```bash
npm run migrate:verify
```

✅ Checks table counts
✅ Validates foreign keys
✅ Verifies unique constraints
✅ Confirms data types
✅ Tests Row Level Security

---

## Step 5: Test (5 minutes)

### 5.1 Manual Testing

Open Supabase Dashboard → Table Editor:
- Browse each table
- Check sample records
- Verify user associations

### 5.2 API Testing

```bash
# Start the backend
npm run dev

# Test endpoints (in another terminal)
curl http://localhost:3000/api/pantry \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Rollback (if needed)

If something goes wrong:

```bash
npm run migrate:rollback
```

⚠️ **Warning:** This deletes all current data and restores from backup!

---

## User Migration

Users need to be handled separately. Choose one option:

### Option A: Users Re-register (Easiest)

1. Users sign up with same email
2. They get new user_id
3. Data remains associated with old user_id
4. You need to map old → new user_ids

### Option B: Migrate Auth Table (Recommended)

See `MIGRATION_GUIDE.md` → "User Authentication Migration" section

---

## Common Issues

### "Permission denied for schema auth"
→ Use service_role key, not anon key

### "Foreign key constraint violation"
→ Migrate users first (see User Migration)

### "Timeout errors"
→ Normal for large datasets, script uses batching

### "Some tables show 0 records"
→ Check RLS policies, use service_role key for import

---

## Success Checklist

After migration:

- [ ] All tables show correct record counts
- [ ] Verification script passes all checks
- [ ] Can query data via Supabase Dashboard
- [ ] API endpoints return data
- [ ] User authentication works
- [ ] RLS policies are working

---

## File Structure

After migration, you'll have:

```
pantry-pal-backend/
├── migration-data/           # Exported data
│   ├── manifest.json
│   ├── pantry_items.json
│   ├── recipes.json
│   └── ...
│
├── migration-backups/        # Automatic backups
│   └── backup-2025-11-11/
│       ├── pantry_items.json
│       └── ...
│
└── .env.migration           # Your credentials (DO NOT COMMIT!)
```

---

## Timeline

| Data Size | Export | Import | Verify | Total |
|-----------|--------|--------|--------|-------|
| < 1K      | 1 min  | 2 min  | 1 min  | ~5 min |
| 1K-10K    | 2 min  | 5 min  | 2 min  | ~10 min |
| 10K-100K  | 5 min  | 15 min | 3 min  | ~25 min |

---

## Next Steps

1. ✅ Delete `.env.migration` (contains secrets)
2. ✅ Archive backups securely
3. ✅ Update frontend to use new backend
4. ✅ Deploy to production
5. ✅ Monitor for issues

---

## Need Help?

- 📖 Full guide: `scripts/migration/MIGRATION_GUIDE.md`
- 🔍 Check logs in terminal output
- 🛠️ Review Supabase Dashboard → Logs
- 🔐 Verify service_role keys are correct

---

**Pro Tip:** Test the migration on a staging database first!

---

*Last updated: 2025-11-11*
