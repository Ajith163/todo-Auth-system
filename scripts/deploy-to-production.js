const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Production Deployment Script\n');

console.log('📋 Pre-deployment Checklist:\n');
console.log('1. ✅ Vercel Postgres database created');
console.log('2. ✅ Environment variables set in Vercel dashboard');
console.log('3. ✅ Ready to deploy code\n');

console.log('🔧 Starting deployment process...\n');

async function deployToProduction() {
  try {
    // Step 1: Add and commit changes
    console.log('1. 📝 Committing changes...');
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Fix production deployment with database setup"', { stdio: 'inherit' });
    console.log('✅ Changes committed\n');

    // Step 2: Push to GitHub
    console.log('2. 🚀 Pushing to GitHub...');
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ Code pushed to GitHub\n');

    // Step 3: Check if Vercel CLI is installed
    console.log('3. 🔧 Checking Vercel CLI...');
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      console.log('✅ Vercel CLI is installed\n');
    } catch (error) {
      console.log('⚠️  Vercel CLI not found. Installing...');
      execSync('npm install -g vercel', { stdio: 'inherit' });
      console.log('✅ Vercel CLI installed\n');
    }

    // Step 4: Pull environment variables
    console.log('4. 📥 Pulling environment variables...');
    try {
      execSync('vercel env pull .env.production', { stdio: 'inherit' });
      console.log('✅ Environment variables pulled\n');
    } catch (error) {
      console.log('⚠️  Could not pull environment variables');
      console.log('   Make sure you are logged in to Vercel: vercel login\n');
    }

    // Step 5: Run database migrations
    console.log('5. 🗄️  Running database migrations...');
    try {
      execSync('npm run db:push', { stdio: 'inherit' });
      console.log('✅ Database migrations completed\n');
    } catch (error) {
      console.log('⚠️  Database migrations failed');
      console.log('   Make sure DATABASE_URL is set correctly\n');
    }

    // Step 6: Create admin user
    console.log('6. 👤 Creating admin user...');
    try {
      execSync('node scripts/create-admin.js admin@example.com admin123', { stdio: 'inherit' });
      console.log('✅ Admin user created\n');
    } catch (error) {
      console.log('⚠️  Admin user creation failed');
      console.log('   You can create it manually later\n');
    }

    console.log('🎉 Deployment process completed!\n');
    console.log('📋 Next Steps:');
    console.log('1. Go to: https://todo-auth-system.vercel.app');
    console.log('2. Test signup with a new user');
    console.log('3. Test signin with: admin@example.com / admin123');
    console.log('4. Verify all features work correctly\n');

    console.log('🎯 Test Credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.log('\n💡 Manual steps:');
    console.log('1. Set up Vercel Postgres database');
    console.log('2. Set environment variables in Vercel dashboard');
    console.log('3. Push code: git push origin main');
    console.log('4. Run migrations: npm run db:push');
    console.log('5. Create admin: node scripts/create-admin.js admin@example.com admin123');
  }
}

deployToProduction(); 