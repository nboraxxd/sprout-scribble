'use client'

import slugify from 'slugify'
import { toast } from 'sonner'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAction } from 'next-safe-action/hooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { DollarSignIcon, LoaderCircleIcon, RotateCcwIcon } from 'lucide-react'

import { createProduct } from '@/server/actions/product.action'
import { AddProductSchemaType, addProductSchema } from '@/lib/schema-validations/product.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { TiptapHandle } from '@/components/form/tiptap'
import { FormMessages, Tiptap } from '@/components/form'

export default function ProductForm() {
  const tiptapRef = useRef<TiptapHandle | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const form = useForm<AddProductSchemaType>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
    },
  })

  const { executeAsync, status } = useAction(createProduct)

  async function onSubmit(values: AddProductSchemaType) {
    if (status === 'executing' || !tiptapRef.current) return
    setErrorMessage('')

    const response = await executeAsync(values)
    if (response?.data?.success === true) {
      form.reset()
      tiptapRef.current.clearContent()
      toast.success(response.data.message)
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
          render={() => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Tiptap ref={tiptapRef} />
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
        <Button type="submit" className="gap-1.5" disabled={status === 'executing'}>
          {status === 'executing' ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
          Add product
        </Button>
      </form>
    </Form>
  )
}
