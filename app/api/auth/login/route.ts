import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    console.log('Login attempt:', { username })

    // Check credentials
    if (username === 'fitnessanytime' && password === 'Suraj@001') {
      const sessionData = {
        username,
        timestamp: Date.now(),
      }
      const sessionCookie = btoa(JSON.stringify(sessionData))
      
      const response = NextResponse.json({ success: true })
      response.cookies.set('admin_session', sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
      })
      
      console.log('Login successful')
      return response
    } else {
      console.log('Invalid credentials')
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}