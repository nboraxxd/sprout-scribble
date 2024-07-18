import { Metadata } from 'next'

import { ProductForm } from '@/components/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Add product',
  description: 'Add a new product with all the details you need to get started.',
}

export default async function AddProductPage() {
  return (
    <Card className="mx-auto w-full max-w-2xl grow">
      <CardHeader>
        <CardTitle>Add product 🎉</CardTitle>
        <CardDescription>Add a new product with all the details you need to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <ProductForm />
      </CardContent>
    </Card>
  )
}
