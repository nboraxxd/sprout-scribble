'use client'

import { forwardRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { VariantsWithImagesTags } from '@/types/infer.type'
import { ProductVariantSchemaType, productVariantSchema } from '@/lib/schema-validations/product.schema'
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

interface VariantProps {
  children: React.ReactNode
  isEdit?: boolean
  productId?: number
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
      tags: [],
      variantImages: [],
      color: '#000000',
      id: undefined,
      productId,
      productType: '',
    },
  })

  function onSubmit(values: ProductVariantSchemaType) {
    console.log(values)
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
                <Button variant={'destructive'} type="button" onClick={() => {}}>
                  Delete Variant
                </Button>
              ) : null}
              <Button type="submit">{isEdit ? 'Update Variant' : 'Create Variant'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
})

export default ProductVariant
