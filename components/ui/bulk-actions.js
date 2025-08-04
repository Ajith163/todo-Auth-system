'use client'

import { useState } from 'react'
import { CheckSquare, Square, Trash2, CheckCircle, Circle, Download, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export function BulkActions({ todos, onBulkUpdate, onBulkDelete, onExport, className = '' }) {
  const [selectedTodos, setSelectedTodos] = useState([])
  const [showActions, setShowActions] = useState(false)
  const { toast } = useToast()

  const toggleSelectAll = () => {
    if (selectedTodos.length === todos.length) {
      setSelectedTodos([])
    } else {
      setSelectedTodos(todos.map(todo => todo.id))
    }
  }

  const toggleSelectTodo = (todoId) => {
    setSelectedTodos(prev => 
      prev.includes(todoId) 
        ? prev.filter(id => id !== todoId)
        : [...prev, todoId]
    )
  }

  const handleBulkAction = async (action) => {
    if (selectedTodos.length === 0) {
      toast({
        title: 'No todos selected',
        description: 'Please select at least one todo to perform this action.',
        variant: 'destructive',
      })
      return
    }

    try {
      let result
      switch (action) {
        case 'complete':
          result = await onBulkUpdate({
            todoIds: selectedTodos,
            action: 'complete'
          })
          break
        case 'incomplete':
          result = await onBulkUpdate({
            todoIds: selectedTodos,
            action: 'incomplete'
          })
          break
        case 'delete':
          result = await onBulkDelete(selectedTodos)
          break
        case 'export':
          result = await onExport(selectedTodos)
          break
      }

      if (result?.success) {
        toast({
          title: 'Success',
          description: result.message || `Successfully performed ${action} on ${selectedTodos.length} todos`,
        })
        setSelectedTodos([])
        setShowActions(false)
      } else {
        toast({
          title: 'Error',
          description: result?.error || `Failed to perform ${action}`,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to perform ${action}`,
        variant: 'destructive',
      })
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  if (todos.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Bulk Actions Bar */}
      {selectedTodos.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedTodos.length} of {todos.length} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleBulkAction('complete')}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('incomplete')}
                    className="flex items-center gap-2"
                  >
                    <Circle className="w-4 h-4" />
                    Mark Incomplete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('export')}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBulkAction('delete')}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedTodos([])}
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Todo List */}
      <div className="space-y-2">
        {todos.map((todo) => (
          <Card
            key={todo.id}
            className={`transition-colors ${
              selectedTodos.includes(todo.id) 
                ? 'border-primary bg-primary/5' 
                : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleSelectTodo(todo.id)}
                  className="flex-shrink-0"
                >
                  {selectedTodos.includes(todo.id) ? (
                    <CheckSquare className="w-5 h-5 text-primary" />
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className={`text-sm text-muted-foreground mt-1 ${todo.completed ? 'line-through' : ''}`}>
                          {todo.description}
                        </p>
                      )}
                      
                      {/* Tags */}
                      {todo.tags && todo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {todo.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {/* Priority Badge */}
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>

                      {/* Due Date */}
                      {todo.dueDate && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          new Date(todo.dueDate) < new Date() && !todo.completed
                            ? 'text-red-600 bg-red-100 dark:bg-red-900/20'
                            : 'text-muted-foreground bg-muted'
                        }`}>
                          {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      )}

                      {/* Status */}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        todo.completed
                          ? 'text-green-600 bg-green-100 dark:bg-green-900/20'
                          : 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
                      }`}>
                        {todo.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Select All Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={toggleSelectAll}
          className="flex items-center gap-2"
        >
          {selectedTodos.length === todos.length ? (
            <CheckSquare className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          {selectedTodos.length === todos.length ? 'Deselect All' : 'Select All'}
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowActions(!showActions)}
          className="flex items-center gap-2"
        >
          <MoreHorizontal className="w-4 h-4" />
          Actions
        </Button>
      </div>
    </div>
  )
} 