'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Reorder } from 'framer-motion'
import { TrashIcon } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { cn } from '@/utils'
import { UploadDropzone } from '@/lib/uploadthing'
import { ProductVariantSchemaType } from '@/lib/schema-validations/product.schema'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function VariantImages() {
  const [active, setActive] = useState(0)
  const { getValues, control, setError, clearErrors } = useFormContext<ProductVariantSchemaType>()

  const { fields, remove, append, update, move } = useFieldArray({
    control,
    name: 'variantImages',
  })

  return (
    <div>
      <FormField
        control={control}
        name="variantImages"
        render={() => (
          <FormItem>
            <FormLabel className="gap-1">
              Variant Images <span className="text-sm text-gray-500">(Max 10 images, 2MB each)</span>
            </FormLabel>
            <FormControl>
              <UploadDropzone
                endpoint="variantUploader"
                className="border-input ut-button:bg-primary ut-label:text-primary"
                onUploadError={(err) => {
                  setError('variantImages', {
                    type: 'manual',
                    message: err.message,
                  })
                  const images = getValues('variantImages')
                  images.forEach((field, index) => {
                    if (field.url.search('blob:') === 0) {
                      remove(index)
                    }
                  })
                }}
                onBeforeUploadBegin={(files) => {
                  clearErrors('variantImages')
                  files.map((file) => append({ name: file.name, size: file.size, url: URL.createObjectURL(file) }))
                  return files
                }}
                onClientUploadComplete={(files) => {
                  const images = getValues('variantImages')
                  images.forEach((field, index) => {
                    if (field.url.search('blob:') === 0) {
                      const image = files.find((file) => file.name === field.name)
                      if (image) {
                        update(index, { url: image.url, name: image.name, size: image.size, key: image.key })
                      }
                    }
                  })
                }}
                config={{ mode: 'auto' }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="overflow-x-auto rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <Reorder.Group
            as="tbody"
            values={fields}
            onReorder={(e) => {
              const activeElement = fields[active]
              e.forEach((item, index) => {
                if (item === activeElement) {
                  move(active, index)
                  setActive(index)
                }
              })
            }}
          >
            {fields.map((field, index) => {
              return (
                <Reorder.Item
                  as="tr"
                  id={field.id}
                  key={field.id}
                  value={field}
                  className={cn('text-sm font-bold text-muted-foreground hover:text-primary', {
                    'animate-pulse transition-opacity': field.url.search('blob:') === 0,
                  })}
                >
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="break-all">{field.name}</TableCell>
                  <TableCell>{(field.size / (1024 * 1024)).toFixed(2)}MB</TableCell>
                  <TableCell>
                    <Image
                      src={field.url}
                      width={72}
                      height={48}
                      alt={field.name}
                      className="rounded-md object-contain"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        remove(index)
                      }}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </TableCell>
                </Reorder.Item>
              )
            })}
          </Reorder.Group>
        </Table>
      </div>
    </div>
  )
}
