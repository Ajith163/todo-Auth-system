'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut, update } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { pusherClient } from '@/lib/pusher'
import { Users, CheckCircle, Clock, LogOut, Shield, Eye, Edit, Trash2, X, Circle, Lock } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UserSkeleton, AdminStatsSkeleton } from '@/components/ui/loading-skeleton'
import { approveUser, rejectUser, switchUserRole, getAllUsers } from '@/app/actions/users'
import UserManagementTabs from './user-management-tabs'
import UserEditModal from './user-edit-modal'
import PasswordChangeModal from './password-change-modal'

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [users, setUsers] = useState([])
  const [todos, setTodos] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending') // 'pending', 'rejected', 'approved'
  const [editingUser, setEditingUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
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
      // Silent error handling
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
        setShowEditModal(false)
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
            // Silent error handling
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
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update user.',
          variant: 'destructive',
        })
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
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        fetchUsers()
        toast({
          title: 'Success',
          description: 'User deleted successfully!',
        })
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to delete user.',
          variant: 'destructive',
        })
      }
    } catch (error) {
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
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingUser(null)
  }

  const handlePasswordChange = async (passwordData) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Password changed successfully!',
        })
        setShowPasswordModal(false)
      } else {
        throw new Error(result.error || 'Failed to change password')
      }
    } catch (error) {
      throw error
    }
  }

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

  const goToSignOutPage = () => {
    window.location.href = '/auth/signout'
  }

  // Filter out default admin user
  const filterOutDefaultAdmin = (userList) => {
    return userList.filter(user => user.email !== 'admin@example.com')
  }

  const pendingUsers = filterOutDefaultAdmin(Array.isArray(users) ? users.filter(user => user && !user.approved && !user.rejected) : [])
  const approvedUsers = filterOutDefaultAdmin(Array.isArray(users) ? users.filter(user => user && user.approved && !user.rejected) : [])
  const rejectedUsers = filterOutDefaultAdmin(Array.isArray(users) ? users.filter(user => user && user.rejected) : [])
  const completedTodos = Array.isArray(todos) ? todos.filter(todo => todo && todo.completed) : []
  const totalTodos = Array.isArray(todos) ? todos.length : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-mobile max-w-7xl mx-auto py-4 sm:py-8">
        {/* Header */}
        <div className="flex-mobile justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-mobile-xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-mobile text-gray-600 dark:text-gray-400 mt-2">
              Manage users and monitor todo activity
            </p>
          </div>
          <div className="nav-mobile">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              Admin
            </div>
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(true)}
              className="btn-mobile"
            >
              <Lock className="w-4 h-4 mr-2" />
              <span className="mobile-hidden">Change Password</span>
            </Button>
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
        {isInitialLoading ? (
          <AdminStatsSkeleton />
        ) : (
          <div className="stats-mobile mb-6 sm:mb-8">
            <Card>
              <CardContent className="card-mobile">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Array.isArray(users) ? users.length : 0}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="card-mobile">
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
              <CardContent className="card-mobile">
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
              <CardContent className="card-mobile">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Todos
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Array.isArray(todos) ? todos.length : 0}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-600" />
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
                    <p className="text-2xl font-bold text-green-600">
                      {Array.isArray(todos) && todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0}%
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Management Tabs */}
        <div className="space-mobile">
          <UserManagementTabs
            users={users}
            pendingUsers={pendingUsers}
            rejectedUsers={rejectedUsers}
            approvedUsers={approvedUsers}
            isInitialLoading={isInitialLoading}
            isLoading={isLoading}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            approveUser={approveUser}
            rejectUser={rejectUser}
            toggleUserApproval={toggleUserApproval}
            handleEditUser={handleEditUser}
            deleteUser={deleteUser}
          />
        </div>

        {/* User Edit Modal */}
        <UserEditModal
          user={editingUser}
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSave={updateUser}
          isLoading={isLoading}
        />

        {/* Password Change Modal */}
        <PasswordChangeModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSave={handlePasswordChange}
          isLoading={isLoading}
        />

        {/* Todos Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-mobile-lg">All Todos</CardTitle>
              <CardDescription className="text-mobile">
                Monitor all user todos across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="table-mobile">
                {(!Array.isArray(todos) || todos.length === 0) ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No todos found
                  </p>
                ) : (
                  <div className="space-mobile">
                    {(Array.isArray(todos) ? todos : []).map((todo) => (
                      <div
                        key={todo.id}
                        className={`p-4 rounded-lg border ${
                          todo.completed
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex-mobile justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {todo.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-400" />
                              )}
                              <h3 className={`text-mobile font-medium ${
                                todo.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
                              }`}>
                                {todo.title}
                              </h3>
                            </div>
                            {todo.description && (
                              <p className={`text-sm text-gray-600 dark:text-gray-400 ${
                                todo.completed ? 'line-through' : ''
                              }`}>
                                {todo.description}
                              </p>
                            )}
                            <div className="flex-mobile items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>By: {todo.userEmail}</span>
                              {todo.dueDate && (
                                <span className={`${
                                  new Date(todo.dueDate) < new Date() && !todo.completed
                                    ? 'text-red-600 font-medium'
                                    : 'text-gray-500'
                                }`}>
                                  Due: {new Date(todo.dueDate).toLocaleDateString()}
                                </span>
                              )}
                              <span>Created: {new Date(todo.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 