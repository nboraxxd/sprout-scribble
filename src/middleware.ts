import { auth } from '@/server/auth'
import { NextResponse } from 'next/server'

const protectedPaths = ['/dashboard']
const adminPaths = ['/dashboard/analytics', '/dashboard/add-product', '/dashboard/products']
const authPaths = ['/login', '/register', '/forgot-password', '/reset-password']

export default auth((req) => {
  const { nextUrl } = req
  const requestHeaders = new Headers(req.headers)

  if (req.ip) requestHeaders.set('request-ip', req.ip)

  const isAuthenticated = !!req.auth
  const isAdmin = req.auth?.user.role === 'admin'

  // Redirect to login if user is not logged in and trying to access protected pages
  if (!isAuthenticated && protectedPaths.some((path) => nextUrl.pathname.startsWith(path))) {
    const url = new URL('/login', nextUrl)
    url.searchParams.set('next', nextUrl.pathname)

    return Response.redirect(new URL(url))
  }

  // Redirect to home if user is logged in and trying to access auth pages
  if (isAuthenticated && authPaths.some((path) => nextUrl.pathname.startsWith(path))) {
    return Response.redirect(new URL('/', nextUrl))
  }

  // Redirect to profile if user isn't admin and trying to access admin pages
  if (!isAdmin && adminPaths.some((path) => nextUrl.pathname.startsWith(path))) {
    return Response.redirect(new URL('/dashboard/profile', nextUrl))
  }

  // Redirect to profile if user to access dashboard
  if (isAuthenticated && nextUrl.pathname === '/dashboard') {
    return Response.redirect(new URL('/dashboard/profile', nextUrl))
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
})

export const config = {
  matcher: ['/login', '/register', '/forgot-password', '/reset-password', '/dashboard/:path*'],
}
