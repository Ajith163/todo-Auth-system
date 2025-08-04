const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const bcrypt = require('bcryptjs');
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

const schema = { users };

async function setUserPassword() {
  try {
    console.log('🔧 Setting password for test@gmail.com...\n');
    
    const connectionString = process.env.DATABASE_URL;
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client, { schema });
    
    // Check if test@gmail.com exists
    const user = await db.select().from(schema.users).where(eq(schema.users.email, 'test@gmail.com'));
    
    if (user.length === 0) {
      console.log('❌ User test@gmail.com does not exist.');
      console.log('💡 Please create the user first by signing up.');
      process.exit(1);
    }
    
    // Set a simple password
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update the user's password
    await db.update(schema.users)
      .set({ password: hashedPassword })
      .where(eq(schema.users.email, 'test@gmail.com'));
    
    console.log('✅ Password updated successfully!');
    console.log('\n🔐 New Login Credentials:');
    console.log(`Email: test@gmail.com`);
    console.log(`Password: ${newPassword}`);
    console.log(`Role: ${user[0].role}`);
    console.log(`Approved: ${user[0].approved ? 'Yes' : 'No'}`);
    
    console.log('\n🌐 You can now login at:');
    console.log('http://localhost:3001/auth/signin');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting password:', error);
    process.exit(1);
  }
}

setUserPassword(); 