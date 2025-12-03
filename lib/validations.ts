import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['user', 'guest']).default('user'),
})

export const workspaceSchema = z.object({
  name: z.string().min(3, 'Workspace name must be at least 3 characters'),
  description: z.string().optional(),
})

export const startupSchema = z.object({
  name: z.string().min(3, 'Startup name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  website_url: z.string().url('Invalid website URL').optional().or(z.literal('')),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type WorkspaceFormData = z.infer<typeof workspaceSchema>
export type StartupFormData = z.infer<typeof startupSchema>
