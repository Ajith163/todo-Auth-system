const bcrypt = require('bcryptjs')
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

async function createAdminUser() {
  try {
    const email = process.argv[2]
    const password = process.argv[3]

    if (!email || !password) {
      console.error('Usage: node scripts/create-admin.js <email> <password>')
      process.exit(1)
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    
    if (existingUser.length > 0) {
      console.error('User with this email already exists')
      process.exit(1)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const adminUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      role: 'admin',
      approved: true,
    }).returning()

    console.log('Admin user created successfully!')
    console.log('Email:', adminUser[0].email)
    console.log('Role:', adminUser[0].role)
    console.log('Approved:', adminUser[0].approved)
    
    process.exit(0)
  } catch (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  }
}

createAdminUser() 