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
    console.log('Deactivating membership:', params.id)
    
    const { data, error } = await supabase
      .from('memberships')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Deactivate membership error:', error)
      return NextResponse.json({ 
        error: 'Failed to deactivate membership',
        details: error.message
      }, { status: 500 })
    }

    console.log('Membership deactivated successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to deactivate membership:', error)
    return NextResponse.json({ 
      error: 'Failed to deactivate membership',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}