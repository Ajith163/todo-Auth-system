import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/db'
import { users } from '@/lib/db/schema'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('🔍 Admin users API - Session:', session ? {
      id: session.user?.id,
      email: session.user?.email,
      role: session.user?.role
    } : 'No session')
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const database = await getDatabase()
    const allUsers = await database.select().from(users).orderBy(users.createdAt)

    console.log('✅ Admin users fetched:', allUsers.length, 'users')
    return NextResponse.json({ users: allUsers })
  } catch (error) {
    console.error('❌ Admin users API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 