const { drizzle } = require('drizzle-orm/postgres-js')
const postgres = require('postgres')
require('dotenv').config({ path: '.env.local' })

console.log('🚀 Deployment Setup Script\n')

async function setupDeployment() {
  let client
  try {
    console.log('1. Checking environment variables...')
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ]
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars)
      console.log('\n📝 Please set these in your deployment environment:')
      missingVars.forEach(varName => {
        console.log(`   ${varName}=your_value_here`)
      })
      return
    }
    
    console.log('✅ Environment variables are set')
    
    console.log('\n2. Testing database connection...')
    client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      connect_timeout: 10,
      idle_timeout: 20,
    })
    
    await client`SELECT 1`
    console.log('✅ Database connection successful')
    
    console.log('\n3. Creating tables if they don\'t exist...')
    
    // Create users table
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
    `)
    
    // Create todos table
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
    `)
    
    // Create indexes
    await client.unsafe(`
      CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
      CREATE INDEX IF NOT EXISTS "todos_user_id_idx" ON "todos"("user_id");
      CREATE INDEX IF NOT EXISTS "todos_completed_idx" ON "todos"("completed");
    `)
    
    console.log('✅ Tables created successfully')
    
    console.log('\n4. Creating default admin user...')
    
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Check if admin user exists
    const existingAdmin = await client`
      SELECT id FROM users WHERE email = 'admin@example.com'
    `
    
    if (existingAdmin.length === 0) {
      await client`
        INSERT INTO users (email, password, role, approved, created_at)
        VALUES ('admin@example.com', ${hashedPassword}, 'admin', true, NOW())
      `
      console.log('✅ Default admin user created')
      console.log('   Email: admin@example.com')
      console.log('   Password: admin123')
    } else {
      console.log('✅ Admin user already exists')
    }
    
    console.log('\n5. Testing authentication...')
    
    // Test the admin user
    const testUser = await client`
      SELECT id, email, role, approved FROM users WHERE email = 'admin@example.com'
    `
    
    if (testUser.length > 0) {
      console.log('✅ Admin user found:', {
        id: testUser[0].id,
        email: testUser[0].email,
        role: testUser[0].role,
        approved: testUser[0].approved
      })
    }
    
    console.log('\n🎉 Deployment setup completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Start your application')
    console.log('2. Sign in with admin@example.com / admin123')
    console.log('3. Create additional users as needed')
    
  } catch (error) {
    console.error('\n❌ Deployment setup failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check your DATABASE_URL is correct')
    console.log('2. Ensure your database is accessible')
    console.log('3. Verify NEXTAUTH_SECRET is set')
    console.log('4. Check NEXTAUTH_URL matches your deployment URL')
  } finally {
    if (client) {
      await client.end()
    }
  }
}

setupDeployment() 