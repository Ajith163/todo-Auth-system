import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session) {
      return NextResponse.json({ 
        success: true, 
        message: 'Already authenticated',
        user: session.user 
      })
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Not authenticated' 
    }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Authentication check failed' 
    }, { status: 500 })
  }
} 