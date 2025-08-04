import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/auth/signout']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // API routes that don't require authentication
  const isApiRoute = pathname.startsWith('/api')
  const isAuthApiRoute = pathname.startsWith('/api/auth')

  // If it's a public route or API route, allow access
  if (isPublicRoute || isApiRoute) {
    return NextResponse.next()
  }

  // For now, allow all other routes to avoid middleware errors
  // Authentication will be handled at the page level
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 