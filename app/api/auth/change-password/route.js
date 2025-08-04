import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDatabase } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        error: 'Current password and new password are required' 
      }, { status: 400 })
    }

    // Validate new password strength
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumbers = /\d/.test(newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    
    if (newPassword.length < minLength) {
      return NextResponse.json({ 
        error: `Password must be at least ${minLength} characters long` 
      }, { status: 400 })
    }
    if (!hasUpperCase) {
      return NextResponse.json({ 
        error: 'Password must contain at least one uppercase letter' 
      }, { status: 400 })
    }
    if (!hasLowerCase) {
      return NextResponse.json({ 
        error: 'Password must contain at least one lowercase letter' 
      }, { status: 400 })
    }
    if (!hasNumbers) {
      return NextResponse.json({ 
        error: 'Password must contain at least one number' 
      }, { status: 400 })
    }
    if (!hasSpecialChar) {
      return NextResponse.json({ 
        error: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)' 
      }, { status: 400 })
    }

    const database = await getDatabase()
    
    // Get current user
    const currentUser = await database.select()
      .from(users)
      .where(eq(users.id, parseInt(session.user.id)))
      .limit(1)

    if (currentUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser[0].password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ 
        error: 'Current password is incorrect' 
      }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await database.update(users)
      .set({ password: hashedNewPassword })
      .where(eq(users.id, parseInt(session.user.id)))

    return NextResponse.json({ 
      success: true,
      message: 'Password changed successfully' 
    })

  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ 
      error: 'Failed to change password' 
    }, { status: 500 })
  }
} 