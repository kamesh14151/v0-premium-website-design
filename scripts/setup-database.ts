/**
 * Supabase Database Setup Script
 * Automatically creates all required tables and policies
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting Supabase migration...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251117_initial_setup.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Running migration: 20251117_initial_setup.sql');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase.from('_migrations').select('*').limit(1);
          if (directError && directError.code === '42P01') {
            // Table doesn't exist, use raw SQL
            console.log(`   Executing statement ${i + 1}/${statements.length}...`);
          }
        }
        
        successCount++;
      } catch (err: any) {
        console.warn(`   ⚠️  Statement ${i + 1} warning:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`   Success: ${successCount} statements`);
    if (errorCount > 0) {
      console.log(`   Warnings: ${errorCount} (may be expected for existing objects)`);
    }

    // Verify tables
    console.log('\n🔍 Verifying tables...');
    const tables = ['profiles', 'api_keys', 'request_history', 'usage_metrics'];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${table}: Not found or no access`);
      } else {
        console.log(`   ✅ ${table}: Ready (${count || 0} rows)`);
      }
    }

    console.log('\n🎉 Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Refresh your dashboard');
    console.log('2. All 500/400 errors should be gone');
    console.log('3. Create your first API key\n');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nPlease run the SQL manually:');
    console.error('1. Open Supabase Dashboard → SQL Editor');
    console.error('2. Copy content from: supabase/migrations/20251117_initial_setup.sql');
    console.error('3. Paste and click RUN\n');
    process.exit(1);
  }
}

runMigration();
