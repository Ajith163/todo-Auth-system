import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(request, { params }) {
  try {
    console.log('🔍 Toggle approval API called')
    const session = await getServerSession(authOptions)
    
    console.log('📊 Session data:', session ? {
      id: session.user?.id,
      email: session.user?.email,
      role: session.user?.role
    } : 'No session')
    
    if (!session || !session.user) {
      console.error('❌ No session found')
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }
    
    if (session.user.role !== 'admin') {
      console.error('❌ User is not admin:', session.user.role)
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = params
    const { action } = await request.json() // 'approve' or 'reject'
    
    console.log('🔍 Toggle action:', action, 'for user ID:', id)

    let updateData = {}
    
    if (action === 'approve') {
      updateData = { approved: true, rejected: false }
    } else if (action === 'reject') {
      updateData = { approved: false, rejected: true }
    } else {
      console.error('❌ Invalid action:', action)
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const database = await getDatabase()
    const updatedUser = await database.update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(id)))
      .returning()

    if (updatedUser.length === 0) {
      console.error('❌ User not found:', id)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('✅ User updated successfully:', updatedUser[0].email)
    return NextResponse.json({ user: updatedUser[0] })
  } catch (error) {
    console.error('❌ Error toggling user approval:', error)
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 })
  }
} 