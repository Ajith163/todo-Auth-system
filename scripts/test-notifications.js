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

async function testNotifications() {
  try {
    console.log('🧪 Testing Notification Features...\n');
    
    const connectionString = process.env.DATABASE_URL;
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client, { schema });
    
    // Get test users
    const testUsers = await db.select().from(schema.users).where(eq(schema.users.approved, true)).limit(2);
    
    if (testUsers.length < 2) {
      console.log('❌ Need at least 2 approved users for testing');
      return;
    }
    
    const user1 = testUsers[0]; // Regular user
    const user2 = testUsers[1]; // Admin user
    
    console.log('👤 Test Users:');
    console.log(`- User 1: ${user1.email} (${user1.role})`);
    console.log(`- User 2: ${user2.email} (${user2.role})`);
    
    // Test 1: Overdue Notification
    console.log('\n📅 Testing Overdue Notifications...');
    
    // Create a todo with due date in the past
    const overdueTodo = {
      title: 'Test Overdue Todo',
      description: 'This todo is overdue',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      userId: user1.id,
      completed: false,
    };
    
    const overdueResult = await db.insert(schema.todos).values(overdueTodo).returning();
    console.log('✅ Created overdue todo:', overdueResult[0].title);
    
    // Check if it's overdue
    const now = new Date();
    const isOverdue = overdueResult[0].dueDate < now && !overdueResult[0].completed;
    console.log(`⏰ Is overdue: ${isOverdue ? 'YES' : 'NO'}`);
    
    if (isOverdue) {
      console.log('🔔 This should trigger overdue notification in the UI');
    }
    
    // Test 2: Admin Notification on Task Completion
    console.log('\n👑 Testing Admin Notifications...');
    
    // Create a todo for user to complete
    const completableTodo = {
      title: 'Todo to Complete',
      description: 'This todo will be completed to test admin notification',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      userId: user1.id,
      completed: false,
    };
    
    const completableResult = await db.insert(schema.todos).values(completableTodo).returning();
    console.log('✅ Created todo for completion test:', completableResult[0].title);
    
    // Simulate task completion
    const completedTodo = await db.update(schema.todos)
      .set({ completed: true, updatedAt: new Date() })
      .where(eq(schema.todos.id, completableResult[0].id))
      .returning();
    
    console.log('✅ Todo marked as completed');
    console.log('🔔 This should trigger admin notification in the UI');
    console.log(`📧 Admin should see: "User ${user1.email} completed a task!"`);
    
    // Clean up test todos
    await db.delete(schema.todos).where(eq(schema.todos.id, overdueResult[0].id));
    await db.delete(schema.todos).where(eq(schema.todos.id, completedTodo[0].id));
    console.log('\n🧹 Test todos cleaned up');
    
    console.log('\n🎉 Notification Tests Completed!');
    console.log('\n📋 Manual Testing Steps:');
    console.log('1. Open browser and sign in as a user');
    console.log('2. Create a todo with due date in the past');
    console.log('3. Check for red overdue text and toast notifications');
    console.log('4. Open another browser window and sign in as admin');
    console.log('5. Complete a todo as user and watch for admin notifications');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Notification test failed:', error);
    process.exit(1);
  }
}

testNotifications(); 