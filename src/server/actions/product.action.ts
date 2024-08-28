'use server'

import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { algoliasearch } from 'algoliasearch'

import { db } from '@/server'
import { productVariants, products, variantImages, variantTags } from '@/server/schema'
import { actionClient } from '@/lib/safe-action'
import {
  ProductVariantSchemaType,
  addProductSchema,
  productVariantSchema,
  updateProductSchema,
} from '@/lib/schema-validations/product.schema'

const indexName = 'products'
const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY)

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

export const createProductVariant = actionClient
  .schema(productVariantSchema.omit({ id: true }))
  .action(async ({ parsedInput: { color, productId, productType, tags, variantImages: images } }) => {
    try {
      const existingProduct = await db.query.products.findFirst({ where: eq(products.id, productId) })
      if (!existingProduct) {
        return {
          success: false,
          message: 'Product not found',
        }
      }

      const [variant] = await db.insert(productVariants).values({ productId, productType, color }).returning()

      await Promise.all([
        db.insert(variantTags).values(tags.map((tag: string) => ({ tag, variantId: variant.id }))),
        db.insert(variantImages).values(
          images.map((image: ProductVariantSchemaType['variantImages'][number], index: number) => ({
            name: image.name,
            url: image.url,
            size: image.size,
            order: index,
            variantId: variant.id,
          }))
        ),
        client.saveObject({
          indexName,
          body: {
            objectID: variant.id.toString(),
            id: existingProduct.id,
            name: existingProduct.name,
            price: existingProduct.price,
            productType,
            variantImages: images[0].url,
          },
        }),
      ])

      revalidatePath('/dashboard/products')
      return {
        success: true,
        message: 'Variant added successfully',
        data: variant,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message ?? error.toString(),
      }
    }
  })

export const updateProductVariant = actionClient
  .schema(productVariantSchema.omit({ id: true }).merge(z.object({ id: z.number() })))
  .action(async ({ parsedInput: { color, productId, productType, tags, variantImages: images, id } }) => {
    try {
      const existingVariant = await db.query.productVariants.findFirst({ where: eq(productVariants.id, id) })

      if (!existingVariant) {
        return {
          success: false,
          message: 'Variant not found',
        }
      }

      const [variant] = await db
        .update(productVariants)
        .set({ productId, productType, color })
        .where(eq(productVariants.id, id))
        .returning()

      await Promise.all([
        db.delete(variantTags).where(eq(variantTags.variantId, id)),
        db.insert(variantTags).values(tags.map((tag: string) => ({ tag, variantId: variant.id }))),
        db.delete(variantImages).where(eq(variantImages.id, variant.id)),
        db.insert(variantImages).values(
          images.map((image: ProductVariantSchemaType['variantImages'][number], index: number) => ({
            name: image.name,
            url: image.url,
            size: image.size,
            order: index,
            variantId: variant.id,
          }))
        ),
        client.partialUpdateObject({
          indexName,
          objectID: variant.id.toString(),
          id: productId,
          productType,
          variantImages: images[0].url,
        }),
      ])

      revalidatePath('/dashboard/products')
      return {
        success: true,
        message: 'Variant updated successfully',
        data: variant,
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message ?? error.toString(),
      }
    }
  })

export const deleteProductVariant = actionClient
  .schema(z.object({ id: z.coerce.number() }))
  .action(async ({ parsedInput: { id } }) => {
    const [response] = await Promise.all([
      db.delete(productVariants).where(eq(productVariants.id, id)).returning(),
      client.deleteObject({
        indexName,
        objectID: id.toString(),
      }),
    ])

    if (response.length === 0) {
      return {
        success: false,
        message: 'Variant not found',
      }
    }

    revalidatePath('/dashboard/products')
    return {
      success: true,
      message: 'Variant deleted successfully',
      data: response,
    }
  })
