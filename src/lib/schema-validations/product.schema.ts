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

export const updateProductSchema = addProductSchema.extend({
  id: z.coerce.number(),
})

export const productVariantSchema = z.object({
  productId: z.number(),
  id: z.number().optional(),
  productType: z.string().min(3, { message: 'Product type must be at least 3 characters long' }),
  color: z.string().min(3, { message: 'Color must be at least 3 characters long' }),
  tags: z.array(z.string()).min(1, { message: 'You must provide at least one tag' }),
  variantImages: z
    .array(
      z.object({
        url: z.string().refine((url) => url.search('blob:') !== 0, {
          message: 'Please wait for the image to upload',
        }),
        size: z.number(),
        key: z.string().optional(),
        id: z.number().optional(),
        name: z.string(),
      })
    )
    .min(1, { message: 'You must provide at least one image' })
    .max(10, { message: 'You can only provide up to 10 images' }),
})

export type AddProductSchemaType = z.infer<typeof addProductSchema>
export type UpdateProductSchemaType = z.infer<typeof updateProductSchema>
export type ProductVariantSchemaType = z.infer<typeof productVariantSchema>
