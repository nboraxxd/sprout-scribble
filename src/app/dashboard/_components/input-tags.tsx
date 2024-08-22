'use client'

import { XIcon } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { AnimatePresence, motion } from 'framer-motion'
import { Dispatch, SetStateAction, forwardRef, useState } from 'react'

import { cn } from '@/utils'
import { ProductVariantSchemaType } from '@/lib/schema-validations/product.schema'
import { Badge } from '@/components/ui/badge'
import { Input, InputProps } from '@/components/ui/input'

type Props = InputProps & {
  value: string[]
  onChange: Dispatch<SetStateAction<string[]>>
}

const InputTags = forwardRef<HTMLInputElement, Props>(function InputTags({ value, onChange, ...props }, _ref) {
  const [inputValue, setInputValue] = useState('')
  const [isFocus, setIsFocus] = useState(false)

  const { setFocus } = useFormContext<ProductVariantSchemaType>()

  const handleAddTag = () => {
    if (!inputValue) return

    if (value.includes(inputValue.toLowerCase())) {
      setInputValue('')
      return
    }

    const newValue = [...value, inputValue.toLowerCase()]

    onChange(newValue)
    setInputValue('')
  }

  return (
    <div
      className={cn(
        'min-h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
        { 'outline-none ring-2 ring-ring ring-offset-2': isFocus }
      )}
      onClick={() => setFocus('tags')}
    >
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <AnimatePresence>
          {value.map((tag, index) => (
            <motion.div animate={{ scale: 1 }} initial={{ scale: 0 }} exit={{ scale: 0 }} key={index}>
              <Badge variant={'secondary'}>
                {tag}
                <button type="button" className="ml-1 w-3" onClick={() => onChange(value.filter((i) => i !== tag))}>
                  <XIcon className="w-3" />
                </button>
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="flex">
          <Input
            className="border-transparent py-0 focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Add tags"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Tab' || e.key === ' ') {
                e.preventDefault()
                handleAddTag()
              } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
                e.preventDefault()
                const newValue = [...value]
                newValue.pop()
                onChange(newValue)
              }
            }}
            value={inputValue}
            onFocus={() => setIsFocus(true)}
            onBlurCapture={() => {
              handleAddTag()
              setIsFocus(false)
            }}
            onChange={(e) => setInputValue(e.target.value)}
            {...props}
          />
        </div>
      </div>
    </div>
  )
})

export default InputTags
