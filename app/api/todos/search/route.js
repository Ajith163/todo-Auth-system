import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/db'
import { todos } from '@/lib/db/schema'
import { eq, ilike, or } from 'drizzle-orm'

// Force dynamic rendering since this route uses getServerSession
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const completed = searchParams.get('completed')
    const priority = searchParams.get('priority')
    const tags = searchParams.get('tags')
    const dueDate = searchParams.get('dueDate')
    
    let whereConditions = [eq(todos.userId, parseInt(session.user.id))]
    
    // Text search
    if (query) {
      whereConditions.push(
        or(
          ilike(todos.title, `%${query}%`),
          ilike(todos.description, `%${query}%`)
        )
      )
    }
    
    // Filters
    if (completed !== null && completed !== undefined) {
      whereConditions.push(eq(todos.completed, completed === 'true'))
    }
    
    if (priority) {
      whereConditions.push(eq(todos.priority, priority))
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim())
      // Simplified tag search - in production, use proper JSON search
      whereConditions.push(
        or(...tagArray.map(tag => ilike(todos.tags, `%${tag}%`)))
      )
    }
    
    if (dueDate) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      switch (dueDate) {
        case 'overdue':
          whereConditions.push(
            and(
              lte(todos.dueDate, now),
              eq(todos.completed, false)
            )
          )
          break
        case 'today':
          whereConditions.push(
            and(
              gte(todos.dueDate, today),
              lte(todos.dueDate, tomorrow)
            )
          )
          break
        case 'this-week':
          whereConditions.push(
            and(
              gte(todos.dueDate, today),
              lte(todos.dueDate, weekEnd)
            )
          )
          break
        case 'this-month':
          whereConditions.push(
            and(
              gte(todos.dueDate, today),
              lte(todos.dueDate, monthEnd)
            )
          )
          break
      }
    }
    
    const searchResults = await getDatabase().select()
      .from(todos)
      .where(and(...whereConditions))
      .orderBy(desc(todos.createdAt))
    
    return NextResponse.json({ 
      todos: searchResults,
      totalCount: searchResults.length,
      searchQuery: query,
      filters: { completed, priority, tags, dueDate }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 