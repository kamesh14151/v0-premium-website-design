#!/usr/bin/env node

/**
 * AJStudioz AI Developer Portal - Setup & Start Script
 * Runs database migration and starts the dev server
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 AJStudioz AI Developer Portal Setup\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ Error: .env.local file not found');
  console.log('📝 Please copy .env.example to .env.local and configure your credentials\n');
  process.exit(1);
}

console.log('✅ Environment file found\n');

// Check node_modules
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('📦 Installing dependencies...\n');
  try {
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
    console.log('\n✅ Dependencies installed\n');
  } catch (error) {
    console.log('\n❌ Failed to install dependencies');
    process.exit(1);
  }
}

console.log('📊 Database Setup Instructions:\n');
console.log('1. Go to: https://supabase.com/dashboard/project/hqfgblqxcqowiudrfioi/sql/new');
console.log('2. Copy SQL from: supabase/migrations/001_initial_schema.sql');
console.log('3. Paste and click "Run"\n');

console.log('Press any key to continue after running the migration...');
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.once('data', () => {
  process.stdin.setRawMode(false);
  
  console.log('\n\n🎉 Starting development server...\n');
  console.log('📡 Server: http://localhost:3000');
  console.log('🔧 Console: http://localhost:3000/dashboard/console');
  console.log('📋 Models: http://localhost:3000/dashboard/models\n');
  console.log('Press Ctrl+C to stop\n');
  
  try {
    execSync('npm run dev', { stdio: 'inherit' });
  } catch (error) {
    console.log('\n❌ Server stopped');
    process.exit(0);
  }
});
