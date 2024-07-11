import { Metadata } from 'next'
import { LoaderCircleIcon } from 'lucide-react'
import LoginByToken from './login-by-token'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify your email to continue shopping!',
}

export default function VerifyEmailPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <p className="flex items-center gap-x-3">
        <LoaderCircleIcon className="size-8 animate-spin" />
        <span className="font-medium text-foreground">Verifying email...</span>
      </p>
      <Suspense fallback={null}>
        <LoginByToken />
      </Suspense>
    </div>
  )
}
