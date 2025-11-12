#!/usr/bin/env node

console.log('🔍 Checking migration setup...\n');

const checks = {
  sourceUrl: process.env.SOURCE_SUPABASE_URL,
  sourceKey: process.env.SOURCE_SUPABASE_KEY,
  targetUrl: process.env.TARGET_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  targetKey: process.env.TARGET_SUPABASE_SERVICE_KEY,
};

let allGood = true;

console.log('📋 Environment Variables:\n');

// Source Database
console.log('SOURCE DATABASE (Old):');
if (checks.sourceUrl) {
  console.log('  ✅ SOURCE_SUPABASE_URL:', checks.sourceUrl);
} else {
  console.log('  ❌ SOURCE_SUPABASE_URL: NOT SET');
  allGood = false;
}

if (checks.sourceKey) {
  const masked = checks.sourceKey.substring(0, 20) + '...' + checks.sourceKey.substring(checks.sourceKey.length - 10);
  console.log('  ✅ SOURCE_SUPABASE_KEY:', masked);
} else {
  console.log('  ❌ SOURCE_SUPABASE_KEY: NOT SET');
  allGood = false;
}

console.log('\nTARGET DATABASE (New):');
if (checks.targetUrl) {
  console.log('  ✅ TARGET_SUPABASE_URL:', checks.targetUrl);
} else {
  console.log('  ❌ TARGET_SUPABASE_URL: NOT SET');
  console.log('     (Will use NEXT_PUBLIC_SUPABASE_URL from .env if available)');
}

if (checks.targetKey) {
  const masked = checks.targetKey.substring(0, 20) + '...' + checks.targetKey.substring(checks.targetKey.length - 10);
  console.log('  ✅ TARGET_SUPABASE_SERVICE_KEY:', masked);
} else {
  console.log('  ❌ TARGET_SUPABASE_SERVICE_KEY: NOT SET');
  allGood = false;
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('✅ Setup complete! Ready to migrate.\n');
  console.log('Next steps:');
  console.log('  1. npm run migrate:export');
  console.log('  2. npm run migrate:import');
  console.log('  3. npm run migrate:verify\n');
} else {
  console.log('❌ Setup incomplete!\n');
  console.log('Missing environment variables. Please:');
  console.log('  1. Copy .env.migration.example to .env.migration');
  console.log('  2. Fill in your Supabase credentials');
  console.log('  3. Load environment variables:');
  console.log('     Linux/Mac: export $(cat .env.migration | xargs)');
  console.log('     Windows: See QUICK_START.md for PowerShell command');
  console.log('  4. Run this check again\n');
  process.exit(1);
}
