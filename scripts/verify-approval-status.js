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

async function verifyApprovalStatus() {
  try {
    console.log('🔍 Verifying Approval System Status...\n')
    
    // Get all users
    const allUsers = await db.select().from(users)
    
    console.log(`📊 Total Users: ${allUsers.length}`)
    
    const approvedUsers = allUsers.filter(user => user.approved)
    const pendingUsers = allUsers.filter(user => !user.approved)
    const adminUsers = allUsers.filter(user => user.role === 'admin')
    const regularUsers = allUsers.filter(user => user.role === 'user')
    
    console.log(`✅ Approved Users: ${approvedUsers.length}`)
    console.log(`⏳ Pending Users: ${pendingUsers.length}`)
    console.log(`👑 Admin Users: ${adminUsers.length}`)
    console.log(`👤 Regular Users: ${regularUsers.length}\n`)
    
    // Show approved users
    if (approvedUsers.length > 0) {
      console.log('✅ APPROVED USERS:')
      approvedUsers.forEach(user => {
        console.log(`   • ${user.email} (${user.role}) - Created: ${user.createdAt}`)
      })
      console.log()
    }
    
    // Show pending users
    if (pendingUsers.length > 0) {
      console.log('⏳ PENDING APPROVAL:')
      pendingUsers.forEach(user => {
        console.log(`   • ${user.email} (${user.role}) - Created: ${user.createdAt}`)
      })
      console.log()
    }
    
    // Show admin users
    if (adminUsers.length > 0) {
      console.log('👑 ADMIN USERS:')
      adminUsers.forEach(user => {
        console.log(`   • ${user.email} (${user.role}) - Approved: ${user.approved}`)
      })
      console.log()
    }
    
    // Approval flow verification
    console.log('🔍 APPROVAL FLOW VERIFICATION:')
    
    // Check if there are any pending users
    if (pendingUsers.length > 0) {
      console.log('✅ Pending users found - Admin can approve them')
      console.log('📝 Next steps:')
      console.log('   1. Login as admin: ajith163@gmail.com / 123qwe')
      console.log('   2. Go to admin dashboard')
      console.log('   3. Click "Approve" for pending users')
    } else {
      console.log('✅ No pending users - All users are approved')
    }
    
    // Check if there are approved users
    if (approvedUsers.length > 0) {
      console.log('✅ Approved users found - They can login')
    }
    
    // Check if there are admin users
    if (adminUsers.length > 0) {
      console.log('✅ Admin users found - They can manage approvals')
    }
    
    console.log('\n📋 SYSTEM STATUS:')
    console.log(`   Database: ${connectionString ? '✅ Connected' : '❌ Not connected'}`)
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`   Server: http://localhost:3002`)
    
    console.log('\n🎯 QUICK ACTIONS:')
    console.log('   • npm run check-user <email> - Check specific user')
    console.log('   • npm run approve-user <email> - Approve user')
    console.log('   • npm run test-approval - Test approval flow')
    console.log('   • npm run test-signout - Test signout functionality')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error verifying approval status:', error)
    process.exit(1)
  }
}

verifyApprovalStatus() 