'use client'

import sanitizeHtml from 'sanitize-html'
import StarterKit from '@tiptap/starter-kit'
import { useFormContext } from 'react-hook-form'
import { forwardRef, useImperativeHandle } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Placeholder } from '@tiptap/extension-placeholder'
import { BoldIcon, ItalicIcon, ListIcon, ListOrderedIcon, StrikethroughIcon } from 'lucide-react'

import { AddProductSchemaType } from '@/lib/schema-validations/product.schema'
import { Toggle } from '@/components/ui/toggle'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'

export interface TiptapHandle {
  clearContent: () => void
}

const Tiptap = forwardRef<TiptapHandle>(function TiptapChild(_, ref) {
  const { setValue, getValues } = useFormContext<AddProductSchemaType>()

  const editor = useEditor({
    extensions: [
      Placeholder.configure({
        placeholder: 'Super fast car with a lot of gadgets and a powerful engine.',
        emptyNodeClass:
          'first:before:text-muted-foreground first:before:float-left first:before:content-[attr(data-placeholder)] first:before:pointer-events-none first:before:h-0',
      }),
      StarterKit.configure({
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-4',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-4',
          },
        },
      }),
    ],
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      setValue('description', sanitizeHtml(content))
    },
    immediatelyRender: false,
    content: getValues('description'),
    editorProps: {
      attributes: {
        class:
          'resize-y overflow-y-auto min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      },
    },
  })

  useImperativeHandle(ref, () => ({
    clearContent() {
      editor && editor.commands.clearContent()
    },
  }))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-9 items-center gap-1 rounded-md border border-input">
        {editor ? (
          <>
            <Toggle
              size="sm"
              pressed={editor.isActive('bold')}
              onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
              <BoldIcon className="size-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('italic')}
              onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            >
              <ItalicIcon className="size-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('strike')}
              onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            >
              <StrikethroughIcon className="size-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('orderedList')}
              onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrderedIcon className="size-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('bulletList')}
              onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            >
              <ListIcon className="size-4" />
            </Toggle>
          </>
        ) : (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex size-9">
                <Skeleton className="m-auto size-6" />
              </div>
            ))}
          </>
        )}
      </div>
      {editor ? <EditorContent editor={editor} /> : <Input className="min-h-20" disabled />}
    </div>
  )
})

export default Tiptap
