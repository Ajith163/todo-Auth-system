#!/usr/bin/env node

/**
 * Get Vercel Deployment Information
 * This script helps you find your Vercel URL and set up environment variables
 */

console.log('🔍 Vercel Deployment Information\n');

console.log('📋 To find your Vercel URL:');
console.log('1. Go to https://vercel.com/dashboard');
console.log('2. Click on your project');
console.log('3. Look for the domain in the project overview');
console.log('4. It will be something like: https://your-project-name.vercel.app\n');

console.log('🔧 Environment Variables to Set in Vercel:\n');

console.log('1. DATABASE_URL');
console.log('   - You need a real PostgreSQL database');
console.log('   - Get from Vercel Postgres, Supabase, or Railway');
console.log('   - Format: postgresql://username:password@host:port/database\n');

console.log('2. NEXTAUTH_URL');
console.log('   - Must be your actual Vercel deployment URL');
console.log('   - Example: https://your-project-name.vercel.app');
console.log('   - NOT localhost:3000\n');

console.log('3. NEXTAUTH_SECRET');
console.log('   - Use a secure random string');
console.log('   - You can generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n');

console.log('🚀 Quick Setup Steps:\n');

console.log('Step 1: Set up Database');
console.log('- Go to Vercel dashboard → Your project → Storage');
console.log('- Create a new Postgres database');
console.log('- Copy the connection string\n');

console.log('Step 2: Set Environment Variables');
console.log('- Go to Vercel dashboard → Your project → Settings → Environment Variables');
console.log('- Add DATABASE_URL with your database connection string');
console.log('- Add NEXTAUTH_URL with your Vercel domain');
console.log('- Add NEXTAUTH_SECRET with a secure random string\n');

console.log('Step 3: Redeploy');
console.log('- After setting environment variables, redeploy your project');
console.log('- The server error should be resolved\n');

console.log('💡 Current Error Fix:');
console.log('The "Application error: a server-side exception has occurred"');
console.log('is happening because your app is trying to connect to a database');
console.log('with placeholder values. Set up the real environment variables');
console.log('in Vercel and redeploy to fix this issue.\n');

console.log('📞 Need your Vercel URL?');
console.log('Run this command to get your project info:');
console.log('npx vercel ls');
console.log('(You may need to run "npx vercel login" first)'); 