import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema.js';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not defined');
  process.exit(1);
}

async function initializeDatabase() {
  console.log('🗄️  Initializing database...');
  
  try {
    // Create database connection
    const client = postgres(connectionString, {
      max: 1,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      connect_timeout: 10,
      idle_timeout: 20,
    });
    
    const db = drizzle(client, { schema });
    
    console.log('✅ Database connection established');
    
    // Run migrations
    console.log('🔄 Running database migrations...');
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    console.log('✅ Database migrations completed');
    
    // Verify tables exist
    console.log('🔍 Verifying database schema...');
    const result = await db.select().from(schema.users).limit(1);
    console.log('✅ Database schema verified');
    
    await client.end();
    console.log('🎉 Database initialization completed successfully');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    if (error.code === '42P01') {
      console.log('\n🔧 The "users" table does not exist. This usually means:');
      console.log('1. Migrations haven\'t been run');
      console.log('2. Database schema is out of sync');
      console.log('3. Database connection issues');
      console.log('\n💡 Solutions:');
      console.log('1. Run: npm run db:push');
      console.log('2. Or run: npm run db:migrate');
      console.log('3. Check DATABASE_URL configuration');
    }
    
    process.exit(1);
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export { initializeDatabase }; 