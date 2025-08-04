import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema.js';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL;

if (!connectionString && !isBuildTime) {
  // DATABASE_URL not defined
}

let db;
let isInitialized = false;

async function createTablesIfNotExist(client) {
  try {
    
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
    
    return true;
  } catch (error) {
    return false;
  }
}

async function initializeDatabase() {
  if (!connectionString) {
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
    
    // Database connection established
    
    // Always try to create tables first
    const tablesCreated = await createTablesIfNotExist(client);
    
    if (tablesCreated) {
      // Database schema verified
    } else {
      // Fallback: Try to check if tables exist
      try {
        await dbInstance.select().from(schema.users).limit(1);
        // Database tables exist
      } catch (error) {
        if (error.code === '42P01') {
          // Tables do not exist, trying migrations...
          try {
            await migrate(dbInstance, { migrationsFolder: './lib/db/migrations' });
            // Database migrations completed
          } catch (migrationError) {
            // Migration failed, manual setup required
          }
        } else {
          throw error;
        }
      }
    }
    
    return dbInstance;
    
  } catch (error) {
    // Database initialization failed
    
    // Fallback to mock database
    return createMockDatabase();
  }
}

function createMockDatabase() {
  return {
    select: () => ({ from: () => ({ where: () => ({ orderBy: () => [] }) }) }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    delete: () => ({ where: () => ({ returning: () => [] }) }),
  };
}

// Initialize database connection
if (!connectionString && isBuildTime) {
  db = createMockDatabase();
} else if (connectionString) {
  // Initialize database asynchronously
  initializeDatabase().then(database => {
    db = database;
    isInitialized = true;
  }).catch(error => {
    db = createMockDatabase();
    isInitialized = true;
  });
} else {
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
  
  // Ensure db is not undefined
  if (!db) {
    return createMockDatabase();
  }
  
  return db;
}

// For backward compatibility, export db directly
export { db };
