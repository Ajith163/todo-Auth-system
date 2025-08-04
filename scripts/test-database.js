const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

console.log('🔍 Database Test Script\n');

async function testDatabase() {
  let client;
  
  try {
    console.log('1. Checking environment variables...');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set');
      console.log('Please set DATABASE_URL in your environment variables');
      console.log('Example: DATABASE_URL="postgresql://username:password@localhost:5432/todo_app"');
      process.exit(1);
    }
    
    console.log('✅ DATABASE_URL is configured');
    console.log('URL:', process.env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@'));

    console.log('\n2. Testing database connection...');
    
    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      connect_timeout: 10,
      idle_timeout: 20,
    });
    
    console.log('✅ Database connection established');

    console.log('\n3. Checking if tables exist...');
    
    try {
      const tablesResult = await client`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'todos')
        ORDER BY table_name;
      `;
      
      console.log('Found tables:', tablesResult.map(t => t.table_name));
      
      if (tablesResult.length === 0) {
        console.log('❌ No required tables found');
        console.log('Run: node scripts/fix-database-issues.js');
        return;
      }
      
      if (tablesResult.length < 2) {
        console.log('⚠️ Some tables are missing');
        console.log('Run: node scripts/fix-database-issues.js');
        return;
      }
      
      console.log('✅ All required tables exist');
      
    } catch (error) {
      console.error('❌ Failed to check tables:', error.message);
      return;
    }

    console.log('\n4. Checking table structure...');
    
    try {
      const usersStructure = await client`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `;
      
      const todosStructure = await client`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'todos'
        ORDER BY ordinal_position;
      `;
      
      console.log('Users table structure:');
      usersStructure.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });
      
      console.log('\nTodos table structure:');
      todosStructure.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });
      
    } catch (error) {
      console.error('❌ Failed to check table structure:', error.message);
    }

    console.log('\n5. Checking data...');
    
    try {
      const usersCount = await client`SELECT COUNT(*) as count FROM users`;
      const todosCount = await client`SELECT COUNT(*) as count FROM todos`;
      
      console.log(`Users: ${usersCount[0].count} records`);
      console.log(`Todos: ${todosCount[0].count} records`);
      
      if (usersCount[0].count > 0) {
        const sampleUsers = await client`SELECT id, email, role, approved FROM users LIMIT 3`;
        console.log('\nSample users:');
        sampleUsers.forEach(user => {
          console.log(`  - ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Approved: ${user.approved}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Failed to check data:', error.message);
    }

    console.log('\n6. Testing basic operations...');
    
    try {
      // Test select
      const testSelect = await client`SELECT 1 as test`;
      console.log('✅ SELECT operation works');
      
      // Test insert (if no users exist)
      const userCount = await client`SELECT COUNT(*) as count FROM users`;
      if (userCount[0].count === 0) {
        console.log('ℹ️ No users found, skipping insert test');
      } else {
        console.log('✅ Database operations appear to be working');
      }
      
    } catch (error) {
      console.error('❌ Basic operations failed:', error.message);
    }

    await client.end();
    
    console.log('\n🎉 Database test completed successfully!');
    console.log('\n📋 If you see any issues above, run:');
    console.log('node scripts/fix-database-issues.js');
    
  } catch (error) {
    console.error('\n❌ Database test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check DATABASE_URL is correct');
    console.log('2. Ensure database is accessible');
    console.log('3. Verify database permissions');
    console.log('4. Make sure PostgreSQL is running');
    
    if (client) {
      try {
        await client.end();
      } catch (endError) {
        console.error('Failed to close database connection:', endError.message);
      }
    }
    
    process.exit(1);
  }
}

// Run the test
testDatabase(); 