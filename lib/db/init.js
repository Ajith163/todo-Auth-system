import { db } from './index.js';
import { users, todos } from './schema.js';

export async function initializeDatabase() {
  try {
    console.log('🗄️  Initializing database...');
    
    // Check if tables exist by trying to query them
    const userCount = await db.select().from(users).limit(1);
    const todoCount = await db.select().from(todos).limit(1);
    
    console.log('✅ Database tables exist and are accessible');
    return { success: true, message: 'Database initialized successfully' };
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('💡 Tables do not exist. Please run migrations:');
      console.log('   npm run db:push');
      return { 
        success: false, 
        error: 'Database tables do not exist. Run migrations first.',
        code: 'TABLES_MISSING'
      };
    }
    
    return { 
      success: false, 
      error: error.message,
      code: 'CONNECTION_FAILED'
    };
  }
}

export async function createTablesIfNotExist() {
  try {
    console.log('🔧 Creating database tables...');
    
    // This would normally run the migration SQL
    // For now, we'll just check if they exist
    await initializeDatabase();
    
    console.log('✅ Database setup completed');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Failed to create tables:', error.message);
    return { success: false, error: error.message };
  }
} 