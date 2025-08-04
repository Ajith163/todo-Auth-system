#!/usr/bin/env node

/**
 * Vercel Deployment Setup Script
 * This script helps you set up the required environment variables for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel Deployment Setup\n');

console.log('📋 Required Environment Variables for Vercel:\n');

console.log('1. DATABASE_URL');
console.log('   - Use a cloud PostgreSQL database (Vercel Postgres, Supabase, Railway, etc.)');
console.log('   - Format: postgresql://username:password@host:port/database\n');

console.log('2. NEXTAUTH_URL');
console.log('   - Use your Vercel deployment URL');
console.log('   - Example: https://your-app.vercel.app\n');

console.log('3. NEXTAUTH_SECRET');
console.log('   - Generate a secure secret: openssl rand -base64 32');
console.log('   - Or use: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n');

console.log('🔧 How to set these in Vercel:\n');

console.log('Method 1: Vercel Dashboard');
console.log('1. Go to your Vercel dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Add each variable with these settings:');
console.log('   - Environment: Production, Preview, Development');
console.log('   - Override: Yes (for production)\n');

console.log('Method 2: Vercel CLI');
console.log('vercel env add DATABASE_URL');
console.log('vercel env add NEXTAUTH_URL');
console.log('vercel env add NEXTAUTH_SECRET\n');

console.log('💡 Database Setup Options:\n');

console.log('Option 1: Vercel Postgres (Recommended)');
console.log('- In Vercel dashboard, go to Storage');
console.log('- Create a new Postgres database');
console.log('- Copy the connection string to DATABASE_URL\n');

console.log('Option 2: Supabase');
console.log('- Create a Supabase project');
console.log('- Go to Settings → Database');
console.log('- Copy the connection string to DATABASE_URL\n');

console.log('Option 3: Railway');
console.log('- Create a Railway project');
console.log('- Add a PostgreSQL service');
console.log('- Copy the connection string to DATABASE_URL\n');

console.log('🚀 Next Steps:');
console.log('1. Set up a cloud database');
console.log('2. Set environment variables in Vercel dashboard');
console.log('3. Push your code to GitHub');
console.log('4. Deploy to Vercel!');

console.log('\n📖 For detailed instructions, see DEPLOYMENT_GUIDE.md'); 