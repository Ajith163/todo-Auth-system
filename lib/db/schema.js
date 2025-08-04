import { pgTable, serial, text, boolean, timestamp, integer, json } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'), // 'admin' or 'user'
  approved: boolean('approved').notNull().default(false),
  rejected: boolean('rejected').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  completed: boolean('completed').notNull().default(false),
  dueDate: timestamp('due_date'),
  tags: json('tags'), // Array of tag strings
  priority: text('priority').default('medium'), // 'low', 'medium', 'high'
  userId: integer('user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}); 