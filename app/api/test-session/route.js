import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Testing session...')
    const session = await getServerSession(authOptions)
    
    console.log('Session data:', session)
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No session found',
        message: 'Please log in first'
      }, { status: 401 })
    }
    
    if (!session.user || !session.user.id) {
      return NextResponse.json({ 
        error: 'Invalid session',
        message: 'Session is missing user data'
      }, { status: 401 })
    }
    
    return NextResponse.json({
      success: true,
      session: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        approved: session.user.approved
      }
    })
    
  } catch (error) {
    console.error('Session test error:', error)
    return NextResponse.json({ 
      error: 'Session test failed',
      message: error.message
    }, { status: 500 })
  }
} 