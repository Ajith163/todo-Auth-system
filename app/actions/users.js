'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function approveUser(userId) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return { error: 'Unauthorized' }
    }

    const updatedUser = await db.update(users)
      .set({ 
        approved: true, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, parseInt(userId)))
      .returning()

    if (updatedUser.length === 0) {
      return { error: 'User not found' }
    }

    revalidatePath('/dashboard')
    return { success: true, user: updatedUser[0] }
  } catch (error) {
    console.error('Error approving user:', error)
    return { error: 'Failed to approve user' }
  }
}

export async function rejectUser(userId) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return { error: 'Unauthorized' }
    }

    const updatedUser = await db.update(users)
      .set({ 
        approved: false, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, parseInt(userId)))
      .returning()

    if (updatedUser.length === 0) {
      return { error: 'User not found' }
    }

    revalidatePath('/dashboard')
    return { success: true, user: updatedUser[0] }
  } catch (error) {
    console.error('Error rejecting user:', error)
    return { error: 'Failed to reject user' }
  }
}

export async function switchUserRole(userId, newRole) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return { error: 'Unauthorized' }
    }

    if (!['user', 'admin'].includes(newRole)) {
      return { error: 'Invalid role' }
    }

    const updatedUser = await db.update(users)
      .set({ 
        role: newRole, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, parseInt(userId)))
      .returning()

    if (updatedUser.length === 0) {
      return { error: 'User not found' }
    }

    revalidatePath('/dashboard')
    return { success: true, user: updatedUser[0] }
  } catch (error) {
    console.error('Error switching user role:', error)
    return { error: 'Failed to switch user role' }
  }
}

export async function getAllUsers() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return { error: 'Unauthorized' }
    }

    const allUsers = await db.select()
      .from(users)
      .orderBy(users.createdAt)

    return { users: allUsers }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { error: 'Failed to fetch users' }
  }
}

export async function deleteUser(userId) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return { error: 'Unauthorized' }
    }

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1)

    if (existingUser.length === 0) {
      return { error: 'User not found' }
    }

    // Prevent admin from deleting themselves
    if (existingUser[0].email === session.user.email) {
      return { error: 'Cannot delete your own account' }
    }

    // First, delete all todos associated with this user
    const { todos } = await import('@/lib/db/schema')
    
    const deletedTodos = await db.delete(todos)
      .where(eq(todos.userId, parseInt(userId)))
      .returning()

    console.log(`Deleted ${deletedTodos.length} todos for user ${userId}`)

    // Then delete the user
    const deletedUser = await db.delete(users)
      .where(eq(users.id, parseInt(userId)))
      .returning()

    revalidatePath('/dashboard')
    return { 
      success: true, 
      message: 'User and associated todos deleted successfully',
      deletedTodosCount: deletedTodos.length,
      deletedUser: {
        id: deletedUser[0].id,
        email: deletedUser[0].email
      }
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { error: 'Failed to delete user' }
  }
} 