const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const { eq } = require('drizzle-orm');
require('dotenv/config');

// Inline schema for testing
const { pgTable, serial, text, boolean, timestamp } = require('drizzle-orm/pg-core');

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'),
  approved: boolean('approved').notNull().default(false),
  rejected: boolean('rejected').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

async function testUserCreation() {
  try {
    console.log('🧪 Testing User Creation...\n');
    
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined');
    }
    
    console.log('1. Connecting to database...');
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client, { schema: { users } });
    console.log('✅ Database connected\n');
    
    console.log('2. Testing user insertion...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    console.log('✅ Password hashed\n');
    
    // Insert test user
    const newUser = await db.insert(users).values({
      email: testEmail,
      password: hashedPassword,
      role: 'user',
      approved: false,
    }).returning();
    
    console.log('✅ User created successfully!');
    console.log('   Email:', newUser[0].email);
    console.log('   ID:', newUser[0].id);
    console.log('   Role:', newUser[0].role);
    console.log('   Approved:', newUser[0].approved);
    
    // Clean up - delete test user
    await db.delete(users).where(eq(users.id, newUser[0].id));
    console.log('✅ Test user cleaned up\n');
    
    console.log('🎉 User creation test passed!');
    console.log('   The database operations are working correctly.');
    console.log('   The issue might be in the API route or validation.');
    
  } catch (error) {
    console.error('❌ User creation test failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === '23505') {
      console.log('\n💡 Solution: Email already exists');
      console.log('   Try with a different email address');
    } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('\n💡 Solution: Database tables do not exist');
      console.log('   Run: npm run db:push');
    } else if (error.message.includes('connection')) {
      console.log('\n💡 Solution: Database connection failed');
      console.log('   Check DATABASE_URL in .env file');
    } else {
      console.log('\n💡 Solution: Check the specific error above');
      console.log('   This will help identify the exact issue');
    }
  }
}

testUserCreation(); 