#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

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

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const SQL = fs.readFileSync('supabase/migrations/20251117_initial_setup.sql', 'utf8');

console.log('\n🚀 Setting up Supabase database...\n');

// Parse URL
const url = new URL(SUPABASE_URL + '/rest/v1/rpc/query');

const options = {
  hostname: url.hostname,
  port: 443,
  path: '/rest/v1/',
  method: 'POST',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  }
};

// Test connection by checking tables
console.log('📡 Testing connection...');

const testReq = https.request({
  ...options,
  method: 'GET',
  path: '/rest/v1/profiles?limit=0'
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Tables already exist!');
      console.log('\n✨ Database is ready to use\n');
      process.exit(0);
    } else {
      console.log('⚠️  Tables not found, creating them...\n');
      console.log('Please run this SQL manually in Supabase Dashboard:');
      console.log('\n1. Open: https://supabase.com/dashboard');
      console.log('2. Go to SQL Editor');
      console.log('3. Copy and paste from: supabase/migrations/20251117_initial_setup.sql');
      console.log('4. Click RUN\n');
    }
  });
});

testReq.on('error', (err) => {
  console.error('❌ Connection error:', err.message);
  console.log('\nManual setup required:');
  console.log('1. Open Supabase Dashboard → SQL Editor');
  console.log('2. Copy from: supabase/migrations/20251117_initial_setup.sql');
  console.log('3. Paste and RUN\n');
  process.exit(1);
});

testReq.end();
