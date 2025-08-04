const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🗄️  Database Setup Script\n');

async function setupDatabase() {
  try {
    console.log('1. Generating database migrations...');
    
    // Generate migrations
    try {
      execSync('npm run db:generate', { stdio: 'inherit' });
      console.log('✅ Migrations generated successfully');
    } catch (error) {
      console.log('⚠️  Migration generation failed, continuing...');
    }

    console.log('\n2. Pushing schema to database...');
    
    // Push schema to database
    try {
      execSync('npm run db:push', { stdio: 'inherit' });
      console.log('✅ Database schema pushed successfully');
    } catch (error) {
      console.error('❌ Failed to push schema:', error.message);
      console.log('\n💡 Manual steps:');
      console.log('1. Connect to your database');
      console.log('2. Run the SQL commands from lib/db/migrations/');
      console.log('3. Or use: npm run db:push');
    }

    console.log('\n3. Creating admin user...');
    
    // Create admin user
    try {
      execSync('npm run create-admin', { stdio: 'inherit' });
      console.log('✅ Admin user created successfully');
    } catch (error) {
      console.log('⚠️  Admin creation failed, you can create manually later');
    }

    console.log('\n🎉 Database setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Test your application');
    console.log('2. Create additional users as needed');
    console.log('3. Deploy to production');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check DATABASE_URL in .env file');
    console.log('2. Ensure database is accessible');
    console.log('3. Verify database permissions');
  }
}

setupDatabase(); 