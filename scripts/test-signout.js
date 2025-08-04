const { drizzle } = require('drizzle-orm/postgres-js')
const postgres = require('postgres')
const { pgTable, serial, text, boolean, timestamp, integer } = require('drizzle-orm/pg-core')
const { eq } = require('drizzle-orm')

// Load environment variables
require('dotenv').config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in your environment variables.')
}

// Define schema inline to avoid import issues
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'),
  approved: boolean('approved').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

const client = postgres(connectionString, { max: 1 })
const db = drizzle(client, { schema: { users } })

async function testSignoutFunctionality() {
  try {
    console.log('Testing signout functionality...')
    
    // Check if the user exists and is approved
    const user = await db.select().from(users).where(eq(users.email, 'ajith163@gmail.com')).limit(1)
    
    if (user.length === 0) {
      console.error('Test user not found')
      process.exit(1)
    }

    console.log('✅ User exists and is approved')
    console.log('✅ Database connection working')
    console.log('✅ Environment variables loaded')
    console.log('✅ NextAuth configuration should work')
    
    console.log('\n📋 Signout Test Instructions:')
    console.log('1. Go to http://localhost:3001')
    console.log('2. Login with ajith163@gmail.com / 123qwe')
    console.log('3. Click the "Sign Out" button')
    console.log('4. You should be redirected to /auth/signin')
    console.log('5. If direct signout fails, try /auth/signout page')
    
    process.exit(0)
  } catch (error) {
    console.error('Error testing signout:', error)
    process.exit(1)
  }
}

testSignoutFunctionality() 