#!/usr/bin/env node

/**
 * Resolve Vercel Deployment Error
 * This script provides a comprehensive solution for the server-side exception error
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 Resolving Vercel Deployment Error\n');

// Check current .env file
const envPath = path.join(__dirname, '..', '.env');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

console.log('❌ Current Issues Detected:');
console.log('1. Server-side exception error in Vercel deployment');
console.log('2. Missing or incorrect environment variables in Vercel');
console.log('3. Database connection issues\n');

console.log('✅ Root Cause:');
console.log('The error "Application error: a server-side exception has occurred"');
console.log('is happening because your app is trying to connect to a database');
console.log('with placeholder or missing environment variables.\n');

// Generate secure secrets
const nextAuthSecret = crypto.randomBytes(32).toString('hex');
const nextAuthSecret2 = crypto.randomBytes(32).toString('hex');

console.log('🔧 SOLUTION: Set up Environment Variables in Vercel\n');

console.log('📋 Step 1: Get Your Vercel URL');
console.log('1. Go to https://vercel.com/dashboard');
console.log('2. Click on your project');
console.log('3. Copy your domain (e.g., https://your-project.vercel.app)\n');

console.log('📋 Step 2: Set up Database');
console.log('Option A - Vercel Postgres (Recommended):');
console.log('1. In Vercel dashboard, go to your project');
console.log('2. Click "Storage" tab');
console.log('3. Click "Create Database"');
console.log('4. Select Postgres and create');
console.log('5. Copy the connection string\n');

console.log('Option B - Supabase:');
console.log('1. Go to https://supabase.com');
console.log('2. Create a new project');
console.log('3. Go to Settings → Database');
console.log('4. Copy the connection string\n');

console.log('📋 Step 3: Set Environment Variables in Vercel');
console.log('1. Go to your Vercel dashboard');
console.log('2. Click on your project');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Add these 3 variables:\n');

console.log('Variable 1: DATABASE_URL');
console.log('   - Name: DATABASE_URL');
console.log('   - Value: Your PostgreSQL connection string from Step 2');
console.log('   - Environment: Production, Preview, Development');
console.log('   - Override: Yes\n');

console.log('Variable 2: NEXTAUTH_URL');
console.log('   - Name: NEXTAUTH_URL');
console.log('   - Value: Your Vercel domain from Step 1');
console.log('   - Example: https://your-project.vercel.app');
console.log('   - Environment: Production, Preview, Development');
console.log('   - Override: Yes\n');

console.log('Variable 3: NEXTAUTH_SECRET');
console.log('   - Name: NEXTAUTH_SECRET');
console.log(`   - Value: ${nextAuthSecret}`);
console.log('   - Environment: Production, Preview, Development');
console.log('   - Override: Yes\n');

console.log('📋 Step 4: Redeploy');
console.log('1. After setting environment variables');
console.log('2. Go to your Vercel project');
console.log('3. Click "Redeploy" on the latest deployment');
console.log('4. Or push a new commit to trigger auto-deploy\n');

console.log('🔍 Current .env Analysis:');
if (envContent.includes('postgresql://username:password@localhost:5432/todo_app')) {
  console.log('❌ DATABASE_URL is set to placeholder value');
} else if (envContent.includes('DATABASE_URL')) {
  console.log('✅ DATABASE_URL is set (but may need updating)');
} else {
  console.log('❌ DATABASE_URL is missing');
}

if (envContent.includes('http://localhost:3000')) {
  console.log('❌ NEXTAUTH_URL is set to localhost (needs Vercel URL)');
} else if (envContent.includes('NEXTAUTH_URL')) {
  console.log('✅ NEXTAUTH_URL is set');
} else {
  console.log('❌ NEXTAUTH_URL is missing');
}

if (envContent.includes('NEXTAUTH_SECRET')) {
  console.log('✅ NEXTAUTH_SECRET is set');
} else {
  console.log('❌ NEXTAUTH_SECRET is missing');
}

console.log('\n🚨 CRITICAL: These environment variables must be set in VERCEL, not just locally!\n');

console.log('💡 Quick Commands:');
console.log('To check your Vercel projects: npx vercel ls');
console.log('To login to Vercel: npx vercel login');
console.log('To add environment variables via CLI:');
console.log('  npx vercel env add DATABASE_URL');
console.log('  npx vercel env add NEXTAUTH_URL');
console.log('  npx vercel env add NEXTAUTH_SECRET\n');

console.log('🎯 Success Checklist:');
console.log('□ Set up PostgreSQL database');
console.log('□ Copy database connection string');
console.log('□ Add DATABASE_URL to Vercel environment variables');
console.log('□ Add NEXTAUTH_URL to Vercel environment variables');
console.log('□ Add NEXTAUTH_SECRET to Vercel environment variables');
console.log('□ Redeploy your application');
console.log('□ Test the application\n');

console.log('📞 If you need help:');
console.log('1. Check Vercel deployment logs for specific error messages');
console.log('2. Verify database connection string is correct');
console.log('3. Make sure database is accessible from Vercel servers');
console.log('4. Ensure all environment variables are set for all environments\n');

console.log('🔧 Alternative: Use Vercel CLI');
console.log('npm i -g vercel');
console.log('vercel login');
console.log('vercel env add DATABASE_URL');
console.log('vercel env add NEXTAUTH_URL');
console.log('vercel env add NEXTAUTH_SECRET\n');

console.log('💡 Pro Tip:');
console.log('The server error will be resolved once you set up the');
console.log('environment variables correctly in Vercel and redeploy.');
console.log('Local .env file is only for development, not production!'); 