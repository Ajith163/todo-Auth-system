const fs = require('fs');
const path = require('path');

console.log('🔧 Database URL Update Script\n');

function updateDatabaseURL() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found');
    console.log('Run: node scripts/setup-env.js first');
    return;
  }

  console.log('📋 Current DATABASE_URL options:\n');
  console.log('1. Local PostgreSQL (if installed locally)');
  console.log('2. Railway (free cloud database)');
  console.log('3. Supabase (free cloud database)');
  console.log('4. Neon (free cloud database)');
  console.log('5. Manual input');
  
  console.log('\n🔗 Quick Setup Options:');
  console.log('\nA. For Local PostgreSQL:');
  console.log('   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/todo_app"');
  console.log('   (Replace "your_password" with the password you set during PostgreSQL installation)');
  
  console.log('\nB. For Railway (Recommended):');
  console.log('   1. Go to https://railway.app/');
  console.log('   2. Sign up and create a new project');
  console.log('   3. Add a PostgreSQL database');
  console.log('   4. Copy the connection string');
  console.log('   5. Update DATABASE_URL with the connection string');
  
  console.log('\nC. For Supabase:');
  console.log('   1. Go to https://supabase.com/');
  console.log('   2. Create a new project');
  console.log('   3. Go to Settings > Database');
  console.log('   4. Copy the connection string');
  
  console.log('\n📝 To update your DATABASE_URL:');
  console.log('1. Open .env.local in your text editor');
  console.log('2. Replace the DATABASE_URL line with your actual connection string');
  console.log('3. Save the file');
  console.log('4. Run: node scripts/fix-database-issues.js');
  
  console.log('\n⚠️  Important:');
  console.log('- Make sure PostgreSQL is running');
  console.log('- Create a database named "todo_app" (if using local PostgreSQL)');
  console.log('- Test the connection before proceeding');
  
  console.log('\n🧪 Test your connection:');
  console.log('After updating DATABASE_URL, run:');
  console.log('node scripts/fix-database-issues.js');
}

// Run the update
updateDatabaseURL(); 