const postgres = require('postgres')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

console.log('🔧 Fixing Admin Authentication\n')

async function fixAdminAuth() {
  let client
  try {
    console.log('1. Connecting to database...')
    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      connect_timeout: 10,
      idle_timeout: 20,
    })
    
    await client`SELECT 1`
    console.log('✅ Database connection successful')
    
    console.log('\n2. Checking admin user...')
    const adminUser = await client`
      SELECT id, email, password, role, approved FROM users WHERE email = 'admin@example.com'
    `
    
    if (adminUser.length === 0) {
      console.log('❌ Admin user not found, creating...')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      await client`
        INSERT INTO users (email, password, role, approved, created_at)
        VALUES ('admin@example.com', ${hashedPassword}, 'admin', true, NOW())
      `
      console.log('✅ Admin user created')
    } else {
      console.log('✅ Admin user found:', {
        id: adminUser[0].id,
        email: adminUser[0].email,
        role: adminUser[0].role,
        approved: adminUser[0].approved
      })
      
      console.log('\n3. Testing password hash...')
      const testPassword = 'admin123'
      const isPasswordValid = await bcrypt.compare(testPassword, adminUser[0].password)
      
      if (!isPasswordValid) {
        console.log('❌ Password hash is invalid, updating...')
        const newHashedPassword = await bcrypt.hash('admin123', 12)
        
        await client`
          UPDATE users 
          SET password = ${newHashedPassword}
          WHERE email = 'admin@example.com'
        `
        console.log('✅ Password updated successfully')
      } else {
        console.log('✅ Password hash is valid')
      }
    }
    
    console.log('\n4. Final verification...')
    const finalCheck = await client`
      SELECT id, email, role, approved FROM users WHERE email = 'admin@example.com'
    `
    
    if (finalCheck.length > 0) {
      console.log('✅ Admin user verified:', {
        id: finalCheck[0].id,
        email: finalCheck[0].email,
        role: finalCheck[0].role,
        approved: finalCheck[0].approved
      })
      
      // Test password one more time
      const testUser = await client`
        SELECT password FROM users WHERE email = 'admin@example.com'
      `
      const finalPasswordTest = await bcrypt.compare('admin123', testUser[0].password)
      
      if (finalPasswordTest) {
        console.log('✅ Password authentication working correctly')
      } else {
        console.log('❌ Password authentication still failing')
      }
    }
    
    console.log('\n🎉 Admin authentication fix completed!')
    console.log('\n📝 Login credentials:')
    console.log('   Email: admin@example.com')
    console.log('   Password: admin123')
    console.log('\n💡 Try logging in now at: http://localhost:3000/auth/signin')
    
  } catch (error) {
    console.error('\n❌ Admin auth fix failed:', error.message)
  } finally {
    if (client) {
      await client.end()
    }
  }
}

fixAdminAuth() 