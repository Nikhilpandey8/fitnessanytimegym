import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(cookies())
    console.log('Fetching members from Supabase...')
    
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        memberships (
          id, status, start_date, end_date, duration_label, fee_amount, paused_at, paused_days, created_at, updated_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch members',
        details: error.message
      }, { status: 500 })
    }

    console.log('Members fetched successfully:', data?.length || 0, 'members')
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Failed to fetch members:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch members',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(cookies())
    const body = await request.json()
    console.log('Creating new member:', body)
    
    // Validate required fields
    if (!body.full_name || body.full_name.trim() === '') {
      return NextResponse.json({ 
        error: 'Full name is required' 
      }, { status: 400 })
    }


    const memberData = {
      full_name: body.full_name.trim(),
      phone: body.phone?.trim() || null,
      notes: body.notes?.trim() || null
    }

    console.log('Inserting member data:', memberData)

    const { data, error } = await supabase
      .from('members')
      .insert([memberData])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ 
        error: 'Failed to create member',
        details: error.message
      }, { status: 500 })
    }

    console.log('Member created successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to create member:', error)
    return NextResponse.json({ 
      error: 'Failed to create member',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}