'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Edit, Trash2, CheckCircle, XCircle, Clock, User } from 'lucide-react'
import { formatDisplayDate, formatDateTime, getRelativeTime } from '@/lib/utils'

export default function UserManagementTabs({ 
  users = [], 
  pendingUsers = [], 
  rejectedUsers = [], 
  approvedUsers = [], 
  isInitialLoading = false, 
  isLoading = false, 
  activeTab = 'pending', 
  setActiveTab,
  approveUser,
  rejectUser,
  toggleUserApproval,
  handleEditUser,
  deleteUser
}) {
  // Filter out default admin user (admin@example.com)
  const filterOutDefaultAdmin = (userList) => {
    return userList.filter(user => user.email !== 'admin@example.com')
  }

  const filteredPendingUsers = filterOutDefaultAdmin(pendingUsers)
  const filteredRejectedUsers = filterOutDefaultAdmin(rejectedUsers)
  const filteredApprovedUsers = filterOutDefaultAdmin(approvedUsers)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user approvals and status
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Tab Navigation */}
        <div className="flex border-b mb-6 flex-shrink-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'pending'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({filteredPendingUsers.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'rejected'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected ({filteredRejectedUsers.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'approved'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved ({filteredApprovedUsers.length})
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {isInitialLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-4 border rounded-lg bg-white dark:bg-gray-800 animate-pulse">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pending Users Tab */}
              {activeTab === 'pending' && (
                filteredPendingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No pending approvals
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPendingUsers.map((user) => (
                      <div key={user.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4 text-gray-400" />
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {user.email}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                              Registered: {formatDisplayDate(user.createdAt)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Role: <span className="font-medium capitalize">{user.role}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            size="sm"
                            onClick={() => approveUser(user.id)}
                            disabled={isLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectUser(user.id)}
                            disabled={isLoading}
                            className="flex-1"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Rejected Users Tab */}
              {activeTab === 'rejected' && (
                filteredRejectedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No rejected users
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRejectedUsers.map((user) => (
                      <div key={user.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4 text-gray-400" />
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {user.email}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                              Rejected: {formatDisplayDate(user.createdAt)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Role: <span className="font-medium capitalize">{user.role}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            size="sm"
                            onClick={() => approveUser(user.id)}
                            disabled={isLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Approved Users Tab */}
              {activeTab === 'approved' && (
                filteredApprovedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No approved users yet
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredApprovedUsers.map((user) => (
                      <div key={user.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4 text-gray-400" />
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {user.email}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Role: <span className="font-medium capitalize">{user.role}</span>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                              Joined: {formatDisplayDate(user.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <Switch 
                              checked={user.approved} 
                              onCheckedChange={() => toggleUserApproval(user.id, user.approved ? 'approved' : 'pending')}
                              disabled={isLoading}
                            />
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                              {user.approved ? 'Approved' : 'Pending'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                            disabled={isLoading}
                            className="flex-1"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteUser(user.id)}
                            disabled={isLoading}
                            className="flex-1"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 