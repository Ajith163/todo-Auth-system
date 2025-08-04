const fetch = require('node-fetch')

console.log('🔍 Quick Test Script\n')

async function quickTest() {
  try {
    console.log('1. Testing server connection...')
    const response = await fetch('http://localhost:3000')
    
    if (response.ok) {
      console.log('✅ Server is running')
    } else {
      console.log('⚠️  Server responded with status:', response.status)
    }

    console.log('\n2. Testing session endpoint...')
    try {
      const sessionResponse = await fetch('http://localhost:3000/api/auth/refresh-session', {
        method: 'POST',
      })
      console.log('Session endpoint status:', sessionResponse.status)
    } catch (error) {
      console.log('❌ Session endpoint error:', error.message)
    }

    console.log('\n3. Testing admin todos endpoint...')
    try {
      const todosResponse = await fetch('http://localhost:3000/api/admin/todos')
      console.log('Admin todos endpoint status:', todosResponse.status)
    } catch (error) {
      console.log('❌ Admin todos endpoint error:', error.message)
    }

    console.log('\n4. Testing database connection...')
    try {
      const dbResponse = await fetch('http://localhost:3000/api/test-database')
      console.log('Database test status:', dbResponse.status)
    } catch (error) {
      console.log('❌ Database test error:', error.message)
    }

    console.log('\n🎉 Quick test completed!')
    console.log('\n📝 Next steps:')
    console.log('1. Open http://localhost:3000 in your browser')
    console.log('2. Sign in with admin account (admin@example.com / admin123)')
    console.log('3. Check browser console for detailed logs')
    console.log('4. Try switching between admin and user views')

  } catch (error) {
    console.error('❌ Quick test failed:', error.message)
    console.log('\n💡 Make sure the server is running with: npm run dev')
  }
}

quickTest() 