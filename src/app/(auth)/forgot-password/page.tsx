import { Metadata } from 'next'

import { ForgotPasswordForm } from '@/components/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Forgot your password? No worries! Reset it here!',
}

export default function ForgotPasswordPage() {
  return (
    <Card className="max-w-md grow">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  )
}
