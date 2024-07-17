import { DashboardNav } from '@/app/dashboard/_components'

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="flex flex-col">
      <DashboardNav />
      {children}
    </main>
  )
}
