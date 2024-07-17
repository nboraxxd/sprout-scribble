import { Metadata } from 'next'

import { UpdateProfileForm } from '@/components/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Update your profile information to keep your account up-to-date.',
}

export default async function ProfilePage() {
  return (
    <Card className="mx-auto w-full max-w-2xl grow">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your profile information.</CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateProfileForm />
      </CardContent>
    </Card>
  )
}
