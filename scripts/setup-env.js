#!/usr/bin/env node

/**
 * Environment Variables Setup Script
 * This script helps you set up environment variables for local development and Vercel deployment
 */

const fs = require('fs');
const path = require('path');

const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/todo_app"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Pusher (for real-time features)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="your-pusher-cluster"

# Environment
NODE_ENV="development"
`;

const envPath = path.join(__dirname, '..', '.env');

try {
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with default values');
    console.log('⚠️  Please update the values in .env file with your actual configuration');
  } else {
    console.log('✅ .env file already exists');
  }
  
  console.log('\n📝 Next steps:');
  console.log('1. Update DATABASE_URL with your database connection string');
  console.log('2. Generate a secure NEXTAUTH_SECRET (you can use: openssl rand -base64 32)');
  console.log('3. Update Pusher credentials if you want real-time features');
  console.log('4. Run: npm run dev');
  
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
} 