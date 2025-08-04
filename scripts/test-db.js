const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv/config');

// Inline schema definition for testing
const { pgTable, serial, text, boolean, timestamp, integer } = require('drizzle-orm/pg-core');

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'),
  approved: boolean('approved').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  completed: boolean('completed').notNull().default(false),
  dueDate: timestamp('due_date'),
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

const schema = { users, todos };

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    
    console.log('📡 Connection string found');
    
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client, { schema });
    
    console.log('🔌 Database client created');
    
    // Test basic connection
    const result = await db.select().from(schema.users).limit(1);
    console.log('✅ Database connection successful');
    console.log('📊 Users table accessible');
    
    // Test todos table
    const todosResult = await db.select().from(schema.todos).limit(1);
    console.log('✅ Todos table accessible');
    
    console.log('\n🎉 Database is working correctly!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: PostgreSQL server is not running or not accessible');
      console.log('1. Start PostgreSQL service');
      console.log('2. Check if port 5432 is open');
      console.log('3. Verify database credentials');
    } else if (error.code === '28P01') {
      console.log('\n💡 Solution: Authentication failed');
      console.log('1. Check username/password in DATABASE_URL');
      console.log('2. Verify user exists in PostgreSQL');
    } else if (error.code === '3D000') {
      console.log('\n💡 Solution: Database does not exist');
      console.log('1. Create database: postgress_test');
      console.log('2. Run: createdb postgress_test');
    } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('\n💡 Solution: Database tables do not exist');
      console.log('1. Run database migrations');
      console.log('2. Execute: npm run db:push');
    }
    
    console.log('\n🔧 Quick fixes:');
    console.log('1. Check if PostgreSQL is running');
    console.log('2. Verify DATABASE_URL in .env file');
    console.log('3. Create database if it doesn\'t exist');
    console.log('4. Run migrations: npm run db:push');
  }
}

testDatabaseConnection(); 