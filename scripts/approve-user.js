const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

console.log('🔧 User Approval Script\n');

async function approveUser() {
  try {
    console.log('1. Checking environment variables...');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set');
      console.log('Please set DATABASE_URL in your environment variables');
      process.exit(1);
    }
    
    console.log('✅ DATABASE_URL is configured');

    console.log('\n2. Connecting to database...');
    
    const client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      connect_timeout: 10,
      idle_timeout: 20,
    });
    
    console.log('✅ Database connection established');

    console.log('\n3. Checking pending users...');
    
    try {
      const pendingUsers = await client`
        SELECT id, email, role, approved, created_at 
        FROM users 
        WHERE approved = false AND rejected = false
        ORDER BY created_at DESC
      `;
      
      if (pendingUsers.length === 0) {
        console.log('✅ No pending users found');
      } else {
        console.log(`📋 Found ${pendingUsers.length} pending user(s):`);
        pendingUsers.forEach((user, index) => {
          console.log(`${index + 1}. ${user.email} (ID: ${user.id}) - Created: ${user.created_at}`);
        });
        
        console.log('\n4. Approving all pending users...');
        
        const updateResult = await client`
          UPDATE users 
          SET approved = true 
          WHERE approved = false AND rejected = false
        `;
        
        console.log(`✅ Approved ${updateResult.count} user(s)`);
      }
      
      console.log('\n5. Checking admin users...');
      
      const adminUsers = await client`
        SELECT id, email, role, approved 
        FROM users 
        WHERE role = 'admin'
        ORDER BY created_at DESC
      `;
      
      if (adminUsers.length === 0) {
        console.log('⚠️  No admin users found');
        console.log('Creating default admin user...');
        
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        await client.unsafe(`
          INSERT INTO "users" ("email", "password", "role", "approved") 
          VALUES ('admin@example.com', $1, 'admin', true)
          ON CONFLICT ("email") DO NOTHING;
        `, [hashedPassword]);
        
        console.log('✅ Default admin user created');
        console.log('   Email: admin@example.com');
        console.log('   Password: admin123');
      } else {
        console.log('✅ Admin users found:');
        adminUsers.forEach(user => {
          console.log(`   - ${user.email} (${user.approved ? 'Approved' : 'Pending'})`);
        });
      }
      
      console.log('\n6. Final user status:');
      
      const allUsers = await client`
        SELECT email, role, approved, created_at 
        FROM users 
        ORDER BY created_at DESC
      `;
      
      allUsers.forEach(user => {
        const status = user.approved ? '✅ Approved' : '⏳ Pending';
        console.log(`   - ${user.email} (${user.role}) - ${status}`);
      });
      
    } catch (error) {
      console.error('❌ Database operation failed:', error.message);
      throw error;
    }

    await client.end();
    
    console.log('\n🎉 User approval completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Try logging in with your user account');
    console.log('2. Or use admin account: admin@example.com / admin123');
    console.log('3. Test creating and managing todos');
    
  } catch (error) {
    console.error('\n❌ User approval failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check DATABASE_URL is correct');
    console.log('2. Ensure database is accessible');
    console.log('3. Verify database permissions');
    process.exit(1);
  }
}

// Run the approval
approveUser(); 