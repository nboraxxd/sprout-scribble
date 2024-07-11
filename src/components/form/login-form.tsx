'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LoaderCircleIcon } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { zodResolver } from '@hookform/resolvers/zod'

import { loginByEmail } from '@/server/actions/user.action'
import { LoginSchemaType, loginSchema } from '@/lib/schema-validations/auth.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import FormMessages from '@/components/form/form-messages'

export default function LoginForm() {
  const [errorMessage, setErrorMessage] = useState('')

  const { status, executeAsync } = useAction(loginByEmail)

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginSchemaType) {
    if (status === 'executing') return

    try {
      const response = await executeAsync(values)

      if (response?.data?.success === false) {
        setErrorMessage(response.data.message)
      }
    } catch (error: any) {
      setErrorMessage(error.message)
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
                <Input {...field} placeholder="bruchwayne@dc.com" type="email" autoComplete="email" />
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
                  <Link href="/forgot-password">Forgot password?</Link>
                </Button>
              </div>
              <FormControl>
                <Input {...field} placeholder="*********" type="password" autoComplete="current-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormMessages errorMessage={errorMessage} />
        <Button type="submit" className="w-full gap-1.5" disabled={status === 'executing'}>
          {status === 'executing' ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
          Log in
        </Button>
      </form>
    </Form>
  )
}
