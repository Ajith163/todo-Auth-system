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

async function checkAndFixUser() {
  try {
    const email = process.argv[2]

    if (!email) {
      console.error('Usage: node scripts/check-and-fix-user.js <email>')
      process.exit(1)
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    
    if (existingUser.length === 0) {
      console.error('User with this email does not exist')
      process.exit(1)
    }

    const user = existingUser[0]
    console.log('Current user status:')
    console.log('Email:', user.email)
    console.log('Role:', user.role)
    console.log('Approved:', user.approved)

    // If user is not approved, approve them
    if (!user.approved) {
      console.log('\nUser is not approved. Approving now...')
      
      const updatedUser = await db.update(users)
        .set({ 
          approved: true,
          role: 'admin' // Also make them admin
        })
        .where(eq(users.email, email))
        .returning()

      console.log('User approved successfully!')
      console.log('Email:', updatedUser[0].email)
      console.log('Role:', updatedUser[0].role)
      console.log('Approved:', updatedUser[0].approved)
    } else {
      console.log('\nUser is already approved!')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('Error checking/fixing user:', error)
    process.exit(1)
  }
}

checkAndFixUser() 