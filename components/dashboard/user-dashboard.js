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
import { CheckCircle, Circle, Plus, LogOut, User } from 'lucide-react'
import { todoFormSchema } from '@/lib/validations/todo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { TodoSkeleton, StatsSkeleton, FormSkeleton } from '@/components/ui/loading-skeleton'
import { createTodo, updateTodo, deleteTodo, toggleTodo, getTodos } from '@/app/actions/todos'

export default function UserDashboard() {
  const { data: session } = useSession()
  const [todos, setTodos] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'completed', 'pending'
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
    const loadData = async () => {
      try {
        await fetchTodos()
      } finally {
        setIsInitialLoading(false)
      }
    }
    
    loadData()
    
    // Subscribe to real-time updates if Pusher is configured
    if (pusherClient) {
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
  }, [session?.user?.id])

  // Check for due date notifications
  useEffect(() => {
    const checkDueDates = () => {
      const now = new Date()
      const overdueTodos = todos.filter(todo => 
        todo.dueDate && 
        new Date(todo.dueDate) < now && 
        !todo.completed
      )
      
      overdueTodos.forEach(todo => {
        toast({
          title: 'Task Overdue!',
          description: `"${todo.title}" is overdue. Please complete it soon.`,
          variant: 'destructive',
        })
      })
    }

    // Check every 5 minutes
    const interval = setInterval(checkDueDates, 5 * 60 * 1000)
    
    // Initial check
    if (todos.length > 0) {
      checkDueDates()
    }

    return () => clearInterval(interval)
  }, [todos])

  const fetchTodos = async () => {
    try {
      const result = await getTodos()
      if (result.todos) {
        setTodos(result.todos)
      } else if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching todos:', error)
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
      // Create FormData for server action
      const formData = new FormData()
      formData.append('title', data.title.trim())
      formData.append('description', data.description.trim())
      formData.append('dueDate', data.dueDate && data.dueDate.trim() ? data.dueDate : '')

      const result = await createTodo(formData)
      
      if (result.success) {
        form.reset()
        fetchTodos()
        toast({
          title: 'Success',
          description: 'Todo added successfully!',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to add todo.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add todo.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleTodo = async (todoId, completed) => {
    try {
      const result = await toggleTodo(todoId, !completed)
      
      if (result.success) {
        fetchTodos()
        
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
        toast({
          title: 'Error',
          description: result.error || 'Failed to update todo',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating todo:', error)
      toast({
        title: 'Error',
        description: 'Failed to update todo',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteTodo = async (todoId) => {
    try {
      const result = await deleteTodo(todoId)
      
      if (result.success) {
        fetchTodos()
        toast({
          title: 'Success',
          description: 'Todo deleted successfully!',
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete todo',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete todo.',
        variant: 'destructive',
      })
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed
    if (filter === 'pending') return !todo.completed
    if (filter === 'overdue') return !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date()
    return true
  })

  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length

  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/auth/signin',
        redirect: true 
      })
    } catch (error) {
      console.error('Signout error:', error)
      // Fallback: redirect manually
      window.location.href = '/auth/signin'
    }
  }

  const goToSignOutPage = () => {
    window.location.href = '/auth/signout'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Todo Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back, {session?.user?.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4" />
              {session?.user?.role}
            </div>
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats */}
        {isInitialLoading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                         <Card>
               <CardContent className="p-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                       Total Tasks
                     </p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">
                       {totalCount}
                     </p>
                   </div>
                                       <div className="text-blue-600">
                      <span className="text-2xl">•</span>
                    </div>
                 </div>
               </CardContent>
             </Card>
                         <Card>
               <CardContent className="p-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                       Completed
                     </p>
                     <p className="text-2xl font-bold text-green-600">
                       {completedCount}
                     </p>
                   </div>
                   <div className="text-green-600">
                     <CheckCircle className="w-8 h-8" />
                   </div>
                 </div>
               </CardContent>
             </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Completion Rate
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Todo Form */}
        {isInitialLoading ? (
          <FormSkeleton />
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Todo</CardTitle>
              <CardDescription>
                Create a new task to track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(addTodo)} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <Input
                    id="title"
                    {...form.register('title')}
                    placeholder="Enter todo title..."
                    disabled={isLoading}
                    className={form.formState.errors.title ? 'border-red-500' : ''}
                  />
                  {form.formState.errors.title && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <Button 
                    type="submit" 
                    disabled={isLoading || !form.watch('title') || !form.watch('description')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isLoading ? 'Adding...' : 'Add Todo'}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Enter todo description..."
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 resize-none ${
                      form.formState.errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows="3"
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 ${
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
        )}

        {/* Filter */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Click the circle button to toggle task completion
          </p>
          <div className="flex gap-2">
                      <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All ({totalCount})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
            >
              Pending ({totalCount - completedCount})
            </Button>
            <Button
              variant={filter === 'overdue' ? 'default' : 'outline'}
              onClick={() => setFilter('overdue')}
            >
              Overdue ({todos.filter(todo => !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date()).length})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilter('completed')}
            >
              Completed ({completedCount})
            </Button>
          </div>
        </div>

        {/* Todos List */}
        <div className="space-y-4">
          {isInitialLoading ? (
            // Show loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <TodoSkeleton key={index} />
            ))
          ) : filteredTodos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {filter === 'all' 
                    ? 'No todos yet. Create your first one!' 
                    : `No ${filter} todos.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTodos.map((todo) => (
              <Card key={todo.id} className={`transition-all ${todo.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => handleToggleTodo(todo.id, todo.completed)}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                          todo.completed 
                            ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-700' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {todo.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                            {todo.title}
                          </h3>
                        </div>
                        {todo.description && (
                          <p className={`text-sm mt-1 ${todo.completed ? 'text-gray-500 line-through' : 'text-gray-600 dark:text-gray-400'}`}>
                            {todo.description}
                          </p>
                        )}
                                                 <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                           <span>Created: {new Date(todo.createdAt).toLocaleDateString()}</span>
                           {todo.dueDate && (
                             <span className={`${
                               new Date(todo.dueDate) < new Date() && !todo.completed 
                                 ? 'text-red-600 font-medium' 
                                 : 'text-gray-500'
                             }`}>
                               Due: {new Date(todo.dueDate).toLocaleString()}
                             </span>
                           )}
                         </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
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