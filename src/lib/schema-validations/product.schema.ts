import { z } from 'zod'

export const addProductSchema = z.object({
  name: z.string().min(5),
  slug: z.string().min(5),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
})

export type AddProductSchemaType = z.infer<typeof addProductSchema>
