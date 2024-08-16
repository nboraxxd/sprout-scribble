'use client'

import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { ColumnDef, Row } from '@tanstack/react-table'
import { MoreHorizontalIcon, LoaderCircleIcon, PlusCircleIcon } from 'lucide-react'

import { cn, formatCurrency } from '@/utils'
import { VariantsWithImagesTags } from '@/types/infer.type'
import { deleteProduct } from '@/server/actions/product.action'
import { Button, buttonVariants } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
import { ProductVariant } from '@/app/dashboard/_components'

export type ProductColumn = {
  id: number
  name: string
  price: number
  variants: VariantsWithImagesTags[]
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
    cell: ({ row }) => {
      const variants = row.getValue<VariantsWithImagesTags[]>('variants')

      return (
        <div className="flex gap-2">
          {variants.map((variant) => (
            <TooltipProvider key={variant.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ProductVariant productId={variant.productId} variant={variant} isEdit>
                    <div className="size-5 rounded-full" key={variant.id} style={{ background: variant.color }} />
                  </ProductVariant>
                </TooltipTrigger>
                <TooltipContent>{variant.productType}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className={cn(buttonVariants({ size: 'icon', variant: 'ghost' }))}>
                <ProductVariant productId={row.original.id}>
                  <PlusCircleIcon className="size-5" />
                </ProductVariant>
              </TooltipTrigger>
              <TooltipContent>Create a new variant</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
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
