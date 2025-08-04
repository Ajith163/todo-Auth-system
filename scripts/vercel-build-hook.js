const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Vercel Build Hook - Database Setup\n');

async function setupDatabaseForVercel() {
  try {
    console.log('1. Checking environment variables...');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set in Vercel environment');
      console.log('Please set DATABASE_URL in your Vercel project settings');
      console.log('This script will exit but the build will continue');
      return;
    }
    
    console.log('✅ DATABASE_URL is configured');

    console.log('\n2. Setting up database schema...');
    
    // Try multiple approaches to set up the database
    let setupSuccess = false;
    
    // Approach 1: Try schema push
    try {
      console.log('Trying schema push...');
      execSync('npm run db:push', { 
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'production' },
        timeout: 30000 // 30 second timeout
      });
      console.log('✅ Schema pushed successfully');
      setupSuccess = true;
    } catch (error) {
      console.log('⚠️  Schema push failed:', error.message);
    }
    
    // Approach 2: Try migrations if schema push failed
    if (!setupSuccess) {
      try {
        console.log('Trying database migrations...');
        execSync('npm run db:migrate', { 
          stdio: 'pipe',
          env: { ...process.env, NODE_ENV: 'production' },
          timeout: 30000
        });
        console.log('✅ Migrations applied successfully');
        setupSuccess = true;
      } catch (error) {
        console.log('⚠️  Migration failed:', error.message);
      }
    }
    
    // Approach 3: Manual SQL if both failed
    if (!setupSuccess) {
      console.log('🔄 Trying manual SQL setup...');
      try {
        const { drizzle } = require('drizzle-orm/postgres-js');
        const postgres = require('postgres');
        const schema = require('../lib/db/schema.js');
        
        const client = postgres(process.env.DATABASE_URL, {
          max: 1,
          ssl: 'require',
          connect_timeout: 10,
          idle_timeout: 20,
        });
        
        const db = drizzle(client, { schema });
        
        // Check if tables exist
        try {
          await db.select().from(schema.users).limit(1);
          console.log('✅ Tables already exist');
          setupSuccess = true;
        } catch (error) {
          if (error.code === '42P01') {
            console.log('Creating tables manually...');
            
            // Read and execute migration files
            const migrationsDir = path.join(__dirname, '../lib/db/migrations');
            const migrationFiles = fs.readdirSync(migrationsDir)
              .filter(file => file.endsWith('.sql'))
              .sort();
            
            for (const file of migrationFiles) {
              const filePath = path.join(migrationsDir, file);
              const sql = fs.readFileSync(filePath, 'utf8');
              
              console.log(`Executing ${file}...`);
              await client.unsafe(sql);
            }
            
            console.log('✅ Tables created manually');
            setupSuccess = true;
          } else {
            throw error;
          }
        }
        
        await client.end();
      } catch (error) {
        console.error('❌ Manual setup failed:', error.message);
      }
    }
    
    if (setupSuccess) {
      console.log('\n🎉 Database setup completed successfully!');
      console.log('The application should now work correctly.');
    } else {
      console.log('\n⚠️  Database setup failed');
      console.log('The application may not work correctly until the database is set up manually.');
      console.log('\nManual setup required:');
      console.log('1. Connect to your database');
      console.log('2. Run the SQL commands from lib/db/migrations/');
      console.log('3. Or use: npm run db:push');
    }

  } catch (error) {
    console.error('❌ Vercel build hook failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check DATABASE_URL in Vercel environment variables');
    console.log('2. Ensure database is accessible from Vercel');
    console.log('3. Verify database permissions');
    console.log('4. Check database connection limits');
  }
}

// Run the setup
setupDatabaseForVercel(); 