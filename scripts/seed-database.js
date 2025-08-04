const postgres = require('postgres');
const bcrypt = require('bcryptjs');

console.log('🌱 Seeding Database with Admin and Users\n');

async function seedDatabase() {
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

    console.log('\n3. Creating admin user...');
    
    // Admin user
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);
    
    try {
      await client.unsafe(`
        INSERT INTO "users" ("email", "password", "role", "approved") 
        VALUES ($1, $2, 'admin', true)
        ON CONFLICT ("email") DO UPDATE SET 
          password = $2,
          role = 'admin',
          approved = true
      `, [adminEmail, hashedAdminPassword]);
      
      console.log('✅ Admin user created/updated');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
    } catch (error) {
      console.error('❌ Failed to create admin user:', error.message);
    }

    console.log('\n4. Creating 5 regular users...');
    
    // Sample users
    const users = [
      { email: 'john@example.com', password: 'password123', name: 'John Doe' },
      { email: 'jane@example.com', password: 'password123', name: 'Jane Smith' },
      { email: 'mike@example.com', password: 'password123', name: 'Mike Johnson' },
      { email: 'sarah@example.com', password: 'password123', name: 'Sarah Wilson' },
      { email: 'david@example.com', password: 'password123', name: 'David Brown' }
    ];
    
    for (const user of users) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        
        await client.unsafe(`
          INSERT INTO "users" ("email", "password", "role", "approved") 
          VALUES ($1, $2, 'user', true)
          ON CONFLICT ("email") DO UPDATE SET 
            password = $2,
            role = 'user',
            approved = true
        `, [user.email, hashedPassword]);
        
        console.log(`✅ User created: ${user.email} (${user.name})`);
      } catch (error) {
        console.error(`❌ Failed to create user ${user.email}:`, error.message);
      }
    }

    console.log('\n5. Verifying all users...');
    
    try {
      const allUsers = await client`
        SELECT email, role, approved 
        FROM users 
        ORDER BY email
      `;
      
      console.log(`✅ Total users in database: ${allUsers.length}`);
      console.log('\n📋 User List:');
      
      allUsers.forEach(user => {
        const status = user.approved ? '✅ approved' : '❌ pending';
        console.log(`   ${user.email} - ${user.role} (${status})`);
      });
      
    } catch (error) {
      console.error('❌ Failed to verify users:', error.message);
    }

    await client.end();
    
    console.log('\n🎉 Database seeding completed!');
    console.log('\n📋 Login Credentials:');
    console.log('\n🔑 Admin:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('\n👥 Regular Users:');
    users.forEach(user => {
      console.log(`   ${user.email} - password123`);
    });
    console.log('\n🔗 All users are approved and ready to login!');
    
  } catch (error) {
    console.error('❌ Failed to seed database:', error.message);
    process.exit(1);
  }
}

// Run the seed
seedDatabase(); 