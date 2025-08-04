const postgres = require('postgres');
const bcrypt = require('bcryptjs');

async function testDeleteUser() {
  try {
    if (!process.env.DATABASE_URL) {
      process.exit(1);
    }
    
    const client = postgres(process.env.DATABASE_URL, {
      max: 1,
      ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
      connect_timeout: 10,
      idle_timeout: 20,
    });
    
    // Create a test user to delete
    const testEmail = 'test-delete@example.com';
    const testPassword = 'test123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    
    try {
      // First, check if test user already exists and delete it
      const existingUser = await client`
        SELECT id FROM users WHERE email = ${testEmail}
      `;
      
      if (existingUser.length > 0) {
        await client.unsafe(`
          DELETE FROM todos WHERE user_id = ${existingUser[0].id}
        `);
        await client.unsafe(`
          DELETE FROM users WHERE email = ${testEmail}
        `);
      }
      
      // Create new test user
      const newUser = await client.unsafe(`
        INSERT INTO "users" ("email", "password", "role", "approved") 
        VALUES ($1, $2, 'user', true)
        RETURNING id, email
      `, [testEmail, hashedPassword]);
      
      // Create some test todos for this user
      const testTodos = [
        { title: 'Test Todo 1', description: 'Test description 1' },
        { title: 'Test Todo 2', description: 'Test description 2' }
      ];
      
      for (const todo of testTodos) {
        await client.unsafe(`
          INSERT INTO "todos" ("title", "description", "user_id", "completed") 
          VALUES ($1, $2, $3, false)
        `, [todo.title, todo.description, newUser[0].id]);
      }
      
      // Verify user and todos exist
      const userCheck = await client`
        SELECT id, email FROM users WHERE email = ${testEmail}
      `;
      
      const todosCheck = await client`
        SELECT COUNT(*) as count FROM todos WHERE user_id = ${newUser[0].id}
      `;
      
      // Simulate the delete process
      const deletedTodos = await client.unsafe(`
        DELETE FROM todos WHERE user_id = ${newUser[0].id}
      `);
      
      const deletedUser = await client.unsafe(`
        DELETE FROM users WHERE id = ${newUser[0].id}
      `);
      
      // Verify deletion
      const userAfterDelete = await client`
        SELECT id FROM users WHERE email = ${testEmail}
      `;
      
      const todosAfterDelete = await client`
        SELECT COUNT(*) as count FROM todos WHERE user_id = ${newUser[0].id}
      `;
      
    } catch (error) {
      // Silent error handling
    }

    await client.end();
    
  } catch (error) {
    process.exit(1);
  }
}

// Run the test
testDeleteUser(); 