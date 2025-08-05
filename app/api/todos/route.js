import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/db'
import { todos } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { todoFormSchema } from '@/lib/validations/todo'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userTodos = await getDatabase().select().from(todos).where(eq(todos.userId, parseInt(session.user.id)))

    return NextResponse.json({ todos: userTodos })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate the request body
    const validationResult = todoFormSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: errors 
      }, { status: 400 })
    }

    const { title, description, dueDate } = validationResult.data

    const newTodo = await getDatabase().insert(todos).values({
      title,
      description,
      dueDate: dueDate && dueDate.trim() ? new Date(dueDate) : null,
      userId: parseInt(session.user.id),
      completed: false,
    }).returning()

    return NextResponse.json({ todo: newTodo[0] }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 