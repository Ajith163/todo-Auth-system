import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';

export async function GET() {
  try {
    console.log('🔧 Fixing admin users...');
    
    const db = await getDatabase();
    
    // Check existing admin users
    const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'));
    
    console.log(`Found ${adminUsers.length} admin users`);
    
    let fixedCount = 0;
    
    // Fix all admin users to be approved
    for (const user of adminUsers) {
      if (!user.approved) {
        await db.update(users)
          .set({ approved: true })
          .where(eq(users.id, user.id));
        fixedCount++;
        console.log(`✅ Approved admin user: ${user.email}`);
      }
    }
    
    // Ensure admin@example.com exists and is approved
    const defaultAdmin = await db.select().from(users).where(eq(users.email, 'admin@example.com')).limit(1);
    
    if (defaultAdmin.length === 0) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await db.insert(users).values({
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        approved: true
      });
      
      console.log('✅ Created default admin user');
    } else if (!defaultAdmin[0].approved) {
      // Approve existing default admin
      await db.update(users)
        .set({ approved: true })
        .where(eq(users.email, 'admin@example.com'));
      
      console.log('✅ Approved existing default admin user');
    }
    
    // Get final list of admin users
    const finalAdminUsers = await db.select().from(users).where(eq(users.role, 'admin'));
    
    return NextResponse.json(
      { 
        message: 'Admin users fixed successfully',
        fixedCount: fixedCount,
        totalAdminUsers: finalAdminUsers.length,
        adminUsers: finalAdminUsers.map(user => ({
          email: user.email,
          role: user.role,
          approved: user.approved
        })),
        defaultAdmin: {
          email: 'admin@example.com',
          password: 'admin123'
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Failed to fix admin users:', error.message);
    return NextResponse.json(
      { error: 'Failed to fix admin users', details: error.message },
      { status: 500 }
    );
  }
} 