import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/db'
import { todos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const { title, description, completed, dueDate } = await request.json()

    // Verify the todo belongs to the user
    const existingTodo = await getDatabase().select().from(todos).where(
      eq(todos.id, parseInt(id)), eq(todos.userId, parseInt(session.user.id))
    ).limit(1)

    if (existingTodo.length === 0) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (completed !== undefined) updateData.completed = completed
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    updateData.updatedAt = new Date()

    const updatedTodo = await getDatabase().update(todos)
      .set(updateData)
      .where(eq(todos.id, parseInt(id)))
      .returning()

    return NextResponse.json({ todo: updatedTodo[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Verify the todo belongs to the user
    const existingTodo = await getDatabase().select().from(todos).where(
      eq(todos.id, parseInt(id)), eq(todos.userId, parseInt(session.user.id))
    ).limit(1)

    if (existingTodo.length === 0) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    await getDatabase().delete(todos).where(eq(todos.id, parseInt(id)))

    return NextResponse.json({ message: 'Todo deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 