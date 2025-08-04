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
let isInitialized = false;

async function createTablesIfNotExist(client) {
  try {
    console.log('🔄 Creating database tables...');
    
    // Create users table
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY NOT NULL,
        "email" text NOT NULL,
        "password" text NOT NULL,
        "role" text DEFAULT 'user' NOT NULL,
        "approved" boolean DEFAULT false NOT NULL,
        "rejected" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "users_email_unique" UNIQUE("email")
      );
    `);
    
    // Create todos table
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS "todos" (
        "id" serial PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "description" text,
        "completed" boolean DEFAULT false NOT NULL,
        "due_date" timestamp,
        "tags" json,
        "priority" text DEFAULT 'medium',
        "user_id" integer NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "todos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
      );
    `);
    
    // Create indexes
    await client.unsafe(`
      CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
      CREATE INDEX IF NOT EXISTS "todos_user_id_idx" ON "todos"("user_id");
      CREATE INDEX IF NOT EXISTS "todos_completed_idx" ON "todos"("completed");
    `);
    
    console.log('✅ Database tables created successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to create tables:', error.message);
    return false;
  }
}

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
    
    // Always try to create tables first
    const tablesCreated = await createTablesIfNotExist(client);
    
    if (tablesCreated) {
      console.log('✅ Database schema verified');
    } else {
      // Fallback: Try to check if tables exist
      try {
        await dbInstance.select().from(schema.users).limit(1);
        console.log('✅ Database tables exist');
      } catch (error) {
        if (error.code === '42P01') {
          console.log('🔄 Tables do not exist, trying migrations...');
          try {
            await migrate(dbInstance, { migrationsFolder: './lib/db/migrations' });
            console.log('✅ Database migrations completed');
          } catch (migrationError) {
            console.error('❌ Migration failed:', migrationError.message);
            console.log('🔧 Manual database setup required');
            console.log('Please run the SQL commands from scripts/setup-database.sql');
          }
        } else {
          throw error;
        }
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
    isInitialized = true;
  }).catch(error => {
    console.error('Failed to initialize database:', error);
    db = createMockDatabase();
    isInitialized = true;
  });
} else {
  console.warn('No database connection available. Using mock database.');
  db = createMockDatabase();
  isInitialized = true;
}

// Export a function that ensures database is initialized
export async function getDatabase() {
  if (!isInitialized) {
    // Wait for initialization to complete
    await new Promise(resolve => {
      const checkDb = () => {
        if (isInitialized) {
          resolve();
        } else {
          setTimeout(checkDb, 100);
        }
      };
      checkDb();
    });
  }
  
  return db;
}

// For backward compatibility, export db directly
export { db };
