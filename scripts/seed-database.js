const postgres = require('postgres');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      process.exit(1);
    }
    
    const client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      connect_timeout: 10,
      idle_timeout: 20,
    });
    
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
    } catch (error) {
      // Silent error handling
    }

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
      } catch (error) {
        // Silent error handling
      }
    }

    // Verifying all users
    try {
      const allUsers = await client`
        SELECT email, role, approved 
        FROM users 
        ORDER BY email
      `;
    } catch (error) {
      // Silent error handling
    }

    await client.end();
    
  } catch (error) {
    process.exit(1);
  }
}

// Run the seed
seedDatabase(); 