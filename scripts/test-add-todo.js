const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { eq } = require('drizzle-orm');
require('dotenv/config');

// Inline schema definition
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

async function testAddTodo() {
  try {
    console.log('Testing add todo functionality...');
    
    const connectionString = process.env.DATABASE_URL;
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client, { schema });
    
    // Get an approved user
    const users = await db.select().from(schema.users).where(eq(schema.users.approved, true)).limit(1);
    
    if (users.length === 0) {
      console.log('No approved users found');
      return;
    }
    
    const userId = users[0].id;
    console.log('Using user ID:', userId);
    
    // Test creating a todo with due date
    const testTodo = {
      title: 'Test Todo with Due Date',
      description: 'This is a test todo with a due date',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      userId: userId,
      completed: false,
    };
    
    console.log('Creating todo:', testTodo);
    
    const newTodo = await db.insert(schema.todos).values(testTodo).returning();
    console.log('✅ Todo created successfully:', newTodo[0]);
    
    // Clean up
    await db.delete(schema.todos).where(eq(schema.todos.id, newTodo[0].id));
    console.log('Test todo cleaned up');
    
    console.log('\n🎉 Add todo functionality is working!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Add todo test failed:', error);
    process.exit(1);
  }
}

testAddTodo(); 