'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut, update } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { pusherClient } from '@/lib/pusher'
import { Users, CheckCircle, Clock, LogOut, Shield, Eye, Edit, Trash2, X } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UserSkeleton, AdminStatsSkeleton } from '@/components/ui/loading-skeleton'
import { approveUser, rejectUser, switchUserRole, getAllUsers } from '@/app/actions/users'
import UserManagementTabs from './user-management-tabs'

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [users, setUsers] = useState([])
  const [todos, setTodos] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending') // 'pending', 'rejected', 'approved'
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
    
    // Subscribe to real-time updates if Pusher is configured
    if (pusherClient) {
      const channel = pusherClient.subscribe('todos')
      
      channel.bind('todo-completed', (data) => {
        toast({
          title: 'Task Completed',
          description: `User ${data.userEmail} completed a task!`,
        })
        fetchAllTodos() // Refresh todos
      })

      return () => {
        pusherClient.unsubscribe('todos')
      }
    }
  }, [])

  const fetchUsers = async () => {
    try {
      const result = await getAllUsers()
      if (result.users) {
        setUsers(result.users)
      } else if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      })
    }
  }

  const fetchAllTodos = async () => {
    try {
      const response = await fetch('/api/admin/todos')
      if (response.ok) {
        const data = await response.json()
        setTodos(data.todos)
      }
    } catch (error) {
      console.error('Error fetching todos:', error)
    }
  }

  const fetchData = async () => {
    setIsInitialLoading(true)
    try {
      await Promise.all([fetchUsers(), fetchAllTodos()])
    } finally {
      setIsInitialLoading(false)
    }
  }

  const approveUser = async (userId) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      })

      if (response.ok) {
        fetchUsers()
        toast({
          title: 'Success',
          description: 'User approved successfully!',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve user.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const rejectUser = async (userId) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject' }),
      })

      if (response.ok) {
        fetchUsers()
        toast({
          title: 'Success',
          description: 'User rejected successfully!',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject user.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserApproval = async (userId, currentStatus) => {
    setIsLoading(true)
    try {
      const action = currentStatus === 'approved' ? 'reject' : 'approve'
      const response = await fetch(`/api/admin/users/${userId}/toggle-approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        fetchUsers()
        const actionText = action === 'approve' ? 'approved' : 'rejected'
        toast({
          title: 'Success',
          description: `User ${actionText} successfully!`,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // CRUD operations for approved users
  const [editingUser, setEditingUser] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)

  const updateUser = async (userId, userData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        fetchUsers()
        setShowEditForm(false)
        setEditingUser(null)
        
        // Check if the updated user is the current user
        if (editingUser && editingUser.email === session?.user?.email) {
          // Update the session with new role
          try {
            const response = await fetch('/api/auth/refresh-session', {
              method: 'POST',
            })
            
            if (response.ok) {
              const data = await response.json()
              // Update the session using NextAuth's update function
              await update({
                user: {
                  role: data.user.role,
                  approved: data.user.approved,
                }
              })
            }
          } catch (error) {
            console.error('Error updating session:', error)
          }
          
          toast({
            title: 'Success',
            description: 'User updated successfully! Session refreshed.',
          })
        } else {
          toast({
            title: 'Success',
            description: 'User updated successfully!',
          })
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    setIsLoading(true)
    try {
      console.log('Deleting user:', userId)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Delete result:', result)
        fetchUsers()
        toast({
          title: 'Success',
          description: 'User deleted successfully!',
        })
      } else {
        const errorData = await response.json()
        console.error('Delete failed:', errorData)
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to delete user.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete user.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowEditForm(true)
  }



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

  const pendingUsers = users.filter(user => !user.approved && !user.rejected)
  const approvedUsers = users.filter(user => user.approved && !user.rejected)
  const rejectedUsers = users.filter(user => user.rejected)
  const completedTodos = todos.filter(todo => todo.completed)
  const totalTodos = todos.length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage users and monitor todo activity
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              Admin
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
          <AdminStatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {users.length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Pending Approvals
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {pendingUsers.length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Rejected Users
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {rejectedUsers.length}
                    </p>
                  </div>
                  <X className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Todos
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {totalTodos}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-600" />
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
                    <p className="text-2xl font-bold text-green-600">
                      {(totalTodos > 0 ? Math.round((completedTodos.length / totalTodos) * 100) : 0) + '%'}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
          {/* User Management Tabs */}
          <UserManagementTabs
            users={users}
            pendingUsers={pendingUsers}
            approvedUsers={approvedUsers}
            rejectedUsers={rejectedUsers}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            approveUser={approveUser}
            rejectUser={rejectUser}
            toggleUserApproval={toggleUserApproval}
            handleEditUser={handleEditUser}
            deleteUser={deleteUser}
            isLoading={isLoading}
            isInitialLoading={isInitialLoading}
          />

          {/* All Todos */}
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle>All User Todos</CardTitle>
              <CardDescription>
                Monitor all todo activity across users
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {isInitialLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 animate-pulse">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : todos.length === 0 ? (
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No todos created yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todos.map((todo) => (
                    <div key={todo.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          {todo.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full mt-1" />
                          )}
                          <div className="flex-1">
                            <p className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                              {todo.title}
                            </p>
                            {todo.description && (
                              <p className={`text-sm mt-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                {todo.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                              <span>By: {todo.userEmail}</span>
                              <span>Created: {new Date(todo.createdAt).toLocaleDateString()}</span>
                              {todo.dueDate && (
                                <span className={`${
                                  new Date(todo.dueDate) < new Date() && !todo.completed 
                                    ? 'text-red-600 font-medium' 
                                    : ''
                                }`}>
                                  Due: {new Date(todo.dueDate).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit User Modal */}
       {showEditForm && editingUser && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
             <div className="flex justify-between items-center p-6 border-b">
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                 Edit User
               </h3>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => {
                   setShowEditForm(false)
                   setEditingUser(null)
                 }}
                 className="hover:bg-gray-100 dark:hover:bg-gray-700"
               >
                 <X className="w-4 h-4" />
               </Button>
             </div>
             
             <form onSubmit={(e) => {
               e.preventDefault()
               const formData = new FormData(e.target)
               updateUser(editingUser.id, {
                 email: formData.get('email'),
                 role: formData.get('role'),
               })
             }}>
               <div className="p-6 space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     Email Address
                   </label>
                   <input
                     type="email"
                     name="email"
                     defaultValue={editingUser.email}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
                     required
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     User Role
                   </label>
                   <select
                     name="role"
                     defaultValue={editingUser.role}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
                   >
                     <option value="user">User</option>
                     <option value="admin">Admin</option>
                   </select>
                 </div>
                 
                 <div className="flex gap-3 pt-4">
                   <Button
                     type="submit"
                     disabled={isLoading}
                     className="flex-1"
                   >
                     {isLoading ? 'Updating...' : 'Update User'}
                   </Button>
                   <Button
                     type="button"
                     variant="outline"
                     onClick={() => {
                       setShowEditForm(false)
                       setEditingUser(null)
                     }}
                     className="flex-1"
                   >
                     Cancel
                   </Button>
                 </div>
               </div>
             </form>
           </div>
         </div>
       )}
     </div>
   </div>
 )
} 