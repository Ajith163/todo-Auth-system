const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const bcrypt = require('bcryptjs');

console.log('🔧 Database Issues Fix Script\n');

async function fixDatabaseIssues() {
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

    console.log('\n2. Connecting to database...');
    
    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      connect_timeout: 30,
      idle_timeout: 30,
    });
    
    console.log('✅ Database connection established');

    console.log('\n3. Dropping existing tables (if any)...');
    
    try {
      await client.unsafe(`DROP TABLE IF EXISTS "todos" CASCADE`);
      await client.unsafe(`DROP TABLE IF EXISTS "users" CASCADE`);
      console.log('✅ Existing tables dropped');
    } catch (error) {
      console.log('ℹ️ No existing tables to drop');
    }

    console.log('\n4. Creating database tables...');
    
    // Create users table
    try {
      await client.unsafe(`
        CREATE TABLE "users" (
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
      console.log('✅ Users table created');
    } catch (error) {
      console.error('❌ Failed to create users table:', error.message);
      throw error;
    }
    
    // Create todos table
    try {
      await client.unsafe(`
        CREATE TABLE "todos" (
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
          CONSTRAINT "todos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);
      console.log('✅ Todos table created');
    } catch (error) {
      console.error('❌ Failed to create todos table:', error.message);
      throw error;
    }
    
    // Create indexes
    try {
      await client.unsafe(`
        CREATE INDEX "users_email_idx" ON "users"("email");
        CREATE INDEX "todos_user_id_idx" ON "todos"("user_id");
        CREATE INDEX "todos_completed_idx" ON "todos"("completed");
      `);
      console.log('✅ Database indexes created');
    } catch (error) {
      console.error('❌ Failed to create indexes:', error.message);
    }

    console.log('\n5. Verifying tables exist...');
    
    try {
      const usersResult = await client`SELECT COUNT(*) as count FROM users`;
      const todosResult = await client`SELECT COUNT(*) as count FROM todos`;
      
      console.log(`✅ Users table: ${usersResult[0].count} records`);
      console.log(`✅ Todos table: ${todosResult[0].count} records`);
    } catch (error) {
      console.error('❌ Failed to verify tables:', error.message);
      throw error;
    }

    console.log('\n6. Creating default admin user...');
    
    try {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await client.unsafe(`
        INSERT INTO "users" ("email", "password", "role", "approved") 
        VALUES ('admin@example.com', $1, 'admin', true)
        ON CONFLICT ("email") DO NOTHING;
      `, [hashedPassword]);
      
      console.log('✅ Default admin user created');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
    } catch (error) {
      console.error('❌ Failed to create admin user:', error.message);
    }

    console.log('\n7. Testing database operations...');
    
    try {
      // Test insert
      const testUser = await client.unsafe(`
        INSERT INTO "users" ("email", "password", "role", "approved") 
        VALUES ('test@example.com', $1, 'user', false)
        RETURNING id, email;
      `, [await bcrypt.hash('test123', 12)]);
      
      console.log('✅ Test user created:', testUser[0].email);
      
      // Test todo insert
      const testTodo = await client.unsafe(`
        INSERT INTO "todos" ("title", "description", "user_id") 
        VALUES ('Test Todo', 'This is a test todo', $1)
        RETURNING id, title;
      `, [testUser[0].id]);
      
      console.log('✅ Test todo created:', testTodo[0].title);
      
      // Clean up test data
      await client.unsafe(`DELETE FROM "todos" WHERE id = $1`, [testTodo[0].id]);
      await client.unsafe(`DELETE FROM "users" WHERE id = $1`, [testUser[0].id]);
      
      console.log('✅ Test data cleaned up');
      
    } catch (error) {
      console.error('❌ Database operations test failed:', error.message);
      throw error;
    }

    await client.end();
    
    console.log('\n🎉 Database issues fixed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your application');
    console.log('2. Try signing up with a new user');
    console.log('3. Login with admin@example.com / admin123');
    console.log('4. Test creating and managing todos');
    
  } catch (error) {
    console.error('\n❌ Database fix failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check DATABASE_URL is correct');
    console.log('2. Ensure database is accessible');
    console.log('3. Verify database permissions');
    console.log('4. Check database connection limits');
    console.log('5. Make sure PostgreSQL is running');
    
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

// Run the fix
fixDatabaseIssues(); 