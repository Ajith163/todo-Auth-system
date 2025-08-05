const fetch = require('node-fetch')

console.log('🔐 Testing Admin Login\n')

async function testAdminLogin() {
  try {
    console.log('1. Testing signin page accessibility...')
    const signinResponse = await fetch('http://localhost:3000/auth/signin')
    
    if (signinResponse.ok) {
      console.log('✅ Signin page is accessible')
    } else {
      console.log('❌ Signin page error:', signinResponse.status)
      return
    }

    console.log('\n2. Testing authentication endpoint...')
    try {
      const authResponse = await fetch('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123',
        }),
      })
      
      console.log('Auth endpoint status:', authResponse.status)
      
      if (authResponse.ok) {
        console.log('✅ Authentication endpoint working')
      } else {
        console.log('⚠️  Authentication endpoint status:', authResponse.status)
      }
    } catch (error) {
      console.log('❌ Authentication endpoint error:', error.message)
    }

    console.log('\n3. Testing session endpoint...')
    try {
      const sessionResponse = await fetch('http://localhost:3000/api/auth/session')
      console.log('Session endpoint status:', sessionResponse.status)
      
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        console.log('Session data:', sessionData)
      }
    } catch (error) {
      console.log('❌ Session endpoint error:', error.message)
    }

    console.log('\n4. Testing dashboard redirect...')
    try {
      const dashboardResponse = await fetch('http://localhost:3000/dashboard', {
        redirect: 'manual'
      })
      console.log('Dashboard redirect status:', dashboardResponse.status)
      
      if (dashboardResponse.status === 302) {
        console.log('✅ Dashboard properly redirects to signin')
      } else if (dashboardResponse.status === 200) {
        console.log('⚠️  Dashboard accessible (user might be logged in)')
      } else {
        console.log('⚠️  Dashboard status:', dashboardResponse.status)
      }
    } catch (error) {
      console.log('❌ Dashboard error:', error.message)
    }

    console.log('\n🎉 Admin login test completed!')
    console.log('\n📝 Manual testing steps:')
    console.log('1. Open http://localhost:3000/auth/signin')
    console.log('2. Enter email: admin@example.com')
    console.log('3. Enter password: admin123')
    console.log('4. Click Sign In')
    console.log('5. Check if you\'re redirected to dashboard')
    console.log('\n🔧 If login fails, check browser console for errors')

  } catch (error) {
    console.error('❌ Admin login test failed:', error.message)
    console.log('\n💡 Make sure the server is running with: npm run dev')
  }
}

testAdminLogin() 