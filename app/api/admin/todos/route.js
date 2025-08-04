import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { todos, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all todos with user information
    const allTodos = await db.select({
      id: todos.id,
      title: todos.title,
      description: todos.description,
      completed: todos.completed,
      createdAt: todos.createdAt,
      updatedAt: todos.updatedAt,
      userEmail: users.email,
    }).from(todos)
    .leftJoin(users, eq(todos.userId, users.id))
    .orderBy(todos.createdAt)

    return NextResponse.json({ todos: allTodos })
  } catch (error) {
    console.error('Error fetching todos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 