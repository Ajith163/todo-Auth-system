const { execSync } = require('child_process');

console.log('🔍 Authentication Debug Script\n');

console.log('❌ Current Issue:');
console.log('   - CredentialsSignin error in production');
console.log('   - Authentication failing on Vercel deployment');
console.log('   - Likely missing admin user or database issues\n');

console.log('✅ Debug Steps:\n');

console.log('1. 🗄️  Check Production Database:');
console.log('   - Verify DATABASE_URL is set in Vercel');
console.log('   - Ensure tables exist in production database');
console.log('   - Check if admin user exists\n');

console.log('2. 👤 Create Admin User in Production:');
console.log('   # Option A: Use Vercel CLI');
console.log('   vercel env pull .env.production');
console.log('   node scripts/create-admin.js admin@example.com admin123\n');

console.log('   # Option B: Direct Database Access');
console.log('   -- Connect to your production database');
console.log('   -- Run: INSERT INTO users (email, password, role, approved) VALUES (\'admin@example.com\', \'$2a$10$...\', \'admin\', true);\n');

console.log('3. 🔧 Test Authentication Locally:');
console.log('   # Test with local database:');
console.log('   npm run dev');
console.log('   # Try login with: admin@example.com / admin123\n');

console.log('4. 🌐 Test Production Authentication:');
console.log('   - Go to: https://todo-auth-system.vercel.app/auth/signin');
console.log('   - Try login with: admin@example.com / admin123');
console.log('   - Check browser console for errors\n');

console.log('5. 🔍 Common Issues & Solutions:\n');

console.log('   Issue: "relation users does not exist"');
console.log('   Solution: Run migrations on production database');
console.log('   Command: npm run db:push\n');

console.log('   Issue: "Invalid credentials"');
console.log('   Solution: Create admin user in production');
console.log('   Command: node scripts/create-admin.js admin@example.com admin123\n');

console.log('   Issue: "Database connection failed"');
console.log('   Solution: Check DATABASE_URL in Vercel environment variables\n');

console.log('💡 Quick Fix Commands:\n');
console.log('   # 1. Set up production database:');
console.log('   # Go to Vercel Dashboard → Storage → Create Postgres\n');

console.log('   # 2. Set environment variables:');
console.log('   DATABASE_URL=your_production_db_url');
console.log('   NEXTAUTH_URL=https://todo-auth-system.vercel.app');
console.log('   NEXTAUTH_SECRET=eef5d215a8e44eb60e9d79e4610dd31bddeecd0506bfc9cd66e2212c0d2857fb\n');

console.log('   # 3. Deploy and create admin:');
console.log('   git push origin main');
console.log('   vercel env pull .env.production');
console.log('   npm run db:push');
console.log('   node scripts/create-admin.js admin@example.com admin123\n');

console.log('🎯 Test Credentials:');
console.log('   Email: admin@example.com');
console.log('   Password: admin123');
console.log('   Role: admin (auto-approved)');

console.log('\n📖 For detailed instructions, see DEPLOYMENT_GUIDE.md'); 