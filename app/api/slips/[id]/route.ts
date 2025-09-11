import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(cookies())
    console.log('Fetching fee slip for membership:', params.id)
    
    const { data, error } = await supabase
      .from('fee_slips')
      .select(`
        *,
        members (
          full_name,
          phone
        )
      `)
      .eq('membership_id', params.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Fee slip fetch error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch fee slip',
        details: error.message
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        error: 'No fee slip found for this membership'
      }, { status: 404 })
    }

    const feeSlip = data[0]
    console.log('Fee slip fetched successfully:', feeSlip)
    return NextResponse.json(feeSlip)
  } catch (error) {
    console.error('Failed to fetch fee slip:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch fee slip',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}