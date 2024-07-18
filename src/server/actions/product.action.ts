'use server'

import { eq } from 'drizzle-orm'

import { db } from '@/server'
import { products } from '@/server/schema'
import { actionClient } from '@/lib/safe-action'
import { addProductSchema } from '@/lib/schema-validations/product.schema'

export const addProduct = actionClient
  .schema(addProductSchema)
  .action(async ({ parsedInput: { name, slug, description, price } }) => {
    try {
      const existingSlug = await db.query.products.findFirst({ where: eq(products.slug, slug) })
      if (existingSlug) {
        return {
          success: false,
          message: 'Slug already exists',
        }
      }

      const [product] = await db.insert(products).values({ name, slug, description, price }).returning()
      return {
        success: true,
        message: 'Product added successfully',
        data: product,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message ?? error.toString(),
      }
    }
  })
