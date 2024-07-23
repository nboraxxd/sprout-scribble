import { Metadata } from 'next'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

import { db } from '@/server'
import { products } from '@/server/schema'
import { ProductForm } from '@/components/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export async function generateMetadata({ params: { id } }: { params: { id: string } }): Promise<Metadata> {
  const product = await db.query.products.findFirst({ where: eq(products.id, +id) })

  return {
    title: `${product?.name} - Edit product`,
    description: 'Edit the product to make it better and more attractive to customers.',
  }
}

export default async function EditProductPage({ params: { id } }: { params: { id: string } }) {
  const product = await db.query.products.findFirst({ where: eq(products.id, +id) })

  if (!product) redirect('/dashboard/products')

  return (
    <Card className="mx-auto w-full max-w-2xl grow">
      <CardHeader>
        <CardTitle>{product.name} - Edit product</CardTitle>
        <CardDescription>Edit the product to make it better and more attractive to customers.</CardDescription>
      </CardHeader>
      <CardContent>
        <ProductForm product={product} />
      </CardContent>
    </Card>
  )
}
