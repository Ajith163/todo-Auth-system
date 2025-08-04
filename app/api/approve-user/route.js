import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Approving user:', email);

    const db = await getDatabase();

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Approve the user
    await db.update(users)
      .set({ approved: true })
      .where(eq(users.email, email));

    console.log('✅ User approved successfully:', email);

    return NextResponse.json(
      { 
        message: 'User approved successfully',
        email: email,
        approved: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Failed to approve user:', error.message);
    return NextResponse.json(
      { error: 'Failed to approve user', details: error.message },
      { status: 500 }
    );
  }
} 