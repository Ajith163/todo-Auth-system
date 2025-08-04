const { getDatabase } = require('../lib/db/index.js');
const { users, todos } = require('../lib/db/schema.js');

async function testDatabaseSetup() {
  console.log('🧪 Testing Database Setup\n');
  
  try {
    console.log('1. Connecting to database...');
    const db = await getDatabase();
    console.log('✅ Database connection successful');
    
    console.log('\n2. Testing users table...');
    try {
      const userResult = await db.select().from(users).limit(1);
      console.log('✅ Users table exists and is accessible');
      console.log(`   Found ${userResult.length} users`);
    } catch (error) {
      if (error.code === '42P01') {
        console.error('❌ Users table does not exist');
        console.log('   This means the database setup failed');
        process.exit(1);
      } else {
        throw error;
      }
    }
    
    console.log('\n3. Testing todos table...');
    try {
      const todoResult = await db.select().from(todos).limit(1);
      console.log('✅ Todos table exists and is accessible');
      console.log(`   Found ${todoResult.length} todos`);
    } catch (error) {
      if (error.code === '42P01') {
        console.error('❌ Todos table does not exist');
        console.log('   This means the database setup failed');
        process.exit(1);
      } else {
        throw error;
      }
    }
    
    console.log('\n4. Testing user creation...');
    try {
      const testUser = await db.insert(users).values({
        email: 'test@example.com',
        password: 'testpassword',
        role: 'user',
        approved: false,
      }).returning();
      
      console.log('✅ User creation test successful');
      console.log(`   Created user with ID: ${testUser[0].id}`);
      
      // Clean up test user
      await db.delete(users).where(eq(users.id, testUser[0].id));
      console.log('   Test user cleaned up');
      
    } catch (error) {
      console.error('❌ User creation test failed:', error.message);
      process.exit(1);
    }
    
    console.log('\n🎉 Database setup test completed successfully!');
    console.log('Your database is properly configured and ready to use.');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check DATABASE_URL is correct');
    console.log('2. Ensure database is accessible');
    console.log('3. Run: npm run fix-deployment');
    console.log('4. Or manually run the SQL from scripts/setup-database.sql');
    process.exit(1);
  }
}

// Import eq for the cleanup
const { eq } = require('drizzle-orm');

testDatabaseSetup(); 