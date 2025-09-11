import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    console.log('Processing logout request')
    
    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully' 
    })
    
    // Clear the admin session cookie
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    })
    
    console.log('Logout successful - cookie cleared')
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ 
      error: 'Logout failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}