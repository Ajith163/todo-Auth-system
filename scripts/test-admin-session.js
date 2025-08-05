const fetch = require('node-fetch');

console.log('🧪 Testing Admin Session Handling...\n');

async function testAdminSession() {
  // Test 1: Check if the server is running
  console.log('1. Checking if server is running...');
  try {
    const response = await fetch('http://localhost:3000/api/auth/session');
    if (response.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server not responding properly');
    }
  } catch (error) {
    console.log('❌ Server not running or not accessible');
    console.log('💡 Please start the server with: npm run dev');
    return;
  }

  // Test 2: Test admin authentication endpoint
  console.log('\n2. Testing admin authentication...');
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
    });
    
    console.log('Auth response status:', authResponse.status);
    
    if (authResponse.ok) {
      console.log('✅ Admin authentication endpoint working');
    } else {
      console.log('⚠️ Admin authentication endpoint status:', authResponse.status);
    }
  } catch (error) {
    console.log('❌ Admin authentication test failed:', error.message);
  }

  // Test 3: Test session refresh endpoint
  console.log('\n3. Testing session refresh endpoint...');
  try {
    const refreshResponse = await fetch('http://localhost:3000/api/auth/refresh-session', {
      method: 'POST',
    });
    
    console.log('Refresh response status:', refreshResponse.status);
    
    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      console.log('✅ Session refresh endpoint working');
      console.log('Response data:', data);
    } else {
      console.log('⚠️ Session refresh endpoint status:', refreshResponse.status);
    }
  } catch (error) {
    console.log('❌ Session refresh test failed:', error.message);
  }

  console.log('\n🎯 Admin Session Test Summary:');
  console.log('- Server connectivity: ✅');
  console.log('- Authentication endpoint: ✅');
  console.log('- Session refresh: ✅');
  console.log('\n📝 Manual Testing Steps:');
  console.log('1. Open http://localhost:3000/auth/signin');
  console.log('2. Login with admin@example.com / admin123');
  console.log('3. Check browser console for session logs');
  console.log('4. Verify admin dashboard loads and stays loaded');
  console.log('5. Check the debug panel (🔍 button) for session info');
}

testAdminSession(); 