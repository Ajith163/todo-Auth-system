import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { todos } from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { todoIds, action, updates } = body

    if (!todoIds || !Array.isArray(todoIds) || todoIds.length === 0) {
      return NextResponse.json({ error: 'Invalid todo IDs' }, { status: 400 })
    }

    let updateData = {}
    
    switch (action) {
      case 'complete':
        updateData = { completed: true, updatedAt: new Date() }
        break
      case 'incomplete':
        updateData = { completed: false, updatedAt: new Date() }
        break
      case 'update':
        updateData = { 
          ...updates, 
          updatedAt: new Date() 
        }
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedTodos = await db.update(todos)
      .set(updateData)
      .where(
        and(
          inArray(todos.id, todoIds),
          eq(todos.userId, parseInt(session.user.id))
        )
      )
      .returning()

    return NextResponse.json({ 
      success: true, 
      updatedCount: updatedTodos.length,
      message: `Successfully updated ${updatedTodos.length} todos`
    })
  } catch (error) {
    console.error('Error bulk updating todos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { todoIds } = body

    if (!todoIds || !Array.isArray(todoIds) || todoIds.length === 0) {
      return NextResponse.json({ error: 'Invalid todo IDs' }, { status: 400 })
    }

    const deletedTodos = await db.delete(todos)
      .where(
        and(
          inArray(todos.id, todoIds),
          eq(todos.userId, parseInt(session.user.id))
        )
      )
      .returning()

    return NextResponse.json({ 
      success: true, 
      deletedCount: deletedTodos.length,
      message: `Successfully deleted ${deletedTodos.length} todos`
    })
  } catch (error) {
    console.error('Error bulk deleting todos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 