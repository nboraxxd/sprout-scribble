'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { LoaderCircleIcon } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { zodResolver } from '@hookform/resolvers/zod'

import { LoginSchemaType, loginSchema } from '@/lib/schema-validations/auth.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { emailLogin } from '@/server/actions/user.action'

export default function LoginForm() {
  const { status, executeAsync } = useAction(emailLogin)

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginSchemaType) {
    try {
      await executeAsync(values)
    } catch (error) {
      console.error('🔥 ~ LoginForm ~ error:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6" noValidate>
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
              <div className="flex justify-between">
                <FormLabel>Password</FormLabel>
                <Button variant="link" size="sm" className="h-auto p-0" asChild>
                  <Link href="/auth/reset">Forgot password?</Link>
                </Button>
              </div>
              <FormControl>
                <Input {...field} placeholder="*********" type="password" autoComplete="current-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full gap-1.5">
          {status === 'executing' ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
          Log in
        </Button>
      </form>
    </Form>
  )
}
