import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// GET - Get specific user
export async function GET(request, { params }) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { id } = params

    // Get user by ID
    const user = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1)
    
    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: user[0] })

  } catch (error) {
    console.error('Error getting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update user
export async function PATCH(request, { params }) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { id } = params
    const { email, role } = await request.json()

    // Validate input
    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
    }

    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be "user" or "admin"' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1)
    
    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email is already taken by another user
    if (email !== existingUser[0].email) {
      const emailExists = await db.select().from(users).where(eq(users.email, email)).limit(1)
      if (emailExists.length > 0) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
    }

    // Update user
    const updatedUser = await db.update(users)
      .set({ 
        email: email,
        role: role,
        approved: true // Keep them approved when updating
      })
      .where(eq(users.id, parseInt(id)))
      .returning()

    return NextResponse.json({ 
      message: 'User updated successfully',
      user: {
        id: updatedUser[0].id,
        email: updatedUser[0].email,
        role: updatedUser[0].role,
        approved: updatedUser[0].approved
      }
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete user
export async function DELETE(request, { params }) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { id } = params

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1)
    
    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent admin from deleting themselves
    if (existingUser[0].email === session.user.email) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // First, delete all todos associated with this user
    const { todos } = await import('@/lib/db/schema')
    const { eq } = await import('drizzle-orm')
    
    const deletedTodos = await db.delete(todos)
      .where(eq(todos.userId, parseInt(id)))
      .returning()

    console.log(`Deleted ${deletedTodos.length} todos for user ${id}`)

    // Then delete the user
    const deletedUser = await db.delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning()

    return NextResponse.json({ 
      message: 'User and associated todos deleted successfully',
      deletedTodosCount: deletedTodos.length,
      deletedUser: {
        id: deletedUser[0].id,
        email: deletedUser[0].email
      }
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 