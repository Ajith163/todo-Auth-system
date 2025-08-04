'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db, getDatabase } from '@/lib/db'
import { todos } from '@/lib/db/schema'
import { eq, and, or, like, inArray, gte, lte, desc, asc } from 'drizzle-orm'
import { todoFormSchema, todoUpdateSchema, bulkTodoSchema, searchTodoSchema } from '@/lib/validations/todo'
import { revalidatePath } from 'next/cache'

export async function createTodo(formData) {
  try {
    console.log('🔍 Creating todo - checking session...')
    const session = await getServerSession(authOptions)
    console.log('Session data:', session ? { id: session.user?.id, email: session.user?.email, role: session.user?.role } : 'No session')
    
    if (!session || !session.user || !session.user.id) {
      console.error('❌ No valid session found')
      return { error: 'Unauthorized - Please log in again' }
    }

    // Parse and validate form data
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      dueDate: formData.get('dueDate'),
      tags: formData.get('tags') ? JSON.parse(formData.get('tags')) : [],
      priority: formData.get('priority') || 'medium',
    }

    console.log('📝 Raw form data:', rawData)

    const validatedData = todoFormSchema.parse(rawData)
    console.log('✅ Validated data:', validatedData)

    // Convert dueDate string to Date object if provided
    const dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null

    // Ensure database is available
    const database = await getDatabase()
    
    console.log('💾 Inserting todo with userId:', session.user.id)

    const newTodo = await database.insert(todos).values({
      title: validatedData.title,
      description: validatedData.description,
      dueDate: dueDate,
      tags: validatedData.tags,
      priority: validatedData.priority,
      userId: parseInt(session.user.id),
      completed: false,
    }).returning()

    console.log('✅ Todo created successfully:', newTodo[0])

    revalidatePath('/dashboard')
    return { success: true, todo: newTodo[0] }
  } catch (error) {
    console.error('❌ Create todo error:', error)
    if (error.name === 'ZodError') {
      return { error: 'Validation failed', details: error.errors }
    }
    return { error: 'Failed to create todo: ' + error.message }
  }
}

export async function updateTodo(todoId, updates) {
  try {
    console.log('🔍 Updating todo - checking session...')
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.id) {
      console.error('❌ No valid session found')
      return { error: 'Unauthorized - Please log in again' }
    }

    // Validate updates
    const validatedUpdates = todoUpdateSchema.parse(updates)

    // Convert dueDate string to Date object if provided
    if (validatedUpdates.dueDate) {
      validatedUpdates.dueDate = new Date(validatedUpdates.dueDate)
    }

    const database = await getDatabase()
    
    const updatedTodo = await database.update(todos)
      .set(validatedUpdates)
      .where(
        and(
          eq(todos.id, parseInt(todoId)),
          eq(todos.userId, parseInt(session.user.id))
        )
      )
      .returning()

    if (updatedTodo.length === 0) {
      return { error: 'Todo not found or unauthorized' }
    }

    revalidatePath('/dashboard')
    return { success: true, todo: updatedTodo[0] }
  } catch (error) {
    console.error('❌ Update todo error:', error)
    if (error.name === 'ZodError') {
      return { error: 'Validation failed', details: error.errors }
    }
    return { error: 'Failed to update todo: ' + error.message }
  }
}

export async function deleteTodo(todoId) {
  try {
    console.log('🔍 Deleting todo - checking session...')
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.id) {
      console.error('❌ No valid session found')
      return { error: 'Unauthorized - Please log in again' }
    }

    const database = await getDatabase()
    
    const deletedTodo = await database.delete(todos)
      .where(
        and(
          eq(todos.id, parseInt(todoId)),
          eq(todos.userId, parseInt(session.user.id))
        )
      )
      .returning()

    if (deletedTodo.length === 0) {
      return { error: 'Todo not found or unauthorized' }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('❌ Delete todo error:', error)
    return { error: 'Failed to delete todo: ' + error.message }
  }
}

export async function toggleTodo(todoId, completed) {
  try {
    console.log('🔍 Toggling todo - checking session...')
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.id) {
      console.error('❌ No valid session found')
      return { error: 'Unauthorized - Please log in again' }
    }

    const database = await getDatabase()
    
    const updatedTodo = await database.update(todos)
      .set({ completed, updatedAt: new Date() })
      .where(
        and(
          eq(todos.id, parseInt(todoId)),
          eq(todos.userId, parseInt(session.user.id))
        )
      )
      .returning()

    if (updatedTodo.length === 0) {
      return { error: 'Todo not found or unauthorized' }
    }

    revalidatePath('/dashboard')
    return { success: true, todo: updatedTodo[0] }
  } catch (error) {
    console.error('❌ Toggle todo error:', error)
    return { error: 'Failed to toggle todo: ' + error.message }
  }
}

export async function getTodos() {
  try {
    console.log('🔍 Getting todos - checking session...')
    const session = await getServerSession(authOptions)
    console.log('Session data:', session ? { id: session.user?.id, email: session.user?.email, role: session.user?.role } : 'No session')
    
    if (!session || !session.user || !session.user.id) {
      console.error('❌ No valid session found')
      return { error: 'Unauthorized - Please log in again', todos: [] }
    }

    // Ensure database is available
    const database = await getDatabase()
    
    console.log('💾 Fetching todos for userId:', session.user.id)
    
    const userTodos = await database.select()
      .from(todos)
      .where(eq(todos.userId, parseInt(session.user.id)))
      .orderBy(desc(todos.createdAt))

    console.log('✅ Found todos:', userTodos.length)

    return { todos: userTodos || [] }
  } catch (error) {
    console.error('❌ Get todos error:', error)
    return { error: 'Failed to fetch todos: ' + error.message, todos: [] }
  }
}

// Bulk operations
export async function bulkUpdateTodos(data) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return { error: 'Unauthorized' }
    }

    const validatedData = bulkTodoSchema.parse(data)
    
    let updateData = {}
    
    switch (validatedData.action) {
      case 'complete':
        updateData = { completed: true, updatedAt: new Date() }
        break
      case 'incomplete':
        updateData = { completed: false, updatedAt: new Date() }
        break
      case 'update':
        updateData = { 
          ...validatedData.updates, 
          updatedAt: new Date() 
        }
        break
      default:
        return { error: 'Invalid action' }
    }

    const updatedTodos = await db.update(todos)
      .set(updateData)
      .where(
        and(
          inArray(todos.id, validatedData.todoIds),
          eq(todos.userId, parseInt(session.user.id))
        )
      )
      .returning()

    revalidatePath('/dashboard')
    return { success: true, updatedCount: updatedTodos.length }
  } catch (error) {
    if (error.name === 'ZodError') {
      return { error: 'Validation failed', details: error.errors }
    }
    return { error: 'Failed to bulk update todos' }
  }
}

export async function bulkDeleteTodos(todoIds) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return { error: 'Unauthorized' }
    }

    const deletedTodos = await db.delete(todos)
      .where(
        and(
          inArray(todos.id, todoIds),
          eq(todos.userId, parseInt(session.user.id))
        )
      )
      .returning()

    revalidatePath('/dashboard')
    return { success: true, deletedCount: deletedTodos.length }
  } catch (error) {
    return { error: 'Failed to bulk delete todos' }
  }
}

// Search functionality
export async function searchTodos(searchData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return { error: 'Unauthorized' }
    }

    const validatedData = searchTodoSchema.parse(searchData)
    
    let whereConditions = [eq(todos.userId, parseInt(session.user.id))]
    
    // Text search
    if (validatedData.query) {
      whereConditions.push(
        or(
          like(todos.title, `%${validatedData.query}%`),
          like(todos.description, `%${validatedData.query}%`)
        )
      )
    }
    
    // Filters
    if (validatedData.filters) {
      const { completed, priority, tags, dueDate } = validatedData.filters
      
      if (completed !== undefined) {
        whereConditions.push(eq(todos.completed, completed))
      }
      
      if (priority) {
        whereConditions.push(eq(todos.priority, priority))
      }
      
      if (tags && tags.length > 0) {
        // Note: This is a simplified tag search. For production, consider using a more sophisticated approach
        whereConditions.push(
          // This would need to be adjusted based on your database's JSON search capabilities
          like(todos.tags, `%${tags[0]}%`)
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
    }
    
    const searchResults = await db.select()
      .from(todos)
      .where(and(...whereConditions))
      .orderBy(desc(todos.createdAt))
    
    return { todos: searchResults }
  } catch (error) {
    if (error.name === 'ZodError') {
      return { error: 'Validation failed', details: error.errors }
    }
    return { error: 'Failed to search todos' }
  }
}

// Export functionality
export async function exportTodos(format = 'json') {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return { error: 'Unauthorized' }
    }

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
      
      return { 
        success: true, 
        data: csvContent, 
        filename: `todos-${new Date().toISOString().split('T')[0]}.csv`,
        contentType: 'text/csv'
      }
    } else {
      return { 
        success: true, 
        data: JSON.stringify(userTodos, null, 2),
        filename: `todos-${new Date().toISOString().split('T')[0]}.json`,
        contentType: 'application/json'
      }
    }
  } catch (error) {
    return { error: 'Failed to export todos' }
  }
} 