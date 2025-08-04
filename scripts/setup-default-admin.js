const postgres = require('postgres');
const bcrypt = require('bcryptjs');

console.log('🔧 Setting up Default Admin User\n');

async function setupDefaultAdmin() {
  try {
    console.log('1. Checking environment variables...');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set');
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

    console.log('\n3. Creating default admin user...');
    
    // Default admin credentials
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    
    try {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      // Create or update admin user
      await client.unsafe(`
        INSERT INTO "users" ("email", "password", "role", "approved") 
        VALUES ($1, $2, 'admin', true)
        ON CONFLICT ("email") DO UPDATE SET 
          password = $2,
          role = 'admin',
          approved = true
      `, [adminEmail, hashedPassword]);
      
      console.log('✅ Default admin user created/updated successfully');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
      console.log('   Role: admin');
      console.log('   Status: approved');
      
    } catch (error) {
      console.error('❌ Failed to create admin user:', error.message);
    }

    console.log('\n4. Verifying admin user...');
    
    try {
      const adminUser = await client`
        SELECT email, role, approved 
        FROM users 
        WHERE email = 'admin@example.com'
      `;
      
      if (adminUser.length > 0) {
        const user = adminUser[0];
        console.log('✅ Admin user verified:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Approved: ${user.approved}`);
      } else {
        console.log('❌ Admin user not found');
      }
      
    } catch (error) {
      console.error('❌ Failed to verify admin user:', error.message);
    }

    await client.end();
    
    console.log('\n🎉 Default admin setup completed!');
    console.log('\n📋 Login Credentials:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('\n🔗 You can now login to your application with these credentials.');
    
  } catch (error) {
    console.error('❌ Failed to setup default admin:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDefaultAdmin(); 