import { z } from 'zod'

// Todo form validation schema
export const todoFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .trim(),
  dueDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date || date === '') return true // Allow empty due date
      const selectedDate = new Date(date)
      return !isNaN(selectedDate.getTime()) // Check if valid date
    }, 'Please enter a valid date'),
  tags: z
    .array(z.string().min(1, 'Tag cannot be empty').max(20, 'Tag must be less than 20 characters'))
    .optional()
    .default([]),
  priority: z
    .enum(['low', 'medium', 'high'])
    .optional()
    .default('medium'),
})

// Validation for updating todo (optional fields)
export const todoUpdateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional(),
  dueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine((date) => {
      if (!date) return false
      const selectedDate = new Date(date)
      const now = new Date()
      return selectedDate > now
    }, 'Due date must be in the future')
    .optional(),
  tags: z
    .array(z.string().min(1, 'Tag cannot be empty').max(20, 'Tag must be less than 20 characters'))
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high'])
    .optional(),
  completed: z.boolean().optional(),
})

// Bulk operations schema
export const bulkTodoSchema = z.object({
  todoIds: z.array(z.number()).min(1, 'At least one todo must be selected'),
  action: z.enum(['delete', 'complete', 'incomplete', 'update']),
  updates: z.object({
    priority: z.enum(['low', 'medium', 'high']).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
})

// Search schema
export const searchTodoSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z.object({
    completed: z.boolean().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    tags: z.array(z.string()).optional(),
    dueDate: z.enum(['overdue', 'today', 'this-week', 'this-month']).optional(),
  }).optional(),
}) 