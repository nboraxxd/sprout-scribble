'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { LoaderCircleIcon } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { zodResolver } from '@hookform/resolvers/zod'

import { loginByCode, loginByEmail } from '@/server/actions/user.action'
import { resendTwoFactorCode } from '@/server/actions/two-factor-code.action'
import { LoginSchemaType, loginSchema } from '@/lib/schema-validations/auth.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import FormMessages from '@/components/form/form-messages'

export default function LoginForm() {
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showTwoFactor, setShowTwoFactor] = useState(false)

  const {
    status: loginByEmailStatus,
    executeAsync: loginByEmailExecuteAsync,
    result: loginByEmailResult,
  } = useAction(loginByEmail)
  const { status: resendOTPStatus, executeAsync: resendOTPExecuteAsync } = useAction(resendTwoFactorCode)
  const { status: loginByCodeStatus, executeAsync: loginByCodeExecuteAsync } = useAction(loginByCode)

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      code: undefined,
    },
  })

  useEffect(() => {
    if (loginByEmailStatus === 'executing' || resendOTPStatus === 'executing') {
      setSuccessMessage('')
      setErrorMessage('')
    }
  }, [loginByEmailStatus, resendOTPStatus])

  async function onLogin(values: LoginSchemaType) {
    if (loginByEmailStatus === 'executing') return

    try {
      const response = await loginByEmailExecuteAsync(values)

      if (response?.data?.success === true) {
        setShowTwoFactor(true)
      } else if (response?.data?.success === false) {
        setErrorMessage(response.data.message)
      }
    } catch (error: any) {
      setErrorMessage(error.message)
    }
  }

  async function onVerifyOTP(values: LoginSchemaType) {
    if (loginByCodeStatus === 'executing') return

    if (loginByEmailResult.data?.success === true && loginByEmailResult.data.data && values.code) {
      try {
        const response = await loginByCodeExecuteAsync({
          code: values.code,
          email: values.email,
          id: loginByEmailResult.data.data.id,
        })

        if (response?.data?.success === false) {
          setErrorMessage(response.data.message)
        }
      } catch (error: any) {
        setErrorMessage(error.message)
      }
    }
  }

  async function handleResendOTP() {
    if (resendOTPStatus === 'executing') return

    if (loginByEmailResult.data?.success === true) {
      try {
        const response = await resendOTPExecuteAsync({
          email: form.getValues('email'),
          name: loginByEmailResult.data.data?.name,
        })

        if (response?.data?.success === true) {
          setSuccessMessage(response.data.message)
        } else if (response?.data?.success === false) {
          setErrorMessage(response.data.message)
        }
      } catch (error: any) {
        setErrorMessage(error.message)
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(showTwoFactor ? onVerifyOTP : onLogin)} className="w-full space-y-6" noValidate>
        {showTwoFactor ? (
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    {...field}
                    onChange={(ev) => field.onChange(ev !== '' ? ev : undefined)}
                    containerClassName="justify-center"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormDescription className="text-center">Enter the 6-digit code sent to your email.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <>
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
          </>
        )}
        <FormMessages successMessage={successMessage} errorMessage={errorMessage} />
        <Button
          type="submit"
          className="w-full gap-1.5"
          disabled={loginByEmailStatus === 'executing' || loginByCodeStatus === 'executing'}
        >
          {loginByEmailStatus === 'executing' || loginByCodeStatus === 'executing' ? (
            <LoaderCircleIcon className="size-4 animate-spin" />
          ) : null}
          {showTwoFactor ? 'Verify' : 'Login'}
        </Button>
      </form>
      {showTwoFactor ? (
        <div className="mt-2 text-right">
          OTP not received?{' '}
          <Button type="button" variant="link" size="none" onClick={handleResendOTP}>
            RESEND
          </Button>
        </div>
      ) : null}
    </Form>
  )
}
