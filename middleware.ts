import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for login page, API routes, and public assets
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  const sessionCookie = request.cookies.get('admin_session')?.value
  
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const sessionData = JSON.parse(atob(sessionCookie))
    const isValid = sessionData.username === 'fitnessanytime'
    const isRecent = Date.now() - sessionData.timestamp < 24 * 60 * 60 * 1000 // 24 hours
    
    if (!isValid || !isRecent) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } catch (error) {
    console.error('Session verification failed:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}