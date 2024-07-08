'use client'

import { useForm } from 'react-hook-form'
import { useAction } from 'next-safe-action/hooks'
import { zodResolver } from '@hookform/resolvers/zod'

import { emailRegister } from '@/server/actions/user.action'
import { RegisterSchemaType, registerSchema } from '@/lib/schema-validations/auth.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { LoaderCircleIcon } from 'lucide-react'

export default function RegisterForm() {
  const { status, executeAsync } = useAction(emailRegister)
  console.log('🔥 ~ RegisterForm ~ status:', status)

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: RegisterSchemaType) {
    try {
      const response = await executeAsync(values)
      console.log('🔥 ~ onSubmit ~ response:', response)
    } catch (error) {
      console.error('🔥 ~ RegisterForm ~ error:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Bruch Wayne" type="text" autoComplete="name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} placeholder="bruchwayne@wayne-ent.com" type="email" autoComplete="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} placeholder="*********" type="password" autoComplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full gap-1.5" disabled={status === 'executing'}>
          {status === 'executing' ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
          Register
        </Button>
      </form>
    </Form>
  )
}
