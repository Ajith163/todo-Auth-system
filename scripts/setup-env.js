const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 Environment Setup Script\n');

function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

function setupEnvironment() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists');
    console.log('Please check your DATABASE_URL configuration');
    return;
  }

  // Generate a secure secret
  const secret = generateSecret();
  
  // Create environment file content
  const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/todo_app"

# NextAuth
NEXTAUTH_SECRET="${secret}"
NEXTAUTH_URL="http://localhost:3000"

# Pusher (optional for real-time features)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="your-pusher-cluster"

# Environment
NODE_ENV="development"
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local file created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update DATABASE_URL with your PostgreSQL connection string');
    console.log('2. Install PostgreSQL if not already installed');
    console.log('3. Create a database named "todo_app"');
    console.log('4. Run: node scripts/fix-database-issues.js');
    console.log('5. Start your application: npm run dev');
    
    console.log('\n🔗 Example DATABASE_URL formats:');
    console.log('Local: DATABASE_URL="postgresql://username:password@localhost:5432/todo_app"');
    console.log('Railway: DATABASE_URL="postgresql://username:password@host:port/database"');
    console.log('Supabase: DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres"');
    
  } catch (error) {
    console.error('❌ Failed to create .env.local:', error.message);
  }
}

// Run the setup
setupEnvironment(); 