'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, Trash2, Download, Filter } from 'lucide-react'

export default function BulkActions({ todos, onBulkUpdate, onBulkDelete, onExport }) {
  const [selectedTodos, setSelectedTodos] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSelectAll = () => {
    if (selectedTodos.length === todos.length) {
      setSelectedTodos([])
    } else {
      setSelectedTodos(todos.map(todo => todo.id))
    }
  }

  const handleSelectTodo = (todoId) => {
    if (selectedTodos.includes(todoId)) {
      setSelectedTodos(selectedTodos.filter(id => id !== todoId))
    } else {
      setSelectedTodos([...selectedTodos, todoId])
    }
  }

  const handleBulkComplete = async () => {
    if (selectedTodos.length === 0) {
      toast({
        title: 'No todos selected',
        description: 'Please select todos to mark as complete',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      await onBulkUpdate(selectedTodos, true)
      setSelectedTodos([])
      toast({
        title: 'Success',
        description: `${selectedTodos.length} todos marked as complete`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update todos',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkIncomplete = async () => {
    if (selectedTodos.length === 0) {
      toast({
        title: 'No todos selected',
        description: 'Please select todos to mark as incomplete',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      await onBulkUpdate(selectedTodos, false)
      setSelectedTodos([])
      toast({
        title: 'Success',
        description: `${selectedTodos.length} todos marked as incomplete`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update todos',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTodos.length === 0) {
      toast({
        title: 'No todos selected',
        description: 'Please select todos to delete',
        variant: 'destructive',
      })
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedTodos.length} todos?`)) {
      return
    }

    setIsLoading(true)
    try {
      await onBulkDelete(selectedTodos)
      setSelectedTodos([])
      toast({
        title: 'Success',
        description: `${selectedTodos.length} todos deleted`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete todos',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    setIsLoading(true)
    try {
      await onExport()
      toast({
        title: 'Success',
        description: 'Todos exported successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export todos',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Bulk Actions
        </CardTitle>
        <CardDescription>
          Select multiple todos to perform bulk operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTodos.length === todos.length && todos.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">
                  Select All ({selectedTodos.length}/{todos.length})
                </span>
              </label>
            </div>
            
            {selectedTodos.length > 0 && (
              <div className="text-sm text-gray-600">
                {selectedTodos.length} selected
              </div>
            )}
          </div>

          {/* Bulk Action Buttons */}
          {selectedTodos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleBulkComplete}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </Button>
              
              <Button
                onClick={handleBulkIncomplete}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Mark Incomplete
              </Button>
              
              <Button
                onClick={handleBulkDelete}
                disabled={isLoading}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </Button>
            </div>
          )}

          {/* Export Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleExport}
              disabled={isLoading || todos.length === 0}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 