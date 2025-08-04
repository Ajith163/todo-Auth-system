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

const schema = { users };

async function checkUserPassword() {
  try {
    console.log('🔍 Checking user password for test@gmail.com...\n');
    
    const connectionString = process.env.DATABASE_URL;
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client, { schema });
    
    // Check if test@gmail.com exists
    const user = await db.select().from(schema.users).where(eq(schema.users.email, 'test@gmail.com'));
    
    if (user.length === 0) {
      console.log('❌ User test@gmail.com does not exist in the database.');
      console.log('\n📋 Available users:');
      const allUsers = await db.select().from(schema.users);
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.role}, ${u.approved ? 'Approved' : 'Pending'})`);
      });
      
      console.log('\n💡 To create test@gmail.com, you can:');
      console.log('1. Sign up at http://localhost:3001/auth/signup');
      console.log('2. Use email: test@gmail.com');
      console.log('3. Use any password you want');
      console.log('4. Then approve the user as admin');
      
    } else {
      const userData = user[0];
      console.log('✅ User found!');
      console.log(`📧 Email: ${userData.email}`);
      console.log(`🔑 Password: ${userData.password}`);
      console.log(`👤 Role: ${userData.role}`);
      console.log(`✅ Approved: ${userData.approved ? 'Yes' : 'No'}`);
      console.log(`📅 Created: ${userData.createdAt}`);
      
      console.log('\n🔐 Login Credentials:');
      console.log(`Email: ${userData.email}`);
      console.log(`Password: ${userData.password}`);
      
      if (!userData.approved) {
        console.log('\n⚠️  User is not approved yet. You need to approve them as admin first.');
      }
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error checking user password:', error);
    process.exit(1);
  }
}

checkUserPassword(); 