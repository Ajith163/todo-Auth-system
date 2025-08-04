import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDatabase } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import postgres from 'postgres'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    console.log('Signup attempt for:', email)

    // First, try to create tables if they don't exist
    let client;
    try {
      client = postgres(process.env.DATABASE_URL, {
        max: 1,
        ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
        connect_timeout: 10,
        idle_timeout: 20,
      });

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
      `);
      
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
      `);
      
      // Create indexes
      await client.unsafe(`
        CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
        CREATE INDEX IF NOT EXISTS "todos_user_id_idx" ON "todos"("user_id");
        CREATE INDEX IF NOT EXISTS "todos_completed_idx" ON "todos"("completed");
      `);
      
      await client.end();
      console.log('✅ Database tables created successfully');
      
    } catch (setupError) {
      console.error('❌ Failed to create tables:', setupError.message);
      if (client) await client.end();
    }

    // Get initialized database
    const db = await getDatabase()

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    } catch (error) {
      if (error.code === '42P01') {
        console.log('🔄 Users table still does not exist, trying direct creation...')
        
        // Try direct SQL creation
        const directClient = postgres(process.env.DATABASE_URL, {
          max: 1,
          ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
          connect_timeout: 10,
          idle_timeout: 20,
        });
        
        try {
          await directClient.unsafe(`
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
          
          await directClient.unsafe(`
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
          
          await directClient.end();
          console.log('✅ Tables created via direct SQL');
          
          // Now try to check for existing user again
          existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
          
        } catch (directError) {
          console.error('❌ Direct SQL creation failed:', directError.message);
          await directClient.end();
          return NextResponse.json(
            { error: 'Database setup failed', details: directError.message },
            { status: 500 }
          );
        }
      } else {
        throw error;
      }
    }
    
    if (existingUser && existingUser.length > 0) {
      console.log('User already exists:', email)
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    console.log('Hashing password...')
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('Password hashed successfully')

    console.log('Creating user in database...')
    // Create user
    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      role: 'user',
      approved: false,
    }).returning()

    console.log('User created successfully:', newUser[0].id)

    return NextResponse.json(
      { message: 'User created successfully', user: { id: newUser[0].id, email: newUser[0].email } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error details:')
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
} 