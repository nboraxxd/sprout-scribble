'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { LoaderCircleIcon } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { zodResolver } from '@hookform/resolvers/zod'

import { forgotPassword } from '@/server/actions/user.action'
import { ForgotPasswordSchemaType, forgotPasswordSchema } from '@/lib/schema-validations/auth.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import FormMessages from '@/components/form/form-messages'

export default function ForgotPasswordForm() {
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const { status, executeAsync } = useAction(forgotPassword)

  const form = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  useEffect(() => {
    if (status === 'executing') {
      setErrorMessage('')
      setSuccessMessage('')
    }
  }, [status])

  async function onSubmit(values: ForgotPasswordSchemaType) {
    if (status === 'executing') return

    try {
      const response = await executeAsync(values)

      if (response?.data?.success === true) {
        setSuccessMessage(response.data.message)
      } else if (response?.data?.success === false) {
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
                <Input {...field} placeholder="bruce@wayne.dc" type="email" autoComplete="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormMessages errorMessage={errorMessage} successMessage={successMessage} />
        <Button type="submit" className="w-full gap-1.5" disabled={status === 'executing'}>
          {status === 'executing' ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
          Send Reset Link
        </Button>
      </form>
    </Form>
  )
}
