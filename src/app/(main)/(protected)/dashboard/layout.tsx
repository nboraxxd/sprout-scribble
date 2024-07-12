export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <main className="flex">{children}</main>
}
