'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function approveUser(userId) {
  try {
    console.log('🔍 Approving user:', userId)
    const session = await getServerSession(authOptions)
    
    console.log('📊 Session data:', session ? {
      id: session.user?.id,
      email: session.user?.email,
      role: session.user?.role
    } : 'No session')
    
    if (!session) {
      console.error('❌ No session found')
      return { error: 'No session found - Please log in again' }
    }
    
    if (!session.user) {
      console.error('❌ Session has no user data')
      return { error: 'Invalid session - Please log in again' }
    }
    
    if (session.user.role !== 'admin') {
      console.error('❌ User is not admin:', session.user.role)
      return { error: 'Admin access required' }
    }

    const database = await getDatabase()
    const updatedUser = await database.update(users)
      .set({ 
        approved: true, 
        rejected: false,
        updatedAt: new Date() 
      })
      .where(eq(users.id, parseInt(userId)))
      .returning()

    if (updatedUser.length === 0) {
      console.error('❌ User not found:', userId)
      return { error: 'User not found' }
    }

    console.log('✅ User approved successfully:', updatedUser[0].email)
    revalidatePath('/dashboard')
    return { success: true, user: updatedUser[0] }
  } catch (error) {
    console.error('❌ Approve user error:', error)
    return { error: 'Failed to approve user: ' + error.message }
  }
}

export async function rejectUser(userId) {
  try {
    console.log('🔍 Rejecting user:', userId)
    const session = await getServerSession(authOptions)
    
    console.log('📊 Session data:', session ? {
      id: session.user?.id,
      email: session.user?.email,
      role: session.user?.role
    } : 'No session')
    
    if (!session) {
      console.error('❌ No session found')
      return { error: 'No session found - Please log in again' }
    }
    
    if (!session.user) {
      console.error('❌ Session has no user data')
      return { error: 'Invalid session - Please log in again' }
    }
    
    if (session.user.role !== 'admin') {
      console.error('❌ User is not admin:', session.user.role)
      return { error: 'Admin access required' }
    }

    const database = await getDatabase()
    const updatedUser = await database.update(users)
      .set({ 
        approved: false, 
        rejected: true,
        updatedAt: new Date() 
      })
      .where(eq(users.id, parseInt(userId)))
      .returning()

    if (updatedUser.length === 0) {
      console.error('❌ User not found:', userId)
      return { error: 'User not found' }
    }

    console.log('✅ User rejected successfully:', updatedUser[0].email)
    revalidatePath('/dashboard')
    return { success: true, user: updatedUser[0] }
  } catch (error) {
    console.error('❌ Reject user error:', error)
    return { error: 'Failed to reject user: ' + error.message }
  }
}

export async function switchUserRole(userId, newRole) {
  try {
    console.log('🔍 Switching user role:', userId, 'to', newRole)
    const session = await getServerSession(authOptions)
    
    console.log('📊 Session data:', session ? {
      id: session.user?.id,
      email: session.user?.email,
      role: session.user?.role
    } : 'No session')
    
    if (!session) {
      console.error('❌ No session found')
      return { error: 'No session found - Please log in again' }
    }
    
    if (!session.user) {
      console.error('❌ Session has no user data')
      return { error: 'Invalid session - Please log in again' }
    }
    
    if (session.user.role !== 'admin') {
      console.error('❌ User is not admin:', session.user.role)
      return { error: 'Admin access required' }
    }

    if (!['user', 'admin'].includes(newRole)) {
      console.error('❌ Invalid role:', newRole)
      return { error: 'Invalid role' }
    }

    const database = await getDatabase()
    const updatedUser = await database.update(users)
      .set({ 
        role: newRole, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, parseInt(userId)))
      .returning()

    if (updatedUser.length === 0) {
      console.error('❌ User not found:', userId)
      return { error: 'User not found' }
    }

    console.log('✅ User role switched successfully:', updatedUser[0].email, 'to', newRole)
    revalidatePath('/dashboard')
    return { success: true, user: updatedUser[0] }
  } catch (error) {
    console.error('❌ Switch user role error:', error)
    return { error: 'Failed to switch user role: ' + error.message }
  }
}

export async function getAllUsers() {
  try {
    console.log('🔍 Fetching all users...')
    const session = await getServerSession(authOptions)
    
    console.log('📊 Session data:', session ? {
      id: session.user?.id,
      email: session.user?.email,
      role: session.user?.role,
      approved: session.user?.approved
    } : 'No session')
    
    if (!session) {
      console.error('❌ No session found')
      return { error: 'No session found - Please log in again' }
    }
    
    if (!session.user) {
      console.error('❌ Session has no user data')
      return { error: 'Invalid session - Please log in again' }
    }
    
    if (session.user.role !== 'admin') {
      console.error('❌ User is not admin:', session.user.role)
      return { error: 'Admin access required' }
    }

    const database = await getDatabase()
    const allUsers = await database.select()
      .from(users)
      .orderBy(users.createdAt)

    console.log('✅ Fetched users successfully:', allUsers.length, 'users')
    return { users: allUsers }
  } catch (error) {
    console.error('❌ Get all users error:', error)
    return { error: 'Failed to fetch users: ' + error.message }
  }
}

export async function deleteUser(userId) {
  try {
    console.log('🔍 Deleting user:', userId)
    const session = await getServerSession(authOptions)
    
    console.log('📊 Session data:', session ? {
      id: session.user?.id,
      email: session.user?.email,
      role: session.user?.role
    } : 'No session')
    
    if (!session) {
      console.error('❌ No session found')
      return { error: 'No session found - Please log in again' }
    }
    
    if (!session.user) {
      console.error('❌ Session has no user data')
      return { error: 'Invalid session - Please log in again' }
    }
    
    if (session.user.role !== 'admin') {
      console.error('❌ User is not admin:', session.user.role)
      return { error: 'Admin access required' }
    }

    const database = await getDatabase()
    
    // Check if user exists
    const existingUser = await database.select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1)

    if (existingUser.length === 0) {
      console.error('❌ User not found:', userId)
      return { error: 'User not found' }
    }

    // Prevent admin from deleting themselves
    if (existingUser[0].email === session.user.email) {
      console.error('❌ Admin trying to delete themselves')
      return { error: 'Cannot delete your own account' }
    }

    // First, delete all todos associated with this user
    const { todos } = await import('@/lib/db/schema')
    
    const deletedTodos = await database.delete(todos)
      .where(eq(todos.userId, parseInt(userId)))
      .returning()

    console.log('🗑️ Deleted todos:', deletedTodos.length)

    // Then delete the user
    const deletedUser = await database.delete(users)
      .where(eq(users.id, parseInt(userId)))
      .returning()

    console.log('✅ User deleted successfully:', deletedUser[0].email)
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
    console.error('❌ Delete user error:', error)
    return { error: 'Failed to delete user: ' + error.message }
  }
} 