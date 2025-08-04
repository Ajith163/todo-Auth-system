import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const todoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export const updateTodoSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  completed: z.boolean(),
}); 