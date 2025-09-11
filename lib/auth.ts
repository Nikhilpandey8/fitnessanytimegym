import { NextRequest } from 'next/server'

export interface AdminSession {
  isAuthenticated: boolean
  username?: string
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  return username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD
}

export function createSessionCookie(username: string): string {
  const sessionData = {
    username,
    timestamp: Date.now(),
  }
  return btoa(JSON.stringify(sessionData))
}

export function verifySession(request: NextRequest): AdminSession {
  const sessionCookie = request.cookies.get('admin_session')?.value
  
  if (!sessionCookie) {
    return { isAuthenticated: false }
  }

  try {
    const sessionData = JSON.parse(atob(sessionCookie))
    const isValid = sessionData.username === process.env.ADMIN_USERNAME
    const isRecent = Date.now() - sessionData.timestamp < 24 * 60 * 60 * 1000 // 24 hours
    
    if (isValid && isRecent) {
      return { isAuthenticated: true, username: sessionData.username }
    }
  } catch (error) {
    console.error('Session verification failed:', error)
  }

  return { isAuthenticated: false }
}