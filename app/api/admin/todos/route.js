import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { todos, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const db = await getDatabase();

    // Get all todos with user information
    const allTodos = await db
      .select({
        id: todos.id,
        title: todos.title,
        description: todos.description,
        completed: todos.completed,
        dueDate: todos.dueDate,
        tags: todos.tags,
        priority: todos.priority,
        createdAt: todos.createdAt,
        updatedAt: todos.updatedAt,
        userEmail: users.email,
        userId: users.id
      })
      .from(todos)
      .leftJoin(users, eq(todos.userId, users.id))
      .orderBy(todos.createdAt);

    return NextResponse.json({ 
      todos: allTodos,
      total: allTodos.length
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 