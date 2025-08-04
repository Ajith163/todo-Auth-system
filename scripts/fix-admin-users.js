const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

console.log('🔧 Fix Admin Users Script\n');

async function fixAdminUsers() {
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

    console.log('\n3. Checking existing admin users...');
    
    try {
      const adminUsers = await client`
        SELECT id, email, role, approved, created_at 
        FROM users 
        WHERE role = 'admin'
        ORDER BY created_at DESC
      `;
      
      console.log(`Found ${adminUsers.length} admin users:`);
      adminUsers.forEach(user => {
        console.log(`  - ${user.email} (approved: ${user.approved})`);
      });
      
      if (adminUsers.length === 0) {
        console.log('No admin users found. Creating default admin...');
        
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        await client.unsafe(`
          INSERT INTO "users" ("email", "password", "role", "approved") 
          VALUES ('admin@example.com', $1, 'admin', true)
          ON CONFLICT ("email") DO UPDATE SET 
            approved = true,
            role = 'admin'
        `, [hashedPassword]);
        
        console.log('✅ Default admin user created/updated');
        console.log('   Email: admin@example.com');
        console.log('   Password: admin123');
      } else {
        console.log('\n4. Fixing admin user approval status...');
        
        // Approve all admin users
        const result = await client.unsafe(`
          UPDATE users 
          SET approved = true 
          WHERE role = 'admin' AND approved = false
        `);
        
        console.log(`✅ Updated ${result.count || 0} admin users to approved status`);
        
        // Also ensure admin@example.com exists and is approved
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        await client.unsafe(`
          INSERT INTO "users" ("email", "password", "role", "approved") 
          VALUES ('admin@example.com', $1, 'admin', true)
          ON CONFLICT ("email") DO UPDATE SET 
            approved = true,
            role = 'admin',
            password = $1
        `, [hashedPassword]);
        
        console.log('✅ Ensured admin@example.com exists and is approved');
      }
      
    } catch (error) {
      console.error('❌ Failed to check/fix admin users:', error.message);
    }

    console.log('\n5. Verifying admin users...');
    
    try {
      const adminUsers = await client`
        SELECT email, role, approved 
        FROM users 
        WHERE role = 'admin'
        ORDER BY email
      `;
      
      console.log('Current admin users:');
      adminUsers.forEach(user => {
        console.log(`  ✅ ${user.email} - ${user.role} (approved: ${user.approved})`);
      });
      
    } catch (error) {
      console.error('❌ Failed to verify admin users:', error.message);
    }

    await client.end();
    
    console.log('\n🎉 Admin users fixed successfully!');
    console.log('You can now login with:');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');
    
  } catch (error) {
    console.error('❌ Failed to fix admin users:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixAdminUsers(); 