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
          return null;
        }

        try {
          const db = await getDatabase();
          let user;
          
          try {
            user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);
          } catch (error) {
            if (error.code === '42P01') {
              console.log('🔄 Users table does not exist, creating tables...')
              
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
                console.log('✅ Database tables created successfully');
                
                // Now try to get user again
                user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);
                
              } catch (setupError) {
                console.error('❌ Failed to create tables:', setupError.message);
                return null;
              }
            } else {
              throw error;
            }
          }
          
          if (user.length === 0) {
            console.log('User not found:', credentials.email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user[0].password);

          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          // Check if user is approved
          if (!user[0].approved) {
            console.log('User not approved:', credentials.email);
            // Auto-approve admin users for development
            if (user[0].role === 'admin') {
              console.log('Auto-approving admin user:', credentials.email);
              try {
                await db.update(users)
                  .set({ approved: true })
                  .where(eq(users.email, credentials.email));
              } catch (error) {
                console.error('Failed to update user approval status:', error);
              }
              
              return {
                id: user[0].id.toString(),
                email: user[0].email,
                role: user[0].role,
                approved: true,
              };
            }
            
            throw new Error('Account not approved yet. Please contact an administrator.');
          }

          return {
            id: user[0].id.toString(),
            email: user[0].email,
            role: user[0].role,
            approved: user[0].approved,
          };
        } catch (error) {
          console.error('Auth error:', error);
          if (error.message === 'Account not approved yet. Please contact an administrator.') {
            throw error;
          }
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