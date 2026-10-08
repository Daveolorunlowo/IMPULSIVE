import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow essential static files and assets to pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.includes('.mp4') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.jpeg') ||
    pathname === '/coming-soon.html' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Redirect ALL other traffic to the coming soon page
  return NextResponse.redirect(new URL('/coming-soon.html', request.url))
}

export const config = {
  // Apply middleware to all routes except api, _next/static, _next/image, favicon.ico
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
