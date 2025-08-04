import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function GET() {
  try {
    console.log('🧪 Testing database connection...');
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL is not configured' },
        { status: 500 }
      );
    }

    const client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      connect_timeout: 10,
      idle_timeout: 20,
    });

    console.log('✅ Database connection established');

    // Test if users table exists
    let usersExist = false;
    let todosExist = false;
    
    try {
      const result = await client`SELECT COUNT(*) as count FROM users`;
      usersExist = true;
      console.log(`✅ Users table exists with ${result[0].count} records`);
    } catch (error) {
      if (error.code === '42P01') {
        console.log('❌ Users table does not exist');
        usersExist = false;
      } else {
        throw error;
      }
    }

    try {
      const result = await client`SELECT COUNT(*) as count FROM todos`;
      todosExist = true;
      console.log(`✅ Todos table exists with ${result[0].count} records`);
    } catch (error) {
      if (error.code === '42P01') {
        console.log('❌ Todos table does not exist');
        todosExist = false;
      } else {
        throw error;
      }
    }

    await client.end();

    return NextResponse.json(
      { 
        message: 'Database test completed',
        connection: 'success',
        usersTable: usersExist ? 'exists' : 'missing',
        todosTable: todosExist ? 'exists' : 'missing',
        needsSetup: !usersExist || !todosExist
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return NextResponse.json(
      { 
        error: 'Database test failed', 
        details: error.message,
        connection: 'failed'
      },
      { status: 500 }
    );
  }
} 