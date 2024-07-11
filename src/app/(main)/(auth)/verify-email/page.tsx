import { Metadata } from 'next'
import { LoaderCircleIcon } from 'lucide-react'
import { RedirectType, redirect } from 'next/navigation'

import { loginByToken } from '@/server/actions/user.action'
import LoginByToken from './login-by-token'

interface SearchParams {
  token?: string
}

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your email to continue shopping!',
}

export default async function VerifyEmailPage({ searchParams: { token } }: { searchParams: SearchParams }) {
  if (!token) redirect('/', RedirectType.replace)

  const response = await loginByToken(token)

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <p className="flex items-center gap-x-3">
        <LoaderCircleIcon className="size-8 animate-spin" />
        <span className="font-medium text-foreground">Verifying email...</span>
      </p>
      <LoginByToken response={response} />
    </div>
  )
}
