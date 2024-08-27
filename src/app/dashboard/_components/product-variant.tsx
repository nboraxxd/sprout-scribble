'use client'

import { forwardRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useAction } from 'next-safe-action/hooks'
import { VariantsWithImagesTags } from '@/types/infer.type'
import { ProductVariantSchemaType, productVariantSchema } from '@/lib/schema-validations/product.schema'
import { createProductVariant, deleteProductVariant, updateProductVariant } from '@/server/actions/product.action'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { InputTags, VariantImages } from '@/app/dashboard/_components'
import { toast } from 'sonner'
import { LoaderCircleIcon } from 'lucide-react'

interface VariantProps {
  children: React.ReactNode
  productId: number
  isEdit?: boolean
  variant?: VariantsWithImagesTags
}

const ProductVariant = forwardRef<HTMLDivElement, VariantProps>(function ProductVariantChild(
  { children, isEdit = false, productId, variant },
  _ref
) {
  const [open, setOpen] = useState(false)

  const form = useForm<ProductVariantSchemaType>({
    resolver: zodResolver(productVariantSchema),
    defaultValues: {
      tags: variant?.variantTags.map((item) => item.tag) ?? [],
      variantImages: variant?.variantImages ?? [],
      color: variant?.color ?? '#000000',
      id: variant?.id,
      productId,
      productType: variant?.productType ?? '',
    },
  })

  const { executeAsync: createVariantExecuteAsync, status: createVariantStatus } = useAction(createProductVariant)
  const { executeAsync: updateVariantExecuteAsync, status: updateVariantStatus } = useAction(updateProductVariant)
  const { executeAsync: deleteVariantExecuteAsync, status: deleteVariantStatus } = useAction(deleteProductVariant)

  async function onSubmit(values: ProductVariantSchemaType) {
    if (
      createVariantStatus === 'executing' ||
      updateVariantStatus === 'executing' ||
      deleteVariantStatus === 'executing'
    )
      return

    try {
      const response =
        isEdit && variant?.id
          ? await updateVariantExecuteAsync({
              ...values,
              id: variant.id,
            })
          : await createVariantExecuteAsync(values)

      if (response?.data?.success === true) {
        toast.success(response.data.message)
        setOpen(false)
      } else if (response?.data?.success === false) {
        toast.error(response.data.message)
      }
    } catch (error: any) {
      toast.error(error.message ?? error.toString())
    }
  }

  async function onDeleteVariant() {
    if (
      !variant?.id ||
      createVariantStatus === 'executing' ||
      updateVariantStatus === 'executing' ||
      deleteVariantStatus === 'executing'
    )
      return

    try {
      const response = await deleteVariantExecuteAsync({ id: variant.id })

      if (response?.data?.success === true) {
        toast.success(response.data.message)
        setOpen(false)
      } else if (response?.data?.success === false) {
        toast.error(response.data.message)
      }
    } catch (error: any) {
      toast.error(error.message ?? error.toString())
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[860px] overflow-y-auto lg:max-w-screen-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Create'} your variant</DialogTitle>
          <DialogDescription>Manage your product variants here. You can add tags, images, and more.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="productType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant title</FormLabel>
                  <FormControl>
                    <Input placeholder="Pick a title for your variant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant color</FormLabel>
                  <FormControl>
                    <Input type="color" className="max-w-24 border-none p-0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <InputTags {...field} onChange={(ev) => field.onChange(ev)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <VariantImages />
            <div className="flex items-center justify-end gap-4">
              {isEdit && variant ? (
                <Button
                  variant="destructive"
                  type="button"
                  className="gap-1.5"
                  disabled={
                    createVariantStatus === 'executing' ||
                    updateVariantStatus === 'executing' ||
                    deleteVariantStatus === 'executing'
                  }
                  onClick={onDeleteVariant}
                >
                  {deleteVariantStatus === 'executing' ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
                  Delete Variant
                </Button>
              ) : null}
              <Button
                type="submit"
                className="gap-1.5"
                disabled={
                  createVariantStatus === 'executing' ||
                  updateVariantStatus === 'executing' ||
                  deleteVariantStatus === 'executing'
                }
              >
                {createVariantStatus === 'executing' || updateVariantStatus === 'executing' ? (
                  <LoaderCircleIcon className="size-4 animate-spin" />
                ) : null}
                {isEdit ? 'Update Variant' : 'Create Variant'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
})

export default ProductVariant
