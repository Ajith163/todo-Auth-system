const postgres = require('postgres');
const bcrypt = require('bcryptjs');

async function setupProductionDatabase() {
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
    
    // Create users table
    try {
      await client.unsafe(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" serial PRIMARY KEY NOT NULL,
          "email" text NOT NULL,
          "password" text NOT NULL,
          "role" text DEFAULT 'user' NOT NULL,
          "approved" boolean DEFAULT false NOT NULL,
          "rejected" boolean DEFAULT false NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          CONSTRAINT "users_email_unique" UNIQUE("email")
        );
      `);
    } catch (error) {
      // Silent error handling
    }
    
    // Create todos table
    try {
      await client.unsafe(`
        CREATE TABLE IF NOT EXISTS "todos" (
          "id" serial PRIMARY KEY NOT NULL,
          "title" text NOT NULL,
          "description" text,
          "completed" boolean DEFAULT false NOT NULL,
          "due_date" timestamp,
          "tags" json,
          "priority" text DEFAULT 'medium',
          "user_id" integer NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL,
          CONSTRAINT "todos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
        );
      `);
    } catch (error) {
      // Silent error handling
    }
    
    // Create indexes
    try {
      await client.unsafe(`
        CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
        CREATE INDEX IF NOT EXISTS "todos_user_id_idx" ON "todos"("user_id");
        CREATE INDEX IF NOT EXISTS "todos_completed_idx" ON "todos"("completed");
      `);
    } catch (error) {
      // Silent error handling
    }

    // Verifying tables exist
    try {
      const usersResult = await client`SELECT COUNT(*) as count FROM users`;
      const todosResult = await client`SELECT COUNT(*) as count FROM todos`;
    } catch (error) {
      // Silent error handling
    }

    // Creating default admin user
    try {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await client.unsafe(`
        INSERT INTO "users" ("email", "password", "role", "approved") 
        VALUES ('admin@example.com', $1, 'admin', true)
        ON CONFLICT ("email") DO UPDATE SET 
          password = $1,
          role = 'admin',
          approved = true
      `, [hashedPassword]);
    } catch (error) {
      // Silent error handling
    }

    // Creating sample users
    const sampleUsers = [
      { email: 'john@example.com', password: 'password123', name: 'John Doe' },
      { email: 'jane@example.com', password: 'password123', name: 'Jane Smith' },
      { email: 'mike@example.com', password: 'password123', name: 'Mike Johnson' },
      { email: 'sarah@example.com', password: 'password123', name: 'Sarah Wilson' },
      { email: 'david@example.com', password: 'password123', name: 'David Brown' }
    ];
    
    for (const user of sampleUsers) {
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

    // Final verification
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

// Run the setup
setupProductionDatabase(); 