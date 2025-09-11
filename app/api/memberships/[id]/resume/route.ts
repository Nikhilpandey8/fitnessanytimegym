import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import dayjs from 'dayjs'
export const dynamic = 'force-dynamic'


export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(cookies())
    console.log('Resuming membership:', params.id)
    
    // Get current membership
    const { data: membership, error: fetchError } = await supabase
      .from('memberships')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      console.error('Fetch membership error:', fetchError)
      return NextResponse.json({ 
        error: 'Failed to fetch membership',
        details: fetchError.message
      }, { status: 500 })
    }

    if (membership.status !== 'hold' || !membership.paused_at) {
      return NextResponse.json({ error: 'Membership is not on hold' }, { status: 400 })
    }

    // Calculate paused days
    const pausedDays = dayjs().diff(dayjs(membership.paused_at), 'day')
    const totalPausedDays = membership.paused_days + pausedDays
    
    // Extend end date by paused days
    const newEndDate = dayjs(membership.end_date).add(pausedDays, 'day').format('YYYY-MM-DD')

    const { data, error } = await supabase
      .from('memberships')
      .update({
        status: 'active',
        end_date: newEndDate,
        paused_at: null,
        paused_days: totalPausedDays,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Resume membership error:', error)
      return NextResponse.json({ 
        error: 'Failed to resume membership',
        details: error.message
      }, { status: 500 })
    }

    console.log('Membership resumed successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to resume membership:', error)
    return NextResponse.json({ 
      error: 'Failed to resume membership',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}