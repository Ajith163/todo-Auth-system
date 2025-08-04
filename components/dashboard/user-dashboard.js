'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { pusherClient } from '@/lib/pusher'
import { CheckCircle, Circle, Plus, LogOut, User, Trash2 } from 'lucide-react'
import { todoFormSchema } from '@/lib/validations/todo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { TodoSkeleton, StatsSkeleton, FormSkeleton } from '@/components/ui/loading-skeleton'
import { createTodo, updateTodo, deleteTodo, toggleTodo, getTodos } from '@/app/actions/todos'

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const [todos, setTodos] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'completed', 'pending'
  const [error, setError] = useState(null)
  const { toast } = useToast()

  // Form setup with react-hook-form and zod validation
  const form = useForm({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
    },
    mode: 'onChange', // Enable real-time validation
  })

  useEffect(() => {
    // Only load data if session is authenticated
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      setIsInitialLoading(false)
      return
    }

    const loadData = async () => {
      try {
        setError(null)
        await fetchTodos()
      } catch (err) {
        console.error('Dashboard load error:', err)
        setError('Failed to load dashboard data')
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        })
      } finally {
        setIsInitialLoading(false)
      }
    }
    
    if (session?.user?.id) {
      loadData()
    }
    
    // Subscribe to real-time updates if Pusher is configured
    if (pusherClient && session?.user?.id) {
      const channel = pusherClient.subscribe('todos')
      
      channel.bind('todo-completed', (data) => {
        if (data.userId !== session?.user?.id) {
          toast({
            title: 'Task Completed',
            description: `User ${data.userEmail} completed a task!`,
          })
        }
      })

      return () => {
        pusherClient.unsubscribe('todos')
      }
    }
  }, [session?.user?.id, status])

  // Check for due date notifications
  useEffect(() => {
    if (!todos || !Array.isArray(todos) || todos.length === 0) return

    const checkDueDates = () => {
      const now = new Date()
      const overdueTodos = todos.filter(todo => 
        todo && todo.dueDate && 
        new Date(todo.dueDate) < now && 
        !todo.completed
      )
      
      overdueTodos.forEach(todo => {
        if (todo && todo.title) {
          toast({
            title: 'Task Overdue!',
            description: `"${todo.title}" is overdue. Please complete it soon.`,
            variant: 'destructive',
          })
        }
      })
    }

    // Check every 5 minutes
    const interval = setInterval(checkDueDates, 5 * 60 * 1000)
    
    // Initial check
    checkDueDates()

    return () => clearInterval(interval)
  }, [todos])

  const fetchTodos = async () => {
    try {
      console.log('Fetching todos for user:', session?.user?.id)
      const result = await getTodos()
      console.log('Fetch result:', result)
      
      // Ensure result is defined and has expected structure
      if (result && Array.isArray(result.todos)) {
        setTodos(result.todos)
      } else if (result && result.error) {
        console.error('Fetch error:', result.error)
        setError(result.error)
        setTodos([])
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        // Handle case where result is undefined or doesn't have expected properties
        console.warn('Unexpected fetch result:', result)
        setTodos([])
        setError('Failed to fetch todos')
      }
    } catch (error) {
      console.error('Fetch todos error:', error)
      setError('Failed to fetch todos')
      setTodos([])
      toast({
        title: 'Error',
        description: 'Failed to fetch todos',
        variant: 'destructive',
      })
    }
  }

  const addTodo = async (data) => {
    setIsLoading(true)
    try {
      console.log('Creating todo with data:', data)
      // Create FormData for server action
      const formData = new FormData()
      formData.append('title', data.title.trim())
      formData.append('description', data.description.trim())
      formData.append('dueDate', data.dueDate && data.dueDate.trim() ? data.dueDate : '')

      const result = await createTodo(formData)
      console.log('Create result:', result)
      
      if (result && result.success) {
        form.reset()
        await fetchTodos()
        toast({
          title: 'Success',
          description: 'Todo created successfully!',
        })
      } else {
        const errorMessage = result?.error || 'Failed to create todo.'
        console.error('Create todo error:', errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Create todo exception:', error)
      toast({
        title: 'Error',
        description: 'Failed to create todo.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleTodo = async (todoId, completed) => {
    try {
      console.log('Toggling todo:', todoId, 'to completed:', !completed)
      const result = await toggleTodo(todoId, !completed)
      console.log('Toggle result:', result)
      
      if (result && result.success) {
        await fetchTodos()
        
        // Notify admin if task is completed and Pusher is configured
        if (!completed) {
          const { pusher } = await import('@/lib/pusher')
          if (pusher) {
            await pusher.trigger('todos', 'todo-completed', {
              userId: session?.user?.id,
              userEmail: session?.user?.email,
            })
          }
        }
      } else {
        const errorMessage = result?.error || 'Failed to update todo'
        console.error('Toggle error:', errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Toggle todo exception:', error)
      toast({
        title: 'Error',
        description: 'Failed to update todo',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteTodo = async (todoId) => {
    try {
      console.log('Deleting todo:', todoId)
      const result = await deleteTodo(todoId)
      console.log('Delete result:', result)
      
      if (result && result.success) {
        await fetchTodos()
        toast({
          title: 'Success',
          description: 'Todo deleted successfully!',
        })
      } else {
        const errorMessage = result?.error || 'Failed to delete todo'
        console.error('Delete error:', errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Delete todo exception:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete todo.',
        variant: 'destructive',
      })
    }
  }

  // Ensure todos is always an array
  const safeTodos = Array.isArray(todos) ? todos : []
  
  const filteredTodos = safeTodos.filter(todo => {
    if (!todo) return false
    if (filter === 'completed') return todo.completed
    if (filter === 'pending') return !todo.completed
    if (filter === 'overdue') return !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date()
    return true
  })

  const completedCount = safeTodos.filter(todo => todo && todo.completed).length
  const totalCount = safeTodos.length

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/auth/signin',
        redirect: true 
      })
    } catch (error) {
      // Fallback: redirect manually
      window.location.href = '/auth/signin'
    }
  }

  // Show loading state while session is loading
  if (status === 'loading' || isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container-mobile max-w-4xl mx-auto py-4 sm:py-8">
          <StatsSkeleton />
          <FormSkeleton />
          <div className="space-mobile">
            {Array.from({ length: 3 }).map((_, index) => (
              <TodoSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container-mobile max-w-4xl mx-auto py-4 sm:py-8">
          <Card>
            <CardContent className="card-mobile text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Dashboard Error</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={fetchTodos} className="btn-mobile">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-mobile max-w-4xl mx-auto py-4 sm:py-8">
        {/* Header */}
        <div className="flex-mobile justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-mobile-xl font-bold text-gray-900 dark:text-white">
              My Todo Dashboard
            </h1>
            <p className="text-mobile text-gray-600 dark:text-gray-400 mt-2">
              Welcome back, {session?.user?.email || 'User'}
            </p>
          </div>
          <div className="nav-mobile">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4" />
              {session?.user?.role || 'user'}
            </div>
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="btn-mobile"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="mobile-hidden">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-mobile mb-6 sm:mb-8">
          <Card>
            <CardContent className="card-mobile">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Tasks
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(safeTodos) ? safeTodos.length : 0}
                  </p>
                </div>
                <div className="text-blue-600">
                  <span className="text-2xl">•</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="card-mobile">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {Array.isArray(safeTodos) ? safeTodos.filter(todo => todo && todo.completed).length : 0}
                  </p>
                </div>
                <div className="text-green-600">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="card-mobile">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Array.isArray(safeTodos) && safeTodos.length > 0 ? Math.round((safeTodos.filter(todo => todo && todo.completed).length / safeTodos.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Todo Form */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-mobile-lg">Create New Todo</CardTitle>
            <CardDescription className="text-mobile">
              Create a new task to track your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(addTodo)} className="space-y-4">
              {/* Title and Create Button Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <Input
                    id="title"
                    {...form.register('title')}
                    placeholder="Enter todo title..."
                    disabled={isLoading}
                    className={`input-mobile ${form.formState.errors.title ? 'border-red-500' : ''}`}
                  />
                  {form.formState.errors.title && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <Button 
                    type="submit" 
                    disabled={isLoading || !form.watch('title') || !form.watch('description')}
                    className="btn-mobile"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isLoading ? 'Creating...' : 'Create Todo'}
                  </Button>
                </div>
              </div>
              
              {/* Description and Due Date Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Enter todo description..."
                    disabled={isLoading}
                    className={`input-mobile resize-none w-full ${
                      form.formState.errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows="4"
                  />
                  {form.formState.errors.description && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date (Optional)
                  </label>
                  <input
                    id="dueDate"
                    type="datetime-local"
                    {...form.register('dueDate')}
                    disabled={isLoading}
                    className={`input-mobile w-full ${
                      form.formState.errors.dueDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {form.formState.errors.dueDate && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.dueDate.message}</p>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Click the circle button to toggle task completion
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="btn-mobile"
            >
              All ({Array.isArray(safeTodos) ? safeTodos.length : 0})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              className="btn-mobile"
            >
              Pending ({Array.isArray(safeTodos) ? safeTodos.length - completedCount : 0})
            </Button>
            <Button
              variant={filter === 'overdue' ? 'default' : 'outline'}
              onClick={() => setFilter('overdue')}
              className="btn-mobile"
            >
              Overdue ({Array.isArray(safeTodos) ? safeTodos.filter(todo => todo && !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date()).length : 0})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilter('completed')}
              className="btn-mobile"
            >
              Completed ({completedCount})
            </Button>
          </div>
        </div>

        {/* Todos List */}
        <div className="space-mobile">
          {(!Array.isArray(filteredTodos) || filteredTodos.length === 0) ? (
            <Card>
              <CardContent className="card-mobile text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {filter === 'all' 
                    ? 'No todos yet. Create your first todo above!'
                    : filter === 'completed'
                    ? 'No completed todos yet.'
                    : filter === 'pending'
                    ? 'No pending todos. Great job!'
                    : 'No overdue todos. Keep it up!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            (Array.isArray(filteredTodos) ? filteredTodos : []).map((todo) => (
              <Card key={todo.id} className="hover:shadow-md transition-shadow">
                <CardContent className="card-mobile">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleTodo(todo.id, todo.completed)}
                      className="flex-shrink-0 touch-friendly mt-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      disabled={isLoading}
                      aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {todo.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex-mobile justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-mobile font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${todo.completed ? 'line-through' : ''}`}>
                              {todo.description}
                            </p>
                          )}
                          {todo.dueDate && (
                            <p className={`text-xs mt-2 ${
                              new Date(todo.dueDate) < new Date() && !todo.completed
                                ? 'text-red-600'
                                : 'text-gray-500'
                            }`}>
                              Due: {new Date(todo.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTodo(todo.id)}
                            disabled={isLoading}
                            className="touch-friendly"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 