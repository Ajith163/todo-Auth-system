import { z } from 'zod'

// Sign up validation schema
export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Sign in validation schema
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

// Todo form validation schema
export const todoFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  dueDate: z
    .string()
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high'])
    .default('medium'),
  tags: z
    .array(z.string())
    .optional(),
})

// User update validation schema
export const userUpdateSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  role: z
    .enum(['user', 'admin'])
    .default('user'),
})

// Search validation schema
export const searchSchema = z.object({
  query: z
    .string()
    .optional(),
  completed: z
    .enum(['all', 'true', 'false'])
    .default('all'),
  priority: z
    .enum(['all', 'low', 'medium', 'high'])
    .default('all'),
  tags: z
    .array(z.string())
    .optional(),
  dueDateFrom: z
    .string()
    .optional(),
  dueDateTo: z
    .string()
    .optional(),
})

// Bulk operations validation schema
export const bulkOperationSchema = z.object({
  todoIds: z
    .array(z.number())
    .min(1, 'At least one todo must be selected'),
  action: z
    .enum(['complete', 'incomplete', 'delete'])
    .default('complete'),
})

// Export validation schema
export const exportSchema = z.object({
  format: z
    .enum(['csv', 'json'])
    .default('csv'),
  filters: searchSchema.optional(),
}) 