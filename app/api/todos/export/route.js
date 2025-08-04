import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { todos } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    const userTodos = await db.select()
      .from(todos)
      .where(eq(todos.userId, parseInt(session.user.id)))
      .orderBy(desc(todos.createdAt))

    if (format === 'csv') {
      const csvHeaders = ['Title', 'Description', 'Completed', 'Due Date', 'Priority', 'Tags', 'Created At']
      const csvRows = userTodos.map(todo => [
        todo.title,
        todo.description || '',
        todo.completed ? 'Yes' : 'No',
        todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '',
        todo.priority || 'medium',
        todo.tags ? todo.tags.join(', ') : '',
        new Date(todo.createdAt).toLocaleDateString()
      ])
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="todos-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else {
      return NextResponse.json({ 
        todos: userTodos,
        exportDate: new Date().toISOString(),
        totalCount: userTodos.length
      })
    }
  } catch (error) {
    console.error('Error exporting todos:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 