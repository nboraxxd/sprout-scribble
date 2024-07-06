export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="mb-header-height flex min-h-[calc(100vh-var(--header-height)*2)] items-center justify-center py-8">
      {children}
    </div>
  )
}
