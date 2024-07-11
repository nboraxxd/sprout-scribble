'use client'

import { toast } from 'sonner'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LoaderCircleIcon } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { zodResolver } from '@hookform/resolvers/zod'

import { emailRegister, loginByEmail } from '@/server/actions/user.action'
import { RegisterSchemaType, registerSchema } from '@/lib/schema-validations/auth.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import FormMessages from '@/components/form/form-messages'

export default function RegisterForm() {
  const [errorMessage, setErrorMessage] = useState('')

  const { status: emailRegisterStatus, executeAsync: emailRegisterExecuteAsync } = useAction(emailRegister)
  const { status: loginByEmailStatus, executeAsync: loginByEmailExecuteAsync } = useAction(loginByEmail)

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
      const response = await emailRegisterExecuteAsync(values)

      if (response?.data?.success === true) {
        await loginByEmailExecuteAsync({ email: values.email, password: values.password })

        toast.success(response.data.message)
      } else if (response?.data?.success === false) {
        setErrorMessage(response.data.message)
      }
    } catch (error: any) {
      toast.error(error.message || error.toString())
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
        <FormMessages errorMessage={errorMessage} />
        <Button
          type="submit"
          className="w-full gap-1.5"
          disabled={emailRegisterStatus === 'executing' || loginByEmailStatus === 'executing'}
        >
          {emailRegisterStatus === 'executing' || loginByEmailStatus === 'executing' ? (
            <LoaderCircleIcon className="size-4 animate-spin" />
          ) : null}
          Register
        </Button>
      </form>
    </Form>
  )
}
