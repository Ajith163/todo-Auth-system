'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export function SearchBar({ onSearch, onClear, className = '' }) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    completed: '',
    priority: '',
    tags: '',
    dueDate: ''
  })

  const handleSearch = () => {
    const searchData = {
      query,
      filters: Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      )
    }
    onSearch(searchData)
  }

  const handleClear = () => {
    setQuery('')
    setFilters({
      completed: '',
      priority: '',
      tags: '',
      dueDate: ''
    })
    onClear?.()
  }

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search todos..."
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
        <Button onClick={handleSearch}>
          Search
        </Button>
        {(query || Object.values(filters).some(v => v !== '')) && (
          <Button variant="ghost" onClick={handleClear}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={filters.completed}
                  onChange={(e) => updateFilter('completed', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All</option>
                  <option value="true">Completed</option>
                  <option value="false">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => updateFilter('priority', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <select
                  value={filters.dueDate}
                  onChange={(e) => updateFilter('dueDate', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All</option>
                  <option value="overdue">Overdue</option>
                  <option value="today">Today</option>
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <Input
                  value={filters.tags}
                  onChange={(e) => updateFilter('tags', e.target.value)}
                  placeholder="Enter tags (comma separated)"
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 