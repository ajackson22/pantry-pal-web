import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const TARGET_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.TARGET_SUPABASE_URL!;
const TARGET_SUPABASE_KEY = process.env.TARGET_SUPABASE_SERVICE_KEY!;

if (!TARGET_SUPABASE_URL || !TARGET_SUPABASE_KEY) {
  console.error('Error: TARGET_SUPABASE_URL and TARGET_SUPABASE_SERVICE_KEY must be set');
  console.error('Note: Use service_role key, not anon key for import');
  process.exit(1);
}

const supabase = createClient(TARGET_SUPABASE_URL, TARGET_SUPABASE_KEY);

const IMPORT_ORDER = [
  'recipes',
  'recipe_images',
  'pantry_items',
  'meal_plans',
  'shopping_list_items',
  'user_recipe_data',
  'user_settings',
];

interface ImportStats {
  table: string;
  records: number;
  success: boolean;
  error?: string;
}

async function createBackup(): Promise<string> {
  console.log('\n💾 Creating backup of current database...');

  const backupDir = path.join(process.cwd(), 'migration-backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup-${timestamp}`);

  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }

  for (const table of IMPORT_ORDER) {
    try {
      const { data, error } = await supabase.from(table).select('*');

      if (error) {
        console.log(`⚠️  Warning: Could not backup ${table}: ${error.message}`);
        continue;
      }

      const filePath = path.join(backupPath, `${table}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Backed up ${table}: ${data?.length || 0} records`);
    } catch (error: any) {
      console.log(`⚠️  Warning: Could not backup ${table}: ${error.message}`);
    }
  }

  console.log(`\n📁 Backup saved to: ${backupPath}`);
  return backupPath;
}

async function checkDataExists(): Promise<boolean> {
  console.log('\n🔍 Checking for existing data in target database...');

  let hasData = false;

  for (const table of IMPORT_ORDER) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`⚠️  Warning: Could not check ${table}: ${error.message}`);
        continue;
      }

      if (count && count > 0) {
        console.log(`⚠️  ${table} has ${count} existing records`);
        hasData = true;
      }
    } catch (error: any) {
      console.log(`⚠️  Warning: Could not check ${table}: ${error.message}`);
    }
  }

  return hasData;
}

async function importTable(tableName: string, batchSize: number = 100): Promise<ImportStats> {
  try {
    console.log(`\n📥 Importing ${tableName}...`);

    const dataDir = path.join(process.cwd(), 'migration-data');
    const filePath = path.join(dataDir, `${tableName}.json`);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  No data file found for ${tableName}, skipping`);
      return {
        table: tableName,
        records: 0,
        success: true,
      };
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    if (!data || data.length === 0) {
      console.log(`ℹ️  No data to import for ${tableName}`);
      return {
        table: tableName,
        records: 0,
        success: true,
      };
    }

    console.log(`📊 Found ${data.length} records to import`);

    let imported = 0;
    const batches = Math.ceil(data.length / batchSize);

    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const batch = data.slice(start, end);

      const { error } = await supabase
        .from(tableName)
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        throw new Error(`Batch ${i + 1}/${batches} failed: ${error.message}`);
      }

      imported += batch.length;
      console.log(`  ✓ Imported batch ${i + 1}/${batches} (${imported}/${data.length} records)`);
    }

    console.log(`✅ Successfully imported ${imported} records to ${tableName}`);

    return {
      table: tableName,
      records: imported,
      success: true,
    };
  } catch (error: any) {
    console.error(`❌ Error importing ${tableName}:`, error.message);
    return {
      table: tableName,
      records: 0,
      success: false,
      error: error.message,
    };
  }
}

async function importUsers(): Promise<void> {
  console.log('\n👥 Checking for user data...');

  const dataDir = path.join(process.cwd(), 'migration-data');
  const usersPath = path.join(dataDir, 'users.json');

  if (!fs.existsSync(usersPath)) {
    console.log('ℹ️  No users.json file found - skipping user import');
    console.log('ℹ️  Users will need to sign up again or be migrated separately');
    return;
  }

  const fileContent = fs.readFileSync(usersPath, 'utf-8');
  const users = JSON.parse(fileContent);

  if (!users || users.length === 0) {
    console.log('ℹ️  No user data to import');
    return;
  }

  console.log(`\n⚠️  Found ${users.length} users in export`);
  console.log('⚠️  Note: User import requires manual handling via Supabase Dashboard');
  console.log('⚠️  Or use Supabase CLI: supabase db dump and restore');
  console.log(`\n📋 User IDs found:`);
  users.forEach((user: any) => {
    console.log(`   - ${user.email} (${user.id})`);
  });

  console.log('\nℹ️  Users will need to:');
  console.log('   1. Sign up with the same email address');
  console.log('   2. Have their user_id mapped in the data');
  console.log('   3. Or migrate via Supabase auth.users table directly');
}

async function verifyImport(): Promise<void> {
  console.log('\n🔍 Verifying imported data...');

  for (const table of IMPORT_ORDER) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`⚠️  Could not verify ${table}: ${error.message}`);
        continue;
      }

      console.log(`✅ ${table}: ${count} records`);
    } catch (error: any) {
      console.log(`⚠️  Could not verify ${table}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting data import to target Supabase database...');
  console.log(`📍 Target: ${TARGET_SUPABASE_URL}\n`);

  const dataDir = path.join(process.cwd(), 'migration-data');
  const manifestPath = path.join(dataDir, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error('❌ No manifest.json found in migration-data directory');
    console.error('Please run export-data.ts first');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  console.log(`📋 Export date: ${manifest.exportDate}`);
  console.log(`📦 Total records to import: ${manifest.totalRecords}\n`);

  const hasData = await checkDataExists();

  if (hasData) {
    console.log('\n⚠️  WARNING: Target database contains existing data!');
    console.log('This import will use UPSERT (update or insert)');
    console.log('Existing records with same IDs will be overwritten\n');

    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  const backupPath = await createBackup();

  await importUsers();

  const stats: ImportStats[] = [];

  for (const table of IMPORT_ORDER) {
    const stat = await importTable(table);
    stats.push(stat);
  }

  await verifyImport();

  console.log('\n' + '='.repeat(50));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(50));

  let totalRecords = 0;
  let failedTables = 0;

  stats.forEach(stat => {
    const status = stat.success ? '✅' : '❌';
    console.log(`${status} ${stat.table}: ${stat.records} records`);
    if (stat.success) {
      totalRecords += stat.records;
    } else {
      failedTables++;
    }
  });

  console.log('='.repeat(50));
  console.log(`Total records imported: ${totalRecords}`);
  console.log(`Failed tables: ${failedTables}`);
  console.log(`Backup location: ${backupPath}`);
  console.log('='.repeat(50));

  if (failedTables > 0) {
    console.error('\n⚠️  Some tables failed to import. Check the errors above.');
    console.log(`\n🔄 To rollback, restore from backup at: ${backupPath}`);
    process.exit(1);
  }

  console.log('\n✨ Import completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Verify data in Supabase Dashboard');
  console.log('   2. Test API endpoints');
  console.log('   3. Handle user authentication migration if needed');
  console.log(`   4. Keep backup for rollback: ${backupPath}\n`);
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
