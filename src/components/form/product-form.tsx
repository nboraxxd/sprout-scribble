'use client'

import slugify from 'slugify'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { DollarSignIcon, LoaderCircleIcon, RotateCcwIcon } from 'lucide-react'

import { ProductType } from '@/server/schema'
import { createProduct, updateProduct } from '@/server/actions/product.action'
import { AddProductSchemaType, addProductSchema } from '@/lib/schema-validations/product.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { TiptapHandle } from '@/components/form/tiptap'
import { FormMessages, Tiptap } from '@/components/form'
import Link from 'next/link'

export default function ProductForm({ product }: { product?: ProductType }) {
  const tiptapRef = useRef<TiptapHandle | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const form = useForm<AddProductSchemaType>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
    },
  })

  const { executeAsync: createProductExecuteAsync, status: createProductStatus } = useAction(createProduct)
  const { executeAsync: updateProductExecuteAsync, status: updateProductStatus } = useAction(updateProduct)

  useEffect(() => {
    if (product) {
      form.setValue('name', product.name)
      form.setValue('slug', product.slug)
      form.setValue('description', product.description)
      form.setValue('price', product.price)
    }
  }, [form, product])

  async function onSubmit(values: AddProductSchemaType) {
    if (createProductStatus === 'executing' || updateProductStatus === 'executing' || !tiptapRef.current) return
    setErrorMessage('')

    const response = product
      ? await updateProductExecuteAsync({ ...values, id: product.id })
      : await createProductExecuteAsync(values)
    if (response?.data?.success === true) {
      toast.success(response.data.message)
      router.push('/dashboard/products')
    } else if (response?.data?.success === false) {
      setErrorMessage(response.data.message)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Batmobile" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="gap-1" htmlFor="slug">
                Slug
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input id="slug" placeholder="batmobile-model-3" className="pr-10" {...field} />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="group absolute right-1 top-1/2 z-10 size-8 -translate-y-1/2 hover:bg-transparent"
                          type="button"
                          onClick={() => {
                            if (form.getValues('name') || field.value) {
                              form.setValue(
                                'slug',
                                slugify(form.getValues('name') || field.value, {
                                  lower: true,
                                  strict: true,
                                })
                              )
                              form.trigger('slug')
                            }
                          }}
                        >
                          <RotateCcwIcon className="size-4 transition-transform group-active:rotate-[-75deg]" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="text-xs">Create slug from name</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </FormControl>
              <FormDescription>Use the create button or enter manually.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Tiptap ref={tiptapRef} value={field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Price */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 mt-px -translate-y-1/2">
                    <DollarSignIcon className="size-4" />
                  </span>
                  <Input type="number" step={0.1} className="pl-8" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormMessages errorMessage={errorMessage} />
        <div className="flex justify-between gap-2">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/products">Back to products</Link>
          </Button>
          <Button
            type="submit"
            className="gap-1.5"
            disabled={createProductStatus === 'executing' || updateProductStatus === 'executing'}
          >
            {createProductStatus === 'executing' || updateProductStatus === 'executing' ? (
              <LoaderCircleIcon className="size-4 animate-spin" />
            ) : null}
            {product ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
