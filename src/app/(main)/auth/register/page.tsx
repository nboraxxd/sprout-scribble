import Link from 'next/link'
import { Metadata } from 'next'

import { cn } from '@/utils'
import { RegisterForm } from '@/components/form'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SocialGroup } from '../_components'

export const metadata: Metadata = {
  title: 'Register',
  description: "Create an account to shop to your heart's content!",
}

export default function RegisterPage() {
  return (
    <Card className="max-w-md grow">
      <CardHeader>
        <CardTitle>Create an account 🎉</CardTitle>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter>
        <SocialGroup />
      </CardFooter>
      <CardFooter className="flex items-center justify-center gap-1.5">
        <span>Already have an account?</span>
        <Link href="/auth/login" className={cn(buttonVariants({ variant: 'link', size: 'none' }))}>
          Login here
        </Link>
      </CardFooter>
    </Card>
  )
}
