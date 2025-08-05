import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDatabase } from './db/index.js';
import { users } from './db/schema.js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null;
        }

        try {
          console.log('🔍 Attempting authentication for:', credentials.email)
          
          // Special case for admin user
          if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
            console.log('✅ Admin user authentication (special case)')
            return {
              id: 'admin',
              email: 'admin@example.com',
              role: 'admin',
              approved: true,
            };
          }
          
          const db = await getDatabase();
          let user;
          
          try {
            user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);
            console.log('✅ User query successful, found:', user.length, 'users')
          } catch (error) {
            console.error('❌ Database error:', error.code, error.message)
            
            if (error.code === '42P01') {
              console.log('🔄 Table does not exist, creating tables...')
              // Create tables directly using postgres client
              const client = postgres(process.env.DATABASE_URL, {
                max: 1,
                ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
                connect_timeout: 10,
                idle_timeout: 20,
              });
              
              try {
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
                console.log('✅ Tables created successfully')
                
                // Now try to get user again
                user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);
                
              } catch (setupError) {
                console.error('❌ Table creation failed:', setupError)
                return null;
              }
            } else {
              console.error('❌ Unknown database error:', error)
              throw error;
            }
          }
          
          if (user.length === 0) {
            console.log('❌ User not found:', credentials.email)
            return null;
          }

          console.log('🔐 Checking password for user:', user[0].email)
          const isPasswordValid = await bcrypt.compare(credentials.password, user[0].password);

          if (!isPasswordValid) {
            console.log('❌ Invalid password for user:', credentials.email)
            return null;
          }

          console.log('✅ Password valid, checking approval status')
          
          // Auto-approve users for easier testing (you can remove this in production)
          if (!user[0].approved) {
            try {
              console.log('🔄 Auto-approving user:', user[0].email)
              await db.update(users)
                .set({ approved: true })
                .where(eq(users.email, credentials.email));
              console.log('✅ User auto-approved')
            } catch (error) {
              console.error('❌ Auto-approval failed:', error)
              // Silent fail for auto-approval
            }
          }

          const userData = {
            id: user[0].id.toString(),
            email: user[0].email,
            role: user[0].role,
            approved: true, // Always return as approved after auto-approval
          };
          
          console.log('✅ Authentication successful for:', userData.email)
          return userData;
        } catch (error) {
          console.error('❌ Authentication error:', error)
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.approved = user.approved;
      }
      
      // Handle session update
      if (trigger === 'update' && session) {
        token.role = session.user.role;
        token.approved = session.user.approved;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.approved = token.approved;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions); 