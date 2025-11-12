import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SOURCE_SUPABASE_URL = process.env.SOURCE_SUPABASE_URL!;
const SOURCE_SUPABASE_KEY = process.env.SOURCE_SUPABASE_KEY!;

if (!SOURCE_SUPABASE_URL || !SOURCE_SUPABASE_KEY) {
  console.error('Error: SOURCE_SUPABASE_URL and SOURCE_SUPABASE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(SOURCE_SUPABASE_URL, SOURCE_SUPABASE_KEY);

const TABLES = [
  'pantry_items',
  'recipes',
  'recipe_images',
  'meal_plans',
  'shopping_list_items',
  'user_recipe_data',
  'user_settings',
];

interface ExportStats {
  table: string;
  records: number;
  success: boolean;
  error?: string;
}

async function exportTable(tableName: string): Promise<ExportStats> {
  try {
    console.log(`\n📦 Exporting ${tableName}...`);

    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' });

    if (error) {
      throw new Error(`Failed to fetch ${tableName}: ${error.message}`);
    }

    const exportDir = path.join(process.cwd(), 'migration-data');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`✅ Exported ${count || data?.length || 0} records to ${filePath}`);

    return {
      table: tableName,
      records: count || data?.length || 0,
      success: true,
    };
  } catch (error: any) {
    console.error(`❌ Error exporting ${tableName}:`, error.message);
    return {
      table: tableName,
      records: 0,
      success: false,
      error: error.message,
    };
  }
}

async function exportUserData(): Promise<void> {
  try {
    console.log('\n👥 Exporting user authentication data...');

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ Failed to fetch users:', error.message);
      console.log('ℹ️  Skipping user export - you may need to use service_role key');
      return;
    }

    if (!users || users.length === 0) {
      console.log('ℹ️  No users found to export');
      return;
    }

    const exportDir = path.join(process.cwd(), 'migration-data');
    const userDataPath = path.join(exportDir, 'users.json');

    const sanitizedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata,
    }));

    fs.writeFileSync(userDataPath, JSON.stringify(sanitizedUsers, null, 2));
    console.log(`✅ Exported ${users.length} users to ${userDataPath}`);
  } catch (error: any) {
    console.error('❌ Error exporting users:', error.message);
    console.log('ℹ️  Note: User migration will need to be handled separately');
  }
}

async function generateManifest(stats: ExportStats[]): Promise<void> {
  const exportDir = path.join(process.cwd(), 'migration-data');
  const manifestPath = path.join(exportDir, 'manifest.json');

  const manifest = {
    exportDate: new Date().toISOString(),
    sourceUrl: SOURCE_SUPABASE_URL,
    tables: stats,
    totalRecords: stats.reduce((sum, stat) => sum + stat.records, 0),
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📋 Manifest created at ${manifestPath}`);
}

async function main() {
  console.log('🚀 Starting data export from source Supabase database...');
  console.log(`📍 Source: ${SOURCE_SUPABASE_URL}\n`);

  const stats: ExportStats[] = [];

  await exportUserData();

  for (const table of TABLES) {
    const stat = await exportTable(table);
    stats.push(stat);
  }

  await generateManifest(stats);

  console.log('\n' + '='.repeat(50));
  console.log('📊 EXPORT SUMMARY');
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
  console.log(`Total records exported: ${totalRecords}`);
  console.log(`Failed tables: ${failedTables}`);
  console.log(`Export directory: ${path.join(process.cwd(), 'migration-data')}`);
  console.log('='.repeat(50));

  if (failedTables > 0) {
    console.error('\n⚠️  Some tables failed to export. Check the errors above.');
    process.exit(1);
  }

  console.log('\n✨ Export completed successfully!');
  console.log('📁 Data files are ready in the migration-data directory\n');
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
