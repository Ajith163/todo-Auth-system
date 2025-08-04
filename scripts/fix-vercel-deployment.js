#!/usr/bin/env node

/**
 * Vercel Deployment Fix Script
 * This script helps diagnose and fix common Vercel deployment issues
 */

const crypto = require('crypto');

console.log('🔧 Vercel Deployment Fix\n');

// Generate a new secure secret
const nextAuthSecret = crypto.randomBytes(32).toString('hex');

console.log('❌ Current Issues:');
console.log('1. DATABASE_URL is set to placeholder value');
console.log('2. NEXTAUTH_URL is set to localhost');
console.log('3. Environment variables not set in Vercel\n');

console.log('✅ Solution: Set up environment variables in Vercel\n');

console.log('📋 Required Environment Variables for Vercel:\n');

console.log('1. DATABASE_URL');
console.log('   - You need a real PostgreSQL database');
console.log('   - Options: Vercel Postgres, Supabase, Railway');
console.log('   - Format: postgresql://username:password@host:port/database\n');

console.log('2. NEXTAUTH_URL');
console.log('   - Must be your actual Vercel deployment URL');
console.log('   - Example: https://your-app-name.vercel.app');
console.log('   - NOT localhost:3000\n');

console.log('3. NEXTAUTH_SECRET');
console.log(`   - Use this generated secret: ${nextAuthSecret}\n`);

console.log('🔧 How to Fix:\n');

console.log('Step 1: Set up a Database');
console.log('Option A - Vercel Postgres (Recommended):');
console.log('1. Go to your Vercel dashboard');
console.log('2. Click on your project');
console.log('3. Go to Storage tab');
console.log('4. Click "Create Database"');
console.log('5. Select Postgres and create');
console.log('6. Copy the connection string\n');

console.log('Option B - Supabase:');
console.log('1. Go to supabase.com');
console.log('2. Create a new project');
console.log('3. Go to Settings → Database');
console.log('4. Copy the connection string\n');

console.log('Step 2: Set Environment Variables in Vercel');
console.log('1. Go to your Vercel dashboard');
console.log('2. Click on your project');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Add these variables:\n');

console.log('Variable 1: DATABASE_URL');
console.log('   - Name: DATABASE_URL');
console.log('   - Value: Your PostgreSQL connection string');
console.log('   - Environment: Production, Preview, Development');
console.log('   - Override: Yes\n');

console.log('Variable 2: NEXTAUTH_URL');
console.log('   - Name: NEXTAUTH_URL');
console.log('   - Value: https://your-app-name.vercel.app');
console.log('   - Environment: Production, Preview, Development');
console.log('   - Override: Yes\n');

console.log('Variable 3: NEXTAUTH_SECRET');
console.log('   - Name: NEXTAUTH_SECRET');
console.log(`   - Value: ${nextAuthSecret}`);
console.log('   - Environment: Production, Preview, Development');
console.log('   - Override: Yes\n');

console.log('Step 3: Redeploy');
console.log('1. After setting environment variables');
console.log('2. Go to your Vercel project');
console.log('3. Click "Redeploy" on the latest deployment');
console.log('4. Or push a new commit to trigger auto-deploy\n');

console.log('🔍 To check your Vercel URL:');
console.log('1. Go to your Vercel dashboard');
console.log('2. Click on your project');
console.log('3. Look for the domain (usually your-project-name.vercel.app)\n');

console.log('🚨 Common Issues:');
console.log('- Make sure DATABASE_URL is a real PostgreSQL connection string');
console.log('- NEXTAUTH_URL must match your actual Vercel domain');
console.log('- Environment variables must be set for all environments');
console.log('- Database must be accessible from Vercel servers\n');

console.log('📞 Need Help?');
console.log('- Check Vercel deployment logs for specific error messages');
console.log('- Verify database connection string is correct');
console.log('- Make sure database is running and accessible');
console.log('- Test database connection locally first\n');

console.log('🎯 Quick Checklist:');
console.log('□ Set up PostgreSQL database (Vercel/Supabase/Railway)');
console.log('□ Copy database connection string');
console.log('□ Add DATABASE_URL to Vercel environment variables');
console.log('□ Add NEXTAUTH_URL to Vercel environment variables');
console.log('□ Add NEXTAUTH_SECRET to Vercel environment variables');
console.log('□ Redeploy your application');
console.log('□ Test the application\n');

console.log('💡 Pro Tip:');
console.log('After setting environment variables, you may need to redeploy');
console.log('for the changes to take effect. The server error should be resolved');
console.log('once all environment variables are properly configured.'); 