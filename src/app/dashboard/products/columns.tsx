'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MoreHorizontalIcon } from 'lucide-react'
import { ColumnDef, Row } from '@tanstack/react-table'

import { formatCurrency } from '@/utils'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export type ProductColumn = {
  id: number
  name: string
  price: number
  variants: any
  image: string
}

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'variants',
    header: 'Variants',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const priceFormatted = formatCurrency(row.getValue<number>('price'))
      return <div className="text-xs font-medium">{priceFormatted}</div>
    },
  },
  {
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row }) => {
      const { image, name } = row.original
      return (
        <div>
          <Image src={image} alt={name} className="rounded-md" width={50} height={50} />
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionCell row={row} />,
  },
]

const ActionCell = ({ row }: { row: Row<ProductColumn> }) => {
  const product = row.original

  return (
    <DropdownMenu modal>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <MoreHorizontalIcon className="size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="cursor-pointer">
          <Link href={`/dashboard/add-product?id=${product.id}`}>Edit Product</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">Delete Product</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
