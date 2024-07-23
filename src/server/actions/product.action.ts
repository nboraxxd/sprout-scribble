'use server'

import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { db } from '@/server'
import { products } from '@/server/schema'
import { actionClient } from '@/lib/safe-action'
import { addProductSchema, updateProductSchema } from '@/lib/schema-validations/product.schema'

export const createProduct = actionClient
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

      revalidatePath('/dashboard/products')
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

export const updateProduct = actionClient
  .schema(updateProductSchema)
  .action(async ({ parsedInput: { id, name, slug, description, price } }) => {
    const existingProduct = await db.query.products.findFirst({ where: eq(products.id, id) })
    if (!existingProduct) {
      return {
        success: false,
        message: 'Product not found',
      }
    }

    if (slug !== existingProduct.slug) {
      const existingSlug = await db.query.products.findFirst({ where: eq(products.slug, slug) })
      if (existingSlug) {
        return {
          success: false,
          message: 'Slug already exists',
        }
      }
    }

    const [product] = await db
      .update(products)
      .set({ name, slug, description, price })
      .where(eq(products.id, id))
      .returning()

    revalidatePath('/dashboard/products')
    return {
      success: true,
      message: 'Product updated successfully',
      data: product,
    }
  })

export const deleteProduct = actionClient
  .schema(z.object({ id: z.coerce.number() }))
  .action(async ({ parsedInput: { id } }) => {
    const response = await db.delete(products).where(eq(products.id, id)).returning()

    if (response.length === 0) {
      return {
        success: false,
        message: 'Product not found',
      }
    }

    revalidatePath('/dashboard/products')
    return {
      success: true,
      message: 'Product deleted successfully',
      data: response,
    }
  })
