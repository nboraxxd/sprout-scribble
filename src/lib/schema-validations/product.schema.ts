import { z } from 'zod'

export const addProductSchema = z.object({
  name: z.string().min(5),
  slug: z
    .string()
    .min(5)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase alphanumeric characters'),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
})

export type AddProductSchemaType = z.infer<typeof addProductSchema>
