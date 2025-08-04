import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    console.log('🔧 Setting up default admin user...');
    
    const db = await getDatabase();
    
    // Default admin credentials
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    
    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
    
    if (existingAdmin.length > 0) {
      // Update existing admin to ensure it's approved
      await db.update(users)
        .set({ 
          approved: true,
          role: 'admin'
        })
        .where(eq(users.email, adminEmail));
      
      console.log('✅ Updated existing admin user');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await db.insert(users).values({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        approved: true
      });
      
      console.log('✅ Created new admin user');
    }
    
    // Verify the admin user
    const adminUser = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
    
    return NextResponse.json(
      { 
        message: 'Default admin user setup successfully',
        admin: {
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
          approved: true
        },
        user: adminUser[0] ? {
          email: adminUser[0].email,
          role: adminUser[0].role,
          approved: adminUser[0].approved
        } : null
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Failed to setup admin user:', error.message);
    return NextResponse.json(
      { error: 'Failed to setup admin user', details: error.message },
      { status: 500 }
    );
  }
} 