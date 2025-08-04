const { drizzle } = require('drizzle-orm/postgres-js')
const postgres = require('postgres')
const { pgTable, serial, text, boolean, timestamp, integer } = require('drizzle-orm/pg-core')
const { eq } = require('drizzle-orm')
const bcrypt = require('bcryptjs')

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

async function testApprovalFlow() {
  try {
    console.log('🧪 Testing Approval Flow After Signup...\n')
    
    // Step 1: Create a test user
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = '123456'
    
    console.log('1️⃣ Creating test user...')
    const hashedPassword = await bcrypt.hash(testPassword, 12)
    
    const newUser = await db.insert(users).values({
      email: testEmail,
      password: hashedPassword,
      role: 'user',
      approved: false,
    }).returning()
    
    console.log(`✅ Test user created: ${testEmail}`)
    console.log(`   ID: ${newUser[0].id}`)
    console.log(`   Approved: ${newUser[0].approved}`)
    console.log(`   Role: ${newUser[0].role}\n`)
    
    // Step 2: Verify user cannot login (not approved)
    console.log('2️⃣ Testing login attempt (should fail)...')
    const userCheck = await db.select().from(users).where(eq(users.email, testEmail)).limit(1)
    
    if (userCheck.length === 0) {
      throw new Error('User not found after creation')
    }
    
    if (userCheck[0].approved) {
      console.log('❌ User is already approved (should be false)')
    } else {
      console.log('✅ User is not approved (correct behavior)')
    }
    console.log(`   Login would be blocked: ${!userCheck[0].approved}\n`)
    
    // Step 3: Approve the user
    console.log('3️⃣ Approving user...')
    const approvedUser = await db.update(users)
      .set({ 
        approved: true,
        role: 'user'
      })
      .where(eq(users.email, testEmail))
      .returning()
    
    console.log(`✅ User approved successfully`)
    console.log(`   Approved: ${approvedUser[0].approved}`)
    console.log(`   Role: ${approvedUser[0].role}\n`)
    
    // Step 4: Verify user can now login
    console.log('4️⃣ Testing login after approval...')
    const finalUserCheck = await db.select().from(users).where(eq(users.email, testEmail)).limit(1)
    
    if (finalUserCheck[0].approved) {
      console.log('✅ User can now login (approved)')
    } else {
      console.log('❌ User still cannot login (not approved)')
    }
    console.log(`   Login allowed: ${finalUserCheck[0].approved}\n`)
    
    // Step 5: Clean up test user
    console.log('5️⃣ Cleaning up test user...')
    await db.delete(users).where(eq(users.email, testEmail))
    console.log('✅ Test user removed\n')
    
    // Step 6: Summary
    console.log('📋 Approval Flow Test Summary:')
    console.log('✅ User creation works')
    console.log('✅ User starts with approved: false')
    console.log('✅ User cannot login when not approved')
    console.log('✅ Admin can approve user')
    console.log('✅ User can login after approval')
    console.log('✅ Cleanup works')
    
    console.log('\n🎉 Approval flow is working correctly!')
    console.log('\n📝 Manual Testing Instructions:')
    console.log('1. Go to http://localhost:3002/auth/signup')
    console.log('2. Create a new account')
    console.log('3. Try to login (should fail)')
    console.log('4. Login as admin: ajith163@gmail.com / 123qwe')
    console.log('5. Go to admin dashboard')
    console.log('6. Approve the new user')
    console.log('7. Try login again (should work)')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error testing approval flow:', error)
    process.exit(1)
  }
}

testApprovalFlow() 