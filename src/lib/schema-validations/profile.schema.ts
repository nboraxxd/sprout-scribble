import { z } from 'zod'

export const profileSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    image: z.string().url().optional(),
    password: z.string().min(6).max(100).optional(),
    newPassword: z.string().min(6).max(100).optional(),
    isTwoFactorEnabled: z.boolean().optional(),
  })
  .strict()
  .superRefine(({ password, newPassword }, ctx) => {
    if (password && !newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'New password is required when changing password',
        path: ['newPassword'],
      })
    }
    if (!password && newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Current password is required when changing password',
        path: ['password'],
      })
    }
    if (password && newPassword && password === newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'New password must be different from current password',
        path: ['newPassword'],
      })
    }
  })

export type ProfileSchemaType = z.infer<typeof profileSchema>
