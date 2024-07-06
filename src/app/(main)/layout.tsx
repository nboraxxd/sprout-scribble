import { Header } from '@/components/common'

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="container sm:px-6 lg:px-8">
      <Header />
      {children}
    </div>
  )
}
