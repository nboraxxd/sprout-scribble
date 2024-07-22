import { db } from '@/server'

import { DataTable } from '@/app/dashboard/products/data-table'
import placeholder from '@root/public/placeholder_small.jpg'
import { columns } from '@/app/dashboard/products/columns'

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
