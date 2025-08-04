const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
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

const schema = { users };

async function testSession() {
  try {
    console.log('Testing user session...');
    
    const connectionString = process.env.DATABASE_URL;
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client, { schema });
    
    // Get all users
    const allUsers = await db.select().from(schema.users);
    console.log('All users:');
    allUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Approved: ${user.approved}`);
    });
    
    // Find approved users
    const approvedUsers = allUsers.filter(user => user.approved);
    console.log(`\nApproved users: ${approvedUsers.length}`);
    
    if (approvedUsers.length > 0) {
      console.log('You can use any of these users to test the todo functionality:');
      approvedUsers.forEach(user => {
        console.log(`- Email: ${user.email}, Role: ${user.role}`);
      });
    }
    
    console.log('\nSession test completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('Session test failed:', error);
    process.exit(1);
  }
}

testSession(); 