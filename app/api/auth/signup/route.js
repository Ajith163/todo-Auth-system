import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDatabase } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    console.log('Signup attempt for:', email)

    // Get initialized database
    const db = await getDatabase()

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
    
    if (existingUser.length > 0) {
      console.log('User already exists:', email)
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    console.log('Hashing password...')
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('Password hashed successfully')

    console.log('Creating user in database...')
    // Create user
    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      role: 'user',
      approved: false,
    }).returning()

    console.log('User created successfully:', newUser[0].id)

    return NextResponse.json(
      { message: 'User created successfully', user: { id: newUser[0].id, email: newUser[0].email } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error details:')
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
} 