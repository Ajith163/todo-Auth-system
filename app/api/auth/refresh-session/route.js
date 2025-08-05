import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST() {
  try {
    console.log('🔍 Refreshing session...')
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.id) {
      console.error('❌ No valid session found for refresh')
      return NextResponse.json({ 
        error: 'No valid session found' 
      }, { status: 401 })
    }

    console.log('📊 Current session:', {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    })

    // Handle admin user specially
    if (session.user.id === 'admin' && session.user.email === 'admin@example.com') {
      console.log('✅ Admin user session refresh')
      return NextResponse.json({
        success: true,
        user: {
          id: 'admin',
          email: 'admin@example.com',
          role: 'admin',
          approved: true,
          rejected: false
        }
      })
    }

    // Get fresh user data from database for regular users
    const database = await getDatabase()
    const user = await database.select()
      .from(users)
      .where(eq(users.id, parseInt(session.user.id)))
      .limit(1)

    if (user.length === 0) {
      console.error('❌ User not found in database')
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    const freshUser = user[0]
    console.log('✅ Fresh user data:', {
      id: freshUser.id,
      email: freshUser.email,
      role: freshUser.role,
      approved: freshUser.approved
    })

    return NextResponse.json({
      success: true,
      user: {
        id: freshUser.id,
        email: freshUser.email,
        role: freshUser.role,
        approved: freshUser.approved,
        rejected: freshUser.rejected
      }
    })

  } catch (error) {
    console.error('❌ Session refresh error:', error)
    return NextResponse.json({ 
      error: 'Failed to refresh session: ' + error.message 
    }, { status: 500 })
  }
} 