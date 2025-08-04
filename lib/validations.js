import { z } from 'zod'

// Password validation function
const validatePassword = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  if (password.length < minLength) {
    return { isValid: false, message: `Password must be at least ${minLength} characters long` }
  }
  if (!hasUpperCase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' }
  }
  if (!hasLowerCase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' }
  }
  if (!hasNumbers) {
    return { isValid: false, message: 'Password must contain at least one number' }
  }
  if (!hasSpecialChar) {
    return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)' }
  }
  
  return { isValid: true, message: 'Password is strong' }
}

// Sign up validation schema
export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .refine((password) => {
      const validation = validatePassword(password)
      return validation.isValid
    }, (password) => {
      const validation = validatePassword(password)
      return { message: validation.message }
    }),
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

// Password strength checker for UI
export const checkPasswordStrength = (password) => {
  if (!password) return { strength: 0, message: 'Enter a password' }
  
  let score = 0
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
  
  score += checks.length ? 1 : 0
  score += checks.uppercase ? 1 : 0
  score += checks.lowercase ? 1 : 0
  score += checks.numbers ? 1 : 0
  score += checks.special ? 1 : 0
  
  const strengthLevels = {
    0: { strength: 0, message: 'Very Weak', color: 'text-red-500', bgColor: 'bg-red-100' },
    1: { strength: 1, message: 'Weak', color: 'text-orange-500', bgColor: 'bg-orange-100' },
    2: { strength: 2, message: 'Fair', color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
    3: { strength: 3, message: 'Good', color: 'text-blue-500', bgColor: 'bg-blue-100' },
    4: { strength: 4, message: 'Strong', color: 'text-green-500', bgColor: 'bg-green-100' },
    5: { strength: 5, message: 'Very Strong', color: 'text-green-600', bgColor: 'bg-green-100' }
  }
  
  return strengthLevels[score] || strengthLevels[0]
}

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