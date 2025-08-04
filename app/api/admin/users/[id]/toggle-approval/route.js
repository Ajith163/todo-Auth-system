import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const { action } = await request.json() // 'approve' or 'reject'

    let updateData = {}
    
    if (action === 'approve') {
      updateData = { approved: true, rejected: false }
    } else if (action === 'reject') {
      updateData = { approved: false, rejected: true }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedUser = await db.update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(id)))
      .returning()

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: updatedUser[0] })
  } catch (error) {
    console.error('Error toggling user approval:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 