import Link from 'next/link'
import { Metadata } from 'next'

import { cn } from '@/utils'
import { LoginForm } from '@/components/form'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SocialGroup } from '../_components'

export const metadata: Metadata = {
  title: 'Login',
  description: "Welcome back! Login to your account to shop to your heart's content!",
}

export default function LoginPage() {
  return (
    <Card className="max-w-md grow">
      <CardHeader>
        <CardTitle>Welcome back!</CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter>
        <SocialGroup />
      </CardFooter>
      <CardFooter className="flex items-center justify-center gap-1.5">
        <span>Don&apos;t have an account?</span>
        <Link href="/register" className={cn(buttonVariants({ variant: 'link', size: 'none' }))}>
          Register here
        </Link>
      </CardFooter>
    </Card>
  )
}
