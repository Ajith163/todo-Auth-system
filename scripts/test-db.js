const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv/config');

// Inline schema definition for testing
const { pgTable, serial, text, boolean, timestamp, integer, eq } = require('drizzle-orm/pg-core');

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

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined');
    }
    
    console.log('Connection string found');
    
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client, { schema });
    
    console.log('Database client created');
    
    // Test fetching users
    console.log('Testing user fetch...');
    const users = await db.select().from(schema.users).limit(1);
    console.log('Users found:', users.length);
    
    if (users.length > 0) {
      const userId = users[0].id;
      console.log('Testing todo creation for user:', userId);
      
      // Test creating a todo
      const newTodo = await db.insert(schema.todos).values({
        title: 'Test Todo',
        description: 'Test Description',
        dueDate: new Date(),
        userId: userId,
        completed: false,
      }).returning();
      
      console.log('Todo created successfully:', newTodo[0]);
      
      // Clean up - delete the test todo
      const { eq } = require('drizzle-orm');
      await db.delete(schema.todos).where(eq(schema.todos.id, newTodo[0].id));
      console.log('Test todo cleaned up');
    }
    
    console.log('Database test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Database test failed:', error);
    process.exit(1);
  }
}

testDatabase(); 