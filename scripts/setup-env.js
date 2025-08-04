#!/usr/bin/env node

/**
 * Environment Variables Setup Script
 * This script helps you set up environment variables for local development and Vercel deployment
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

console.log('🔧 Environment Variables Setup\n');

// Generate secure secrets
const nextAuthSecret = crypto.randomBytes(32).toString('hex');

// Create .env file content
const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/todo_app"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${nextAuthSecret}"

# Pusher (for real-time notifications) - Optional
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="your-pusher-cluster"
`;

// Create .env file
const envPath = path.join(__dirname, '..', '.env');
fs.writeFileSync(envPath, envContent);

console.log('✅ Created .env file with the following variables:\n');

console.log('📋 Local Development (.env file):');
console.log('DATABASE_URL="postgresql://username:password@localhost:5432/todo_app"');
console.log('NEXTAUTH_URL="http://localhost:3000"');
console.log(`NEXTAUTH_SECRET="${nextAuthSecret}"`);
console.log('PUSHER_APP_ID="your-pusher-app-id"');
console.log('PUSHER_KEY="your-pusher-key"');
console.log('PUSHER_SECRET="your-pusher-secret"');
console.log('PUSHER_CLUSTER="your-pusher-cluster"\n');

console.log('🌐 Vercel Deployment Environment Variables:\n');

console.log('1. DATABASE_URL');
console.log('   - Get from your database provider (Vercel Postgres, Supabase, etc.)');
console.log('   - Format: postgresql://username:password@host:port/database\n');

console.log('2. NEXTAUTH_URL');
console.log('   - Use your Vercel deployment URL');
console.log('   - Example: https://your-app.vercel.app\n');

console.log('3. NEXTAUTH_SECRET');
console.log(`   - Use this generated secret: ${nextAuthSecret}\n`);

console.log('4. PUSHER_* (Optional)');
console.log('   - Get from your Pusher dashboard\n');

console.log('🔧 How to set these in Vercel:\n');

console.log('Method 1: Vercel Dashboard');
console.log('1. Go to your Vercel dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Add each variable with these settings:');
console.log('   - Environment: Production, Preview, Development');
console.log('   - Override: Yes (for production)\n');

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
console.log('1. Update the DATABASE_URL in .env with your actual database');
console.log('2. Set up environment variables in Vercel dashboard');
console.log('3. Push your code to GitHub');
console.log('4. Deploy to Vercel!');

console.log('\n📖 For detailed instructions, see DEPLOYMENT_GUIDE.md'); 