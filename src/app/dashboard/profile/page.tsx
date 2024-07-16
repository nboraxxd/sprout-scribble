import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/server/auth'
import { UpdateProfileForm } from '@/components/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Update your profile information to keep your account up-to-date.',
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session) redirect('/')

  return (
    <Card className="mx-auto w-full max-w-2xl grow">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your profile information.</CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateProfileForm user={session.user} />
      </CardContent>
    </Card>
  )
}
