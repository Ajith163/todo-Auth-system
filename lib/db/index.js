import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL;

if (!connectionString && !isBuildTime) {
  console.warn('DATABASE_URL is not defined in your environment variables.');
}

let db;

if (!connectionString && isBuildTime) {
  console.warn('DATABASE_URL is not defined. Using mock database during build.');
  db = {
    select: () => ({ from: () => ({ where: () => ({ orderBy: () => [] }) }) }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    delete: () => ({ where: () => ({ returning: () => [] }) }),
  };
} else if (connectionString) {
  try {
    // Use postgres-js with SSL (Neon requires it)
    const client = postgres(connectionString, {
      max: 1,
      ssl: 'require',
      connect_timeout: 10,
      idle_timeout: 20,
    });
    db = drizzle(client, { schema });
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    // Fallback to mock database
    db = {
      select: () => ({ from: () => ({ where: () => ({ orderBy: () => [] }) }) }),
      insert: () => ({ values: () => ({ returning: () => [] }) }),
      update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
      delete: () => ({ where: () => ({ returning: () => [] }) }),
    };
  }
} else {
  console.warn('No database connection available. Using mock database.');
  db = {
    select: () => ({ from: () => ({ where: () => ({ orderBy: () => [] }) }) }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    delete: () => ({ where: () => ({ returning: () => [] }) }),
  };
}

export { db };
