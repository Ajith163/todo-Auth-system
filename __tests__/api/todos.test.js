import { NextRequest } from 'next/server'
import { GET, POST, PATCH, DELETE } from '@/app/api/todos/route'
import { GET as searchGET } from '@/app/api/todos/search/route'
import { POST as bulkPOST, DELETE as bulkDELETE } from '@/app/api/todos/bulk/route'
import { GET as exportGET } from '@/app/api/todos/export/route'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

// Mock database
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => Promise.resolve([]))
        }))
      }))
    })),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([{ id: 1, title: 'Test Todo' }]))
      }))
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          returning: jest.fn(() => Promise.resolve([{ id: 1, title: 'Updated Todo' }]))
        }))
      }))
    })),
    delete: jest.fn(() => ({
      where: jest.fn(() => ({
        returning: jest.fn(() => Promise.resolve([{ id: 1 }]))
      }))
    }))
  }
}))

describe('Todos API', () => {
  const mockSession = {
    user: { id: '1', email: 'test@example.com', role: 'user' }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    require('next-auth').getServerSession.mockResolvedValue(mockSession)
  })

  describe('GET /api/todos', () => {
    it('returns todos for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('todos')
    })

    it('returns 401 for unauthenticated user', async () => {
      require('next-auth').getServerSession.mockResolvedValue(null)
      
      const request = new NextRequest('http://localhost:3000/api/todos')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('POST /api/todos', () => {
    it('creates a new todo', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description',
        dueDate: '2024-12-31',
        tags: ['work', 'urgent'],
        priority: 'high'
      }

      const request = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('todo')
    })
  })

  describe('PATCH /api/todos/[id]', () => {
    it('updates a todo', async () => {
      const updateData = {
        title: 'Updated Todo',
        completed: true
      }

      const request = new NextRequest('http://localhost:3000/api/todos/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const response = await PATCH(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('todo')
    })
  })

  describe('DELETE /api/todos/[id]', () => {
    it('deletes a todo', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos/1', {
        method: 'DELETE'
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})

describe('Search API', () => {
  const mockSession = {
    user: { id: '1', email: 'test@example.com', role: 'user' }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    require('next-auth').getServerSession.mockResolvedValue(mockSession)
  })

  describe('GET /api/todos/search', () => {
    it('searches todos with query', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos/search?q=test')
      const response = await searchGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('todos')
      expect(data).toHaveProperty('searchQuery', 'test')
    })

    it('filters by completion status', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos/search?completed=true')
      const response = await searchGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.filters.completed).toBe('true')
    })

    it('filters by priority', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos/search?priority=high')
      const response = await searchGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.filters.priority).toBe('high')
    })
  })
})

describe('Bulk Operations API', () => {
  const mockSession = {
    user: { id: '1', email: 'test@example.com', role: 'user' }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    require('next-auth').getServerSession.mockResolvedValue(mockSession)
  })

  describe('POST /api/todos/bulk', () => {
    it('bulk updates todos', async () => {
      const bulkData = {
        todoIds: [1, 2, 3],
        action: 'complete'
      }

      const request = new NextRequest('http://localhost:3000/api/todos/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData)
      })

      const response = await bulkPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data).toHaveProperty('updatedCount')
    })

    it('returns error for invalid action', async () => {
      const bulkData = {
        todoIds: [1, 2, 3],
        action: 'invalid-action'
      }

      const request = new NextRequest('http://localhost:3000/api/todos/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData)
      })

      const response = await bulkPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid action')
    })
  })

  describe('DELETE /api/todos/bulk', () => {
    it('bulk deletes todos', async () => {
      const bulkData = {
        todoIds: [1, 2, 3]
      }

      const request = new NextRequest('http://localhost:3000/api/todos/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData)
      })

      const response = await bulkDELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data).toHaveProperty('deletedCount')
    })
  })
})

describe('Export API', () => {
  const mockSession = {
    user: { id: '1', email: 'test@example.com', role: 'user' }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    require('next-auth').getServerSession.mockResolvedValue(mockSession)
  })

  describe('GET /api/todos/export', () => {
    it('exports todos as JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos/export')
      const response = await exportGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('todos')
      expect(data).toHaveProperty('exportDate')
      expect(data).toHaveProperty('totalCount')
    })

    it('exports todos as CSV', async () => {
      const request = new NextRequest('http://localhost:3000/api/todos/export?format=csv')
      const response = await exportGET(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/csv')
      expect(response.headers.get('Content-Disposition')).toContain('.csv')
    })
  })
}) 