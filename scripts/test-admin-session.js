const fetch = require('node-fetch')

console.log('🔐 Testing Admin Session Persistence\n')

async function testAdminSession() {
  try {
    console.log('1. Testing server connection...')
    const response = await fetch('http://localhost:3000')
    console.log('Server status:', response.status)
    
    console.log('\n2. Testing admin login...')
    const loginResponse = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
      }),
    })
    
    console.log('Login status:', loginResponse.status)
    const loginData = await loginResponse.json()
    console.log('Login response:', loginData)
    
    if (loginResponse.ok) {
      console.log('✅ Admin login successful')
      
      console.log('\n3. Testing session endpoint...')
      const sessionResponse = await fetch('http://localhost:3000/api/auth/session')
      console.log('Session status:', sessionResponse.status)
      
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        console.log('Session data:', sessionData)
        
        if (sessionData.user) {
          console.log('✅ Session found:', sessionData.user.email)
          console.log('Role:', sessionData.user.role)
          console.log('Approved:', sessionData.user.approved)
        } else {
          console.log('❌ No user in session')
        }
      }
      
      console.log('\n4. Testing dashboard access...')
      const dashboardResponse = await fetch('http://localhost:3000/dashboard', {
        redirect: 'manual'
      })
      console.log('Dashboard status:', dashboardResponse.status)
      
      if (dashboardResponse.status === 200) {
        console.log('✅ Dashboard accessible')
      } else if (dashboardResponse.status === 302) {
        console.log('❌ Dashboard redirects to login')
        const location = dashboardResponse.headers.get('location')
        console.log('Redirect location:', location)
      } else {
        console.log('⚠️  Dashboard status:', dashboardResponse.status)
      }
      
    } else {
      console.log('❌ Admin login failed')
    }
    
    console.log('\n📝 Manual Testing Steps:')
    console.log('1. Open http://localhost:3000/auth/signin')
    console.log('2. Login with admin@example.com / admin123')
    console.log('3. Check if you stay on dashboard')
    console.log('4. Try refreshing the page')
    console.log('5. Check browser console for session logs')
    
  } catch (error) {
    console.error('❌ Admin session test failed:', error.message)
    console.log('\n💡 Make sure the server is running with: npm run dev')
  }
}

testAdminSession() 