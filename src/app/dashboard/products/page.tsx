import { db } from '@/server'
import { Metadata } from 'next'

import { DataTable } from '@/app/dashboard/products/data-table'
import { columns } from '@/app/dashboard/products/columns'
import placeholder from '@root/public/placeholder_small.jpg'

export const metadata: Metadata = {
  title: 'Manage products',
  description: 'View and manage all the products in the store.',
}

export default async function ProductsPage() {
  const products = await db.query.products.findMany({
    orderBy: (products, { asc }) => [asc(products.id)],
  })

  const dataTable = products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    variants: [],
    image: placeholder.src,
  }))

  return <DataTable data={dataTable} columns={columns} />
}
