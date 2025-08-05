const fetch = require('node-fetch')

console.log('🔐 Testing User Approval Flow\n')

async function testUserApproval() {
  try {
    console.log('1. Testing server connection...')
    const response = await fetch('http://localhost:3000')
    console.log('Server status:', response.status)
    
    console.log('\n2. Testing new user signup...')
    const signupResponse = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'TestPass123!',
      }),
    })
    
    console.log('Signup status:', signupResponse.status)
    const signupData = await signupResponse.json()
    console.log('Signup response:', signupData)
    
    if (signupResponse.ok) {
      console.log('✅ User created successfully')
      
      console.log('\n3. Testing login with unapproved user...')
      const loginResponse = await fetch('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'TestPass123!',
        }),
      })
      
      console.log('Login status:', loginResponse.status)
      const loginData = await loginResponse.json()
      console.log('Login response:', loginData)
      
      if (loginResponse.ok) {
        console.log('❌ User was able to login without approval (this should not happen)')
      } else {
        console.log('✅ User correctly blocked from login (not approved)')
      }
      
      console.log('\n4. Testing admin login to approve user...')
      const adminLoginResponse = await fetch('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'admin123',
        }),
      })
      
      console.log('Admin login status:', adminLoginResponse.status)
      
      if (adminLoginResponse.ok) {
        console.log('✅ Admin login successful')
        
        console.log('\n5. Testing user approval via admin API...')
        // This would require the admin to manually approve the user
        console.log('📝 Manual step: Admin needs to approve user in dashboard')
        console.log('   - Go to admin dashboard')
        console.log('   - Find testuser@example.com in pending users')
        console.log('   - Click "Approve" button')
        
        console.log('\n6. Testing approved user login...')
        console.log('📝 Manual step: After approval, try logging in with testuser@example.com')
        
      } else {
        console.log('❌ Admin login failed')
      }
      
    } else {
      console.log('❌ User creation failed')
    }
    
    console.log('\n📝 Manual Testing Steps:')
    console.log('1. Go to http://localhost:3000/auth/signup')
    console.log('2. Create a new user account')
    console.log('3. Try to login - should be blocked')
    console.log('4. Login as admin and approve the user')
    console.log('5. Try logging in again - should work')
    
  } catch (error) {
    console.error('❌ User approval test failed:', error.message)
    console.log('\n💡 Make sure the server is running with: npm run dev')
  }
}

testUserApproval() 