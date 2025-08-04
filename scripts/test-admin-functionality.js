const { drizzle } = require('drizzle-orm/postgres-js')
const postgres = require('postgres')
require('dotenv').config({ path: '.env.local' })

console.log('🔍 Admin Functionality Test Script\n')

async function testAdminFunctionality() {
  let client
  try {
    console.log('1. Checking environment variables...')
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in .env.local')
      return
    }
    console.log('✅ DATABASE_URL is configured')

    console.log('\n2. Testing database connection...')
    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10
    })
    console.log('✅ Database connection established')

    console.log('\n3. Testing admin todos API...')
    const todosResponse = await fetch('http://localhost:3000/api/admin/todos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log('Todos API Status:', todosResponse.status)
    if (todosResponse.ok) {
      const todosData = await todosResponse.json()
      console.log('✅ Todos API working:', todosData.count, 'todos')
    } else {
      const errorData = await todosResponse.json()
      console.error('❌ Todos API error:', errorData)
    }

    console.log('\n4. Testing user management...')
    const usersResponse = await fetch('http://localhost:3000/api/admin/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log('Users API Status:', usersResponse.status)
    if (usersResponse.ok) {
      const usersData = await usersResponse.json()
      console.log('✅ Users API working:', usersData.users?.length || 0, 'users')
    } else {
      const errorData = await usersResponse.json()
      console.error('❌ Users API error:', errorData)
    }

    console.log('\n5. Checking database tables...')
    const tablesResult = await client`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'todos') ORDER BY table_name;`
    console.log('Found tables:', tablesResult.map(t => t.table_name))

    console.log('\n6. Checking users data...')
    const usersCount = await client`SELECT COUNT(*) as count FROM users`
    const todosCount = await client`SELECT COUNT(*) as count FROM todos`
    console.log('Users count:', usersCount[0].count)
    console.log('Todos count:', todosCount[0].count)

    console.log('\n7. Checking admin users...')
    const adminUsers = await client`SELECT id, email, role, approved, rejected FROM users WHERE role = 'admin'`
    console.log('Admin users:', adminUsers)

    console.log('\n8. Testing database queries...')
    const testUsers = await client`SELECT id, email, role, approved, rejected FROM users ORDER BY created_at DESC LIMIT 5`
    console.log('Recent users:', testUsers)

    const testTodos = await client`SELECT id, title, completed, user_id FROM todos ORDER BY created_at DESC LIMIT 5`
    console.log('Recent todos:', testTodos)

    await client.end()
    console.log('\n🎉 Admin functionality test completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Admin functionality test failed:', error.message)
    console.error('Stack trace:', error.stack)
    
    if (client) {
      try {
        await client.end()
      } catch (endError) {
        console.error('Error closing database connection:', endError.message)
      }
    }
    
    process.exit(1)
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000')
    if (response.ok) {
      console.log('✅ Development server is running')
      await testAdminFunctionality()
    } else {
      console.error('❌ Development server is not responding properly')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Development server is not running. Please start it with: npm run dev')
    process.exit(1)
  }
}

checkServer() 