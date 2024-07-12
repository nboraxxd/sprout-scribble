import { auth } from '@/server/auth'

const protectedPaths = ['/dashboard']
const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

export default auth((req) => {
  const { nextUrl } = req
  const isAuthenticated = !!req.auth

  if (!isAuthenticated && protectedPaths.some((path) => nextUrl.pathname.startsWith(path))) {
    const url = new URL('/login', nextUrl)
    url.searchParams.set('next', nextUrl.pathname)

    return Response.redirect(new URL(url))
  }

  if (isAuthenticated && authPaths.some((path) => nextUrl.pathname.startsWith(path))) {
    return Response.redirect(new URL('/', nextUrl))
  }

  if (isAuthenticated && nextUrl.pathname === '/dashboard') {
    return Response.redirect(new URL('/dashboard/orders', nextUrl))
  }
})

export const config = {
  matcher: ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/dashboard/:path*'],
}
