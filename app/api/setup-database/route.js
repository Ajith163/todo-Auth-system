import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function POST() {
  try {
    console.log('🔧 Database setup API called');
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL is not configured' },
        { status: 500 }
      );
    }

    const client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      connect_timeout: 10,
      idle_timeout: 20,
    });

    console.log('✅ Database connection established');

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
      return NextResponse.json(
        { error: 'Failed to create users table', details: error.message },
        { status: 500 }
      );
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
      return NextResponse.json(
        { error: 'Failed to create todos table', details: error.message },
        { status: 500 }
      );
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

    // Verify tables exist
    try {
      const usersResult = await client`SELECT COUNT(*) as count FROM users`;
      const todosResult = await client`SELECT COUNT(*) as count FROM todos`;
      
      console.log(`✅ Users table: ${usersResult[0].count} records`);
      console.log(`✅ Todos table: ${todosResult[0].count} records`);
    } catch (error) {
      console.error('❌ Failed to verify tables:', error.message);
    }

    await client.end();

    console.log('🎉 Database setup completed successfully');

    return NextResponse.json(
      { 
        message: 'Database setup completed successfully',
        users: usersResult[0].count,
        todos: todosResult[0].count
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    return NextResponse.json(
      { error: 'Database setup failed', details: error.message },
      { status: 500 }
    );
  }
} 