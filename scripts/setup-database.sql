-- Database Setup Script for Todo App
-- Run this script in your PostgreSQL database to create the required tables

-- Create users table
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

-- Create todos table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "todos_user_id_idx" ON "todos"("user_id");
CREATE INDEX IF NOT EXISTS "todos_completed_idx" ON "todos"("completed");

-- Insert a default admin user (optional)
-- Password is hashed version of 'admin123'
-- You can change this or create admin user through the application
INSERT INTO "users" ("email", "password", "role", "approved") 
VALUES (
  'admin@example.com', 
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzqKqK', 
  'admin', 
  true
) ON CONFLICT ("email") DO NOTHING;

-- Verify tables were created
SELECT 'Users table created successfully' as status WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'users'
);

SELECT 'Todos table created successfully' as status WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'todos'
);

-- Show table structure
\d users;
\d todos; 