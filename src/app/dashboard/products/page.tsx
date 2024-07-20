import { db } from '@/server'

import placeholder from '@root/public/placeholder_small.jpg'
import { DataTable } from '@/app/dashboard/products/data-table'
import { columns } from '@/app/dashboard/products/columns'

export default async function ProductsPage() {
  const productsResponse = await db.query.products.findMany({
    orderBy: (products, { asc }) => [asc(products.id)],
  })

  const dataTable = productsResponse.map(({ id, name, price }) => ({
    id,
    name,
    price,
    variants: [],
    image: placeholder.src,
  }))

  return (
    <div>
      <DataTable columns={columns} data={dataTable} />
    </div>
  )
}
