import { z } from 'zod'

export const resendTokenOrCodeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})
