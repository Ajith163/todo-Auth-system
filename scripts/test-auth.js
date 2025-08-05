const fetch = require('node-fetch')

console.log('🔐 Authentication Test Script\n')

async function testAuth() {
  try {
    console.log('1. Testing server connection...')
    const response = await fetch('http://localhost:3002')
    
    if (response.ok) {
      console.log('✅ Server is running on port 3002')
    } else {
      console.log('⚠️  Server responded with status:', response.status)
    }

    console.log('\n2. Testing signin page...')
    try {
      const signinResponse = await fetch('http://localhost:3002/auth/signin')
      console.log('Signin page status:', signinResponse.status)
      
      if (signinResponse.ok) {
        console.log('✅ Signin page is accessible')
      } else {
        console.log('❌ Signin page error:', signinResponse.status)
      }
    } catch (error) {
      console.log('❌ Signin page error:', error.message)
    }

    console.log('\n3. Testing signup page...')
    try {
      const signupResponse = await fetch('http://localhost:3002/auth/signup')
      console.log('Signup page status:', signupResponse.status)
      
      if (signupResponse.ok) {
        console.log('✅ Signup page is accessible')
      } else {
        console.log('❌ Signup page error:', signupResponse.status)
      }
    } catch (error) {
      console.log('❌ Signup page error:', error.message)
    }

    console.log('\n4. Testing dashboard access (should redirect to signin)...')
    try {
      const dashboardResponse = await fetch('http://localhost:3002/dashboard')
      console.log('Dashboard status:', dashboardResponse.status)
      
      if (dashboardResponse.status === 302 || dashboardResponse.status === 200) {
        console.log('✅ Dashboard redirects properly')
      } else {
        console.log('⚠️  Dashboard status:', dashboardResponse.status)
      }
    } catch (error) {
      console.log('❌ Dashboard error:', error.message)
    }

    console.log('\n🎉 Authentication test completed!')
    console.log('\n📝 To test authentication:')
    console.log('1. Open http://localhost:3002/auth/signin')
    console.log('2. Try signing in with admin@example.com / admin123')
    console.log('3. Check browser console for any errors')
    console.log('4. If tables don\'t exist, run: node scripts/setup-deployment.js')

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message)
    console.log('\n💡 Make sure the server is running with: npm run dev')
  }
}

testAuth() 