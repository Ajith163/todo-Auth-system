#!/usr/bin/env node

/**
 * Vercel Deployment Setup Script
 * This script helps you set up the required environment variables for Vercel deployment
 */

const crypto = require('crypto');

console.log('🚀 Vercel Deployment Setup\n');

console.log('📋 Required Environment Variables:\n');

// Generate a secure NEXTAUTH_SECRET
const nextAuthSecret = crypto.randomBytes(32).toString('hex');

console.log('1. DATABASE_URL');
console.log('   Format: postgresql://username:password@host:port/database');
console.log('   Example: postgresql://myuser:mypassword@localhost:5432/todo_app');
console.log('   ⚠️  Use a production PostgreSQL database (Vercel Postgres, Supabase, Railway)\n');

console.log('2. NEXTAUTH_URL');
console.log('   Format: https://your-domain.vercel.app');
console.log('   Example: https://my-todo-app.vercel.app');
console.log('   ⚠️  Use your actual Vercel deployment URL\n');

console.log('3. NEXTAUTH_SECRET');
console.log('   Generated secure secret:');
console.log(`   ${nextAuthSecret}\n`);

console.log('📝 Optional Environment Variables (for real-time notifications):\n');

console.log('4. PUSHER_APP_ID');
console.log('   Get from your Pusher dashboard\n');

console.log('5. PUSHER_KEY');
console.log('   Get from your Pusher dashboard\n');

console.log('6. PUSHER_SECRET');
console.log('   Get from your Pusher dashboard\n');

console.log('7. PUSHER_CLUSTER');
console.log('   Get from your Pusher dashboard\n');

console.log('🔧 How to set these in Vercel:\n');

console.log('Method 1: Vercel Dashboard');
console.log('1. Go to your Vercel dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Add each environment variable');
console.log('5. Set Environment to: Production, Preview, Development\n');

console.log('Method 2: Vercel CLI');
console.log('npm i -g vercel');
console.log('vercel login');
console.log('vercel env add DATABASE_URL');
console.log('vercel env add NEXTAUTH_URL');
console.log('vercel env add NEXTAUTH_SECRET\n');

console.log('💡 Database Setup Options:\n');

console.log('Option 1: Vercel Postgres (Recommended)');
console.log('- In Vercel dashboard, go to Storage');
console.log('- Create a new Postgres database');
console.log('- Copy the connection string\n');

console.log('Option 2: Supabase');
console.log('- Create a Supabase project');
console.log('- Go to Settings → Database');
console.log('- Copy the connection string\n');

console.log('Option 3: Railway');
console.log('- Create a Railway project');
console.log('- Add a PostgreSQL service');
console.log('- Copy the connection string\n');

console.log('🚀 After setting up environment variables:');
console.log('1. Push your code to GitHub');
console.log('2. Connect your repository to Vercel');
console.log('3. Deploy!');

console.log('\n📖 For detailed instructions, see DEPLOYMENT_GUIDE.md'); 