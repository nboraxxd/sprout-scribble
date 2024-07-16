import { z } from 'zod'

export const loginByTokenSchema = z.object({
  token: z.string().min(1),
})

export const loginByCodeSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  code: z.string().min(6).max(6),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  code: z.string().min(6).max(6).optional(),
})

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().optional(),
    password: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })

export type LoginSchemaType = z.infer<typeof loginSchema>
export type RegisterSchemaType = z.infer<typeof registerSchema>
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>
