import { redirect } from 'next/navigation'

import { auth } from '@/server/auth'
import { DashboardNav } from '@/app/dashboard/_components'

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  if (!session) redirect('/')

  return (
    <main className="flex flex-col">
      <DashboardNav user={session.user} />
      {children}
    </main>
  )
}
