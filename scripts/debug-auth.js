const fetch = require('node-fetch')

console.log('🔍 Debugging Authentication Flow\n')

async function debugAuth() {
  try {
    console.log('1. Testing direct admin authentication...')
    
    // Test the special case admin authentication
    const adminAuthResponse = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
      }),
    })
    
    console.log('Admin auth status:', adminAuthResponse.status)
    const adminAuthData = await adminAuthResponse.json()
    console.log('Admin auth response:', adminAuthData)
    
    console.log('\n2. Testing session after admin login...')
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session')
    console.log('Session status:', sessionResponse.status)
    
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json()
      console.log('Session data:', sessionData)
    }
    
    console.log('\n3. Testing regular user authentication...')
    const userAuthResponse = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'TestPass123!',
      }),
    })
    
    console.log('User auth status:', userAuthResponse.status)
    const userAuthData = await userAuthResponse.json()
    console.log('User auth response:', userAuthData)
    
    console.log('\n4. Testing NextAuth configuration...')
    const nextAuthResponse = await fetch('http://localhost:3000/api/auth/providers')
    console.log('NextAuth providers status:', nextAuthResponse.status)
    
    if (nextAuthResponse.ok) {
      const providersData = await nextAuthResponse.json()
      console.log('Providers data:', providersData)
    }
    
    console.log('\n📝 Browser Testing Steps:')
    console.log('1. Open browser console')
    console.log('2. Go to http://localhost:3000/auth/signin')
    console.log('3. Try logging in with admin@example.com / admin123')
    console.log('4. Check console for any errors')
    console.log('5. Check Network tab for API calls')
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message)
  }
}

debugAuth() 