'use client'

import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { ColumnDef, Row } from '@tanstack/react-table'
import { MoreHorizontalIcon, LoaderCircleIcon } from 'lucide-react'

import { cn, formatCurrency } from '@/utils'
import { deleteProduct } from '@/server/actions/product.action'
import { Button, buttonVariants } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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

function ActionCell({ row }: { row: Row<ProductColumn> }) {
  const productNeedingDelete = row.original
  const [isOpenDialog, setIsOpenDialog] = useState(false)

  const { executeAsync, status } = useAction(deleteProduct)

  async function handleDeleteProduct() {
    if (status === 'executing') return

    try {
      const response = await executeAsync({ id: productNeedingDelete.id })

      if (response?.data?.success === true) {
        setIsOpenDialog(false)
        toast.success(response.data.message)
      } else if (response?.data?.success === false) {
        toast.error(response.data.message)
      }
    } catch (error: any) {
      toast.error(error.message ?? error.toString())
    }
  }

  return (
    <>
      <AlertDialog open={isOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product{' '}
              <strong>{productNeedingDelete.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={status === 'executing'}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: 'destructive' }), 'gap-1.5')}
              onClick={handleDeleteProduct}
              disabled={status === 'executing'}
            >
              {status === 'executing' ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <span className="sr-only">Open action</span>
            <MoreHorizontalIcon className="size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer">
            <Link href={`/dashboard/products/edit/${row.getValue('id')}`}>Edit Product</Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => setIsOpenDialog(true)}>
            Delete Product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
