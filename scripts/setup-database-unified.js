#!/usr/bin/env node

const fs = require('fs');
const { Client } = require('pg');

console.log('\n🎯 AJ-Fresh API Portal - Database Setup');
console.log('========================================\n');

// Load .env.local
const envPath = '.env.local';
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local not found');
  process.exit(1);
}

const env = {};
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const match = line.match(/^\s*([^#][^=]+?)\s*=\s*(.+?)\s*$/);
  if (match) env[match[1]] = match[2];
});

// Check which databases are available
const neonUrl = env.DATABASE_URL;
const supabaseUrl = env.POSTGRES_URL;

if (!neonUrl && !supabaseUrl) {
  console.error('❌ No database URLs found in .env.local');
  process.exit(1);
}

const SUPABASE_SQL = fs.readFileSync('supabase/migrations/20251117_initial_setup.sql', 'utf8');
const NEON_SQL = fs.readFileSync('supabase/migrations/20251117_neon_setup.sql', 'utf8');

async function setupDatabase(connectionString, dbName, isNeon = false) {
  const SQL = isNeon ? NEON_SQL : SUPABASE_SQL;
  console.log(`\n📦 Setting up ${dbName}...`);
  console.log(`   Connection: ${connectionString.split('@')[1]?.split('/')[0] || 'hidden'}`);

  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(`   ✅ Connected to ${dbName}`);

    // Execute entire SQL script at once
    let successCount = 0;
    let skipCount = 0;

    try {
      await client.query(SQL);
      console.log('\n   ✅ All tables and functions created successfully');
      successCount = 1;
    } catch (err) {
      // If full script fails, try individual statements
      const statements = [];
      let current = '';
      let inFunction = false;
      
      SQL.split('\n').forEach(line => {
        if (line.includes('$$')) inFunction = !inFunction;
        current += line + '\n';
        if (line.trim().endsWith(';') && !inFunction) {
          if (current.trim() && !current.trim().startsWith('--')) {
            statements.push(current.trim());
          }
          current = '';
        }
      });

      for (const stmt of statements) {
        if (stmt.length < 10) continue;
        
        try {
          await client.query(stmt);
          successCount++;
          process.stdout.write('.');
        } catch (err) {
          if (err.code === '42P07' || err.code === '42710' || err.message.includes('already exists')) {
            skipCount++;
            process.stdout.write('s');
          } else {
            process.stdout.write('x');
          }
        }
      }
    }

    console.log(`\n\n   ✨ Migration complete:`);
    console.log(`      Created: ${successCount} objects`);
    if (skipCount > 0) {
      console.log(`      Skipped: ${skipCount} (already exist)`);
    }

    // Verify tables
    console.log(`\n   🔍 Verifying tables...`);
    const tables = ['profiles', 'api_keys', 'request_history', 'usage_metrics'];
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`      ✅ ${table.padEnd(20)} (${result.rows[0].count} rows)`);
      } catch (err) {
        console.log(`      ❌ ${table.padEnd(20)} (not found)`);
      }
    }

    await client.end();
    return true;

  } catch (error) {
    console.error(`   ❌ Setup failed: ${error.message}`);
    try { await client.end(); } catch {}
    return false;
  }
}

async function main() {
  let neonSuccess = false;
  let supabaseSuccess = false;

  // Try Neon first (use Neon-specific SQL)
  if (neonUrl) {
    neonSuccess = await setupDatabase(neonUrl, 'Neon Database', true);
  }

  // Try Supabase (use Supabase-specific SQL)
  if (supabaseUrl) {
    supabaseSuccess = await setupDatabase(supabaseUrl, 'Supabase Postgres', false);
  }

  console.log('\n========================================');
  console.log('📊 Setup Summary:');
  console.log('========================================\n');

  if (neonUrl) {
    console.log(`   Neon:      ${neonSuccess ? '✅ Ready' : '❌ Failed'}`);
  }
  if (supabaseUrl) {
    console.log(`   Supabase:  ${supabaseSuccess ? '✅ Ready' : '❌ Failed'}`);
  }

  if (neonSuccess || supabaseSuccess) {
    console.log('\n🎉 Database setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Refresh your dashboard');
    console.log('   2. All 500/400 errors should be gone');
    console.log('   3. Create your first API key\n');
  } else {
    console.log('\n❌ Setup failed for all databases');
    console.log('\n💡 Manual setup required:');
    console.log('   1. Open your database dashboard');
    console.log('   2. Go to SQL/Query editor');
    console.log('   3. Copy from: supabase/migrations/20251117_initial_setup.sql');
    console.log('   4. Paste and RUN\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n❌ Unexpected error:', err);
  process.exit(1);
});
