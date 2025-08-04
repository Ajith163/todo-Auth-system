const { todoFormSchema } = require('../lib/validations/todo.js')

function testValidation() {
  console.log('🧪 Testing Todo Form Validation...\n')

  // Test cases
  const testCases = [
    {
      name: 'Valid todo data',
      data: {
        title: 'Test Todo',
        description: 'This is a valid description with more than 10 characters',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      },
      shouldPass: true
    },
    {
      name: 'Missing title',
      data: {
        description: 'This is a valid description',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      },
      shouldPass: false
    },
    {
      name: 'Title too short',
      data: {
        title: 'Hi',
        description: 'This is a valid description',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      },
      shouldPass: false
    },
    {
      name: 'Missing description',
      data: {
        title: 'Test Todo',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      },
      shouldPass: false
    },
    {
      name: 'Description too short',
      data: {
        title: 'Test Todo',
        description: 'Short',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      },
      shouldPass: false
    },
    {
      name: 'Missing due date',
      data: {
        title: 'Test Todo',
        description: 'This is a valid description with more than 10 characters'
      },
      shouldPass: false
    },
    {
      name: 'Due date in the past',
      data: {
        title: 'Test Todo',
        description: 'This is a valid description with more than 10 characters',
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      },
      shouldPass: false
    }
  ]

  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`)
    
    try {
      const result = todoFormSchema.safeParse(testCase.data)
      
      if (result.success === testCase.shouldPass) {
        console.log('✅ PASS')
      } else {
        console.log('❌ FAIL')
        if (!result.success) {
          console.log('Validation errors:', result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`))
        }
      }
    } catch (error) {
      console.log('❌ ERROR:', error.message)
    }
    
    console.log('')
  })

  console.log('🎉 Validation tests completed!')
}

testValidation() 