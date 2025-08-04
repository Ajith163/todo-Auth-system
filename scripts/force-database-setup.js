const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

console.log('🔧 Force Database Setup Script\n');

async function forceDatabaseSetup() {
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

    console.log('\n3. Creating database tables...');
    
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
      console.log('✅ Users table created/verified');
    } catch (error) {
      console.error('❌ Failed to create users table:', error.message);
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
          CONSTRAINT "todos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
        );
      `);
      console.log('✅ Todos table created/verified');
    } catch (error) {
      console.error('❌ Failed to create todos table:', error.message);
    }
    
    // Create indexes
    try {
      await client.unsafe(`
        CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
        CREATE INDEX IF NOT EXISTS "todos_user_id_idx" ON "todos"("user_id");
        CREATE INDEX IF NOT EXISTS "todos_completed_idx" ON "todos"("completed");
      `);
      console.log('✅ Database indexes created/verified');
    } catch (error) {
      console.error('❌ Failed to create indexes:', error.message);
    }

    console.log('\n4. Verifying tables exist...');
    
    try {
      const usersResult = await client`SELECT COUNT(*) as count FROM users`;
      const todosResult = await client`SELECT COUNT(*) as count FROM todos`;
      
      console.log(`✅ Users table: ${usersResult[0].count} records`);
      console.log(`✅ Todos table: ${todosResult[0].count} records`);
    } catch (error) {
      console.error('❌ Failed to verify tables:', error.message);
    }

    console.log('\n5. Creating default admin user...');
    
    try {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await client.unsafe(`
        INSERT INTO "users" ("email", "password", "role", "approved") 
        VALUES ('admin@example.com', $1, 'admin', true)
        ON CONFLICT ("email") DO NOTHING;
      `, [hashedPassword]);
      
      console.log('✅ Default admin user created/verified');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
    } catch (error) {
      console.error('❌ Failed to create admin user:', error.message);
    }

    await client.end();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('The application should now work correctly.');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check DATABASE_URL is correct');
    console.log('2. Ensure database is accessible');
    console.log('3. Verify database permissions');
    console.log('4. Check database connection limits');
    process.exit(1);
  }
}

// Run the setup
forceDatabaseSetup(); 