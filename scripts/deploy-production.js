const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Production Deployment Script\n');

async function deployToProduction() {
  try {
    console.log('1. Checking environment variables...');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set');
      console.log('\n💡 Please set DATABASE_URL in your environment:');
      console.log('   export DATABASE_URL="your_postgres_connection_string"');
      console.log('   Or set it in Vercel environment variables');
      process.exit(1);
    }
    
    console.log('✅ DATABASE_URL is configured');

    console.log('\n2. Setting up database...');
    
    try {
      // Try to push the schema first
      console.log('Pushing database schema...');
      execSync('npm run db:push', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      console.log('✅ Database schema pushed successfully');
    } catch (error) {
      console.log('⚠️  Schema push failed, trying migrations...');
      
      try {
        execSync('npm run db:migrate', { 
          stdio: 'inherit',
          env: { ...process.env, NODE_ENV: 'production' }
        });
        console.log('✅ Database migrations applied');
      } catch (migrationError) {
        console.error('❌ Migration failed:', migrationError.message);
        console.log('\n🔧 Manual database setup required:');
        console.log('1. Connect to your production database');
        console.log('2. Run the SQL commands from lib/db/migrations/');
        console.log('3. Or use: npm run db:push');
        process.exit(1);
      }
    }

    console.log('\n3. Building application...');
    
    try {
      execSync('npm run build', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      console.log('✅ Application built successfully');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }

    console.log('\n4. Creating admin user...');
    
    try {
      execSync('npm run create-admin admin@example.com admin123', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      console.log('✅ Admin user created');
    } catch (error) {
      console.log('⚠️  Admin creation failed (you can create manually later)');
    }

    console.log('\n🎉 Production deployment completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Deploy to your hosting platform (Vercel, etc.)');
    console.log('2. Test user registration and login');
    console.log('3. Verify all features work correctly');
    
    console.log('\n🔑 Test Credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Production deployment failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check DATABASE_URL is correct');
    console.log('2. Ensure database is accessible');
    console.log('3. Verify database permissions');
    console.log('4. Check environment variables');
  }
}

// Check if running in production environment
if (process.env.NODE_ENV === 'production') {
  console.log('🌐 Running in production mode');
}

deployToProduction(); 