import { Metadata } from 'next'
import { RedirectType, redirect } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResetPasswordForm } from '@/components/form'

interface SearchParams {
  token?: string
}

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your password if you forgot it.',
}

export default function ForgotPasswordPage({ searchParams: { token } }: { searchParams: SearchParams }) {
  if (!token) return redirect('/', RedirectType.replace)

  return (
    <Card className="max-w-md grow">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm token={token} />
      </CardContent>
    </Card>
  )
}
