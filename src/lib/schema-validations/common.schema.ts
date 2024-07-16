import { z } from 'zod'

export const twoFactorCodeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})
