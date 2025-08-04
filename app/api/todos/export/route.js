import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/db'
import { todos, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const userId = session.user.id

    // Get user's todos with user info
    const userTodos = await db
      .select({
        id: todos.id,
        title: todos.title,
        description: todos.description,
        completed: todos.completed,
        dueDate: todos.dueDate,
        priority: todos.priority,
        tags: todos.tags,
        createdAt: todos.createdAt,
        updatedAt: todos.updatedAt,
        userEmail: users.email
      })
      .from(todos)
      .leftJoin(users, eq(todos.userId, users.id))
      .where(eq(todos.userId, userId))
      .orderBy(todos.createdAt)

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        todos: userTodos,
        count: userTodos.length
      })
    }

    // CSV format
    const csvHeaders = [
      'Title',
      'Description', 
      'Completed',
      'Due Date',
      'Priority',
      'Tags',
      'Created At',
      'Updated At'
    ]

    const csvRows = userTodos.map(todo => [
      todo.title,
      todo.description || '',
      todo.completed ? 'Yes' : 'No',
      todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '',
      todo.priority || 'medium',
      todo.tags ? JSON.stringify(todo.tags) : '',
      new Date(todo.createdAt).toLocaleDateString(),
      new Date(todo.updatedAt).toLocaleDateString()
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="todos.csv"'
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to export todos' 
    }, { status: 500 })
  }
} 