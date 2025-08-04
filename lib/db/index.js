import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema.js';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL;

if (!connectionString && !isBuildTime) {
  console.warn('DATABASE_URL is not defined in your environment variables.');
}

let db;

async function initializeDatabase() {
  if (!connectionString) {
    console.warn('No DATABASE_URL provided, using mock database');
    return createMockDatabase();
  }

  try {
    // Create database connection
    const client = postgres(connectionString, {
      max: 1,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      connect_timeout: 10,
      idle_timeout: 20,
    });
    
    const dbInstance = drizzle(client, { schema });
    
    console.log('✅ Database connection established');
    
    // Check if tables exist by trying to query them
    try {
      await dbInstance.select().from(schema.users).limit(1);
      console.log('✅ Database tables exist');
    } catch (error) {
      if (error.code === '42P01') {
        console.log('🔄 Tables do not exist, running migrations...');
        try {
          await migrate(dbInstance, { migrationsFolder: './lib/db/migrations' });
          console.log('✅ Database migrations completed');
        } catch (migrationError) {
          console.error('❌ Migration failed:', migrationError.message);
          console.log('🔄 Trying schema push instead...');
          
          // Try to push schema directly
          const { execSync } = await import('child_process');
          try {
            execSync('npm run db:push', { 
              stdio: 'pipe',
              env: { ...process.env, NODE_ENV: 'production' }
            });
            console.log('✅ Schema pushed successfully');
          } catch (pushError) {
            console.error('❌ Schema push failed:', pushError.message);
            console.log('🔧 Manual database setup required');
            console.log('Please run the SQL commands from lib/db/migrations/');
          }
        }
      } else {
        throw error;
      }
    }
    
    return dbInstance;
    
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
    
    // Fallback to mock database
    return createMockDatabase();
  }
}

function createMockDatabase() {
  console.warn('Using mock database due to connection issues');
  return {
    select: () => ({ from: () => ({ where: () => ({ orderBy: () => [] }) }) }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    delete: () => ({ where: () => ({ returning: () => [] }) }),
  };
}

// Initialize database connection
if (!connectionString && isBuildTime) {
  console.warn('DATABASE_URL is not defined. Using mock database during build.');
  db = createMockDatabase();
} else if (connectionString) {
  // Initialize database asynchronously
  initializeDatabase().then(database => {
    db = database;
  }).catch(error => {
    console.error('Failed to initialize database:', error);
    db = createMockDatabase();
  });
} else {
  console.warn('No database connection available. Using mock database.');
  db = createMockDatabase();
}

// Export a function that ensures database is initialized
export async function getDatabase() {
  if (db && typeof db.select === 'function') {
    return db;
  }
  
  // Wait for initialization to complete
  await new Promise(resolve => {
    const checkDb = () => {
      if (db && typeof db.select === 'function') {
        resolve();
      } else {
        setTimeout(checkDb, 100);
      }
    };
    checkDb();
  });
  
  return db;
}

// For backward compatibility, export db directly
export { db };
