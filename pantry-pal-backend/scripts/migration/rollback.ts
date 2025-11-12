import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const TARGET_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.TARGET_SUPABASE_URL!;
const TARGET_SUPABASE_KEY = process.env.TARGET_SUPABASE_SERVICE_KEY!;

if (!TARGET_SUPABASE_URL || !TARGET_SUPABASE_KEY) {
  console.error('Error: TARGET_SUPABASE_URL and TARGET_SUPABASE_SERVICE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(TARGET_SUPABASE_URL, TARGET_SUPABASE_KEY);

const TABLES = [
  'user_recipe_data',
  'shopping_list_items',
  'meal_plans',
  'pantry_items',
  'recipe_images',
  'recipes',
  'user_settings',
];

async function listBackups(): Promise<string[]> {
  const backupDir = path.join(process.cwd(), 'migration-backups');

  if (!fs.existsSync(backupDir)) {
    return [];
  }

  const backups = fs.readdirSync(backupDir)
    .filter(f => fs.statSync(path.join(backupDir, f)).isDirectory())
    .sort()
    .reverse();

  return backups;
}

async function rollbackTable(tableName: string, backupPath: string): Promise<boolean> {
  try {
    console.log(`\n🔄 Rolling back ${tableName}...`);

    const filePath = path.join(backupPath, `${tableName}.json`);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  No backup found for ${tableName}, skipping`);
      return true;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    console.log(`🗑️  Deleting current data from ${tableName}...`);
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error(`❌ Failed to delete from ${tableName}:`, deleteError.message);
      return false;
    }

    if (data && data.length > 0) {
      console.log(`📥 Restoring ${data.length} records to ${tableName}...`);

      const batchSize = 100;
      const batches = Math.ceil(data.length / batchSize);

      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, data.length);
        const batch = data.slice(start, end);

        const { error } = await supabase
          .from(tableName)
          .insert(batch);

        if (error) {
          console.error(`❌ Failed to restore batch ${i + 1}/${batches}:`, error.message);
          return false;
        }

        console.log(`  ✓ Restored batch ${i + 1}/${batches}`);
      }
    } else {
      console.log(`ℹ️  No data to restore for ${tableName}`);
    }

    console.log(`✅ Successfully rolled back ${tableName}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Error rolling back ${tableName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔄 Rollback utility for Pantry Pal migration\n');

  const backups = await listBackups();

  if (backups.length === 0) {
    console.error('❌ No backups found in migration-backups directory');
    process.exit(1);
  }

  console.log('📁 Available backups:');
  backups.forEach((backup, index) => {
    console.log(`   ${index + 1}. ${backup}`);
  });

  const backupToUse = backups[0];
  const backupPath = path.join(process.cwd(), 'migration-backups', backupToUse);

  console.log(`\n🎯 Using most recent backup: ${backupToUse}`);
  console.log(`📍 Backup path: ${backupPath}`);

  console.log('\n⚠️  WARNING: This will DELETE all current data and restore from backup!');
  console.log('⚠️  This operation cannot be undone!');
  console.log('\nPress Ctrl+C to cancel, or wait 10 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('🚀 Starting rollback...\n');

  let successCount = 0;
  let failCount = 0;

  for (const table of TABLES) {
    const success = await rollbackTable(table, backupPath);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 ROLLBACK SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${successCount} tables`);
  console.log(`❌ Failed: ${failCount} tables`);
  console.log('='.repeat(50));

  if (failCount > 0) {
    console.error('\n⚠️  Some tables failed to rollback. Check the errors above.');
    process.exit(1);
  }

  console.log('\n✨ Rollback completed successfully!');
  console.log('🔍 Verify the data in your Supabase Dashboard\n');
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
