const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Production Deployment Fix Script\n');

async function fixProductionDeployment() {
  try {
    console.log('1. Checking environment variables...');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set in environment variables');
      console.log('Please set DATABASE_URL in your deployment environment');
      process.exit(1);
    }
    
    console.log('✅ DATABASE_URL is configured');

    console.log('\n2. Running database migrations...');
    
    try {
      // First, try to push the schema (this will create tables if they don't exist)
      console.log('Pushing schema to database...');
      execSync('npm run db:push', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      console.log('✅ Schema pushed successfully');
    } catch (error) {
      console.log('⚠️  Schema push failed, trying manual migration...');
      
      try {
        // Try running migrations manually
        execSync('npm run db:migrate', { 
          stdio: 'inherit',
          env: { ...process.env, NODE_ENV: 'production' }
        });
        console.log('✅ Migrations applied successfully');
      } catch (migrationError) {
        console.error('❌ Migration failed:', migrationError.message);
        console.log('\n🔧 Manual database setup required:');
        console.log('1. Connect to your production database');
        console.log('2. Run the following SQL commands:');
        
        // Read and display the migration files
        const migrationsDir = path.join(__dirname, '../lib/db/migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
          .filter(file => file.endsWith('.sql'))
          .sort();
        
        migrationFiles.forEach(file => {
          const filePath = path.join(migrationsDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          console.log(`\n--- ${file} ---`);
          console.log(content);
        });
        
        console.log('\n3. Or run: npm run db:push');
      }
    }

    console.log('\n3. Verifying database connection...');
    
    // Test database connection
    try {
      const testScript = `
        const { db } = require('../lib/db/index.js');
        const { users } = require('../lib/db/schema.js');
        
        async function testConnection() {
          try {
            const result = await db.select().from(users).limit(1);
            console.log('✅ Database connection and schema verified');
          } catch (error) {
            console.error('❌ Database verification failed:', error.message);
            process.exit(1);
          }
        }
        
        testConnection();
      `;
      
      const testFile = path.join(__dirname, 'temp-test.js');
      fs.writeFileSync(testFile, testScript);
      
      execSync(`node ${testFile}`, { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      fs.unlinkSync(testFile);
    } catch (error) {
      console.error('❌ Database verification failed:', error.message);
    }

    console.log('\n🎉 Production deployment fix completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your application');
    console.log('2. Test user registration and login');
    console.log('3. Create admin user if needed: npm run create-admin');

  } catch (error) {
    console.error('❌ Production deployment fix failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check DATABASE_URL in production environment');
    console.log('2. Ensure database is accessible from deployment');
    console.log('3. Verify database permissions');
    console.log('4. Check database connection limits');
  }
}

fixProductionDeployment(); 