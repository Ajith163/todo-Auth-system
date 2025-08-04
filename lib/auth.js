import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from './db/index';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

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
          const user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1);
          
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
              await db.update(users)
                .set({ approved: true })
                .where(eq(users.email, credentials.email));
              
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions); 