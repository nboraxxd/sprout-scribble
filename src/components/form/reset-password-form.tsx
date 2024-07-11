'use client'

import { toast } from 'sonner'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { LoaderCircleIcon } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { zodResolver } from '@hookform/resolvers/zod'

import { resetPassword } from '@/server/actions/user.action'
import { ResetPasswordSchemaType, resetPasswordSchema } from '@/lib/schema-validations/auth.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import FormMessages from '@/components/form/form-messages'

export default function ForgotPasswordForm({ token }: { token: string }) {
  const [errorMessage, setErrorMessage] = useState('')

  const router = useRouter()
  const { status, executeAsync } = useAction(resetPassword)

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: ResetPasswordSchemaType) {
    if (status === 'executing') return

    try {
      const response = await executeAsync({ ...values, token })

      if (response?.data?.success === true) {
        setErrorMessage('')
        toast.success(response.data.message)
        router.push('/login')
        router.refresh()
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
        <div className="hidden">
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" autoComplete="email" disabled readOnly />
          </FormControl>
        </div>
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input {...field} placeholder="*********" type="password" autoComplete="new-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormMessages errorMessage={errorMessage} />
        <Button type="submit" className="w-full gap-1.5" disabled={status === 'executing'}>
          {status === 'executing' ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
          Reset Password
        </Button>
      </form>
    </Form>
  )
}
