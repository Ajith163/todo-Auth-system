const fetch = require('node-fetch')

console.log('🔐 Testing Session Management\n')

async function testSession() {
  try {
    console.log('1. Testing session endpoint...')
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session')
    
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json()
      console.log('Session data:', sessionData)
      
      if (sessionData.user) {
        console.log('✅ User is logged in:', sessionData.user.email)
      } else {
        console.log('❌ No user session found')
      }
    } else {
      console.log('❌ Session endpoint error:', sessionResponse.status)
    }

    console.log('\n2. Testing dashboard access...')
    const dashboardResponse = await fetch('http://localhost:3000/dashboard', {
      redirect: 'manual'
    })
    
    console.log('Dashboard status:', dashboardResponse.status)
    
    if (dashboardResponse.status === 200) {
      console.log('✅ Dashboard accessible (user logged in)')
    } else if (dashboardResponse.status === 302) {
      console.log('❌ Dashboard redirects to login (user not logged in)')
    } else {
      console.log('⚠️  Dashboard status:', dashboardResponse.status)
    }

    console.log('\n3. Testing signin page...')
    const signinResponse = await fetch('http://localhost:3000/auth/signin')
    console.log('Signin page status:', signinResponse.status)

    console.log('\n📝 Manual Testing Steps:')
    console.log('1. Open http://localhost:3000/auth/signin')
    console.log('2. Login with admin@example.com / admin123')
    console.log('3. Check if you stay on dashboard')
    console.log('4. Check browser console for session logs')
    console.log('5. Try refreshing the page')

  } catch (error) {
    console.error('❌ Session test failed:', error.message)
  }
}

testSession() 