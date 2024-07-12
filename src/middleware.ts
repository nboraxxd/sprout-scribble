import { NextRequest, NextResponse } from 'next/server'

const protectedPaths = ['/dashboard']
const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const sessionToken = request.cookies.get('authjs.session-token')?.value

  if (!sessionToken && protectedPaths.some((path) => pathname.startsWith(path))) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)

    return NextResponse.redirect(url)
  }

  if (sessionToken && authPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/dashboard/orders', request.url))
  }
}

export const config = {
  matcher: ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/dashboard/:path*'],
}
