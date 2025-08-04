const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv/config');

async function checkSchema() {
  try {
    console.log('Checking database schema...');
    
    const connectionString = process.env.DATABASE_URL;
    const client = postgres(connectionString, { max: 1 });
    
    // Check todos table structure
    const result = await client`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'todos' 
      ORDER BY ordinal_position
    `;
    
    console.log('\nTodos table columns:');
    console.log('Total columns found:', result.length);
    result.forEach((col, index) => {
      console.log(`${index + 1}. ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check if due_date column exists
    const hasDueDate = result.some(col => col.column_name === 'due_date');
    console.log(`\ndue_date column exists: ${hasDueDate ? 'YES' : 'NO'}`);
    
    // Check for all expected columns
    const expectedColumns = ['id', 'title', 'description', 'completed', 'due_date', 'user_id', 'created_at', 'updated_at'];
    const missingColumns = expectedColumns.filter(col => !result.some(r => r.column_name === col));
    
    if (missingColumns.length > 0) {
      console.log('\n⚠️  MISSING COLUMNS:', missingColumns);
      console.log('This is why add todo is failing.');
    } else {
      console.log('\n✅ All expected columns exist - add todo should work now!');
    }
    
    // Show actual columns vs expected
    console.log('\nExpected columns:', expectedColumns);
    console.log('Actual columns:', result.map(r => r.column_name));
    
    process.exit(0);
    
  } catch (error) {
    console.error('Schema check failed:', error);
    process.exit(1);
  }
}

checkSchema(); 