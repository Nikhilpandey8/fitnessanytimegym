import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(cookies())
    console.log('Holding membership:', params.id)
    
    const { data, error } = await supabase
      .from('memberships')
      .update({
        status: 'hold',
        paused_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Hold membership error:', error)
      return NextResponse.json({ 
        error: 'Failed to hold membership',
        details: error.message
      }, { status: 500 })
    }

    console.log('Membership held successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to hold membership:', error)
    return NextResponse.json({ 
      error: 'Failed to hold membership',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}