import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the latest user data from database
    const user = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1)
    
    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return updated user data
    return NextResponse.json({
      user: {
        id: user[0].id.toString(),
        email: user[0].email,
        role: user[0].role,
        approved: user[0].approved,
      }
    })

  } catch (error) {
    console.error('Error refreshing session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 