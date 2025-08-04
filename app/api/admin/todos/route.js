import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { todos } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  try {
    console.log('🔍 Admin todos API called')
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== 'admin') {
      console.error('❌ Unauthorized access to admin todos')
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    console.log('✅ Admin session verified:', session.user.email)

    const database = await getDatabase()
    
    const allTodos = await database.select()
      .from(todos)
      .orderBy(desc(todos.createdAt))

    console.log('✅ Fetched todos successfully:', allTodos.length, 'todos')

    return NextResponse.json({ 
      todos: allTodos,
      count: allTodos.length
    })

  } catch (error) {
    console.error('❌ Admin todos API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch todos: ' + error.message 
    }, { status: 500 })
  }
} 