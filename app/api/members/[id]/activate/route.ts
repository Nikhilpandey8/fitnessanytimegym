import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { calculateEndDate } from '@/lib/utils'
import { sendEmail, generateFeeSlipEmail } from '@/lib/email'
export const dynamic = 'force-dynamic'


export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(cookies())
    const body = await request.json()
    console.log('Activating membership for member:', params.id, body)
    
    // Validate required fields
    if (!body.duration_label || !body.fee_amount || !body.start_date) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }


    const endDate = calculateEndDate(body.start_date, body.duration_label)

    // Create membership
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .insert([{
        member_id: params.id,
        start_date: body.start_date,
        end_date: endDate,
        duration_label: body.duration_label,
        fee_amount: parseFloat(body.fee_amount),
        status: 'active'
      }])
      .select()
      .single()

    if (membershipError) {
      console.error('Membership creation error:', membershipError)
      return NextResponse.json({ 
        error: 'Failed to create membership',
        details: membershipError.message
      }, { status: 500 })
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert([{
        member_id: params.id,
        membership_id: membership.id,
        amount: parseFloat(body.fee_amount),
        note: `Payment for ${body.duration_label} membership`
      }])

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      // Don't fail the whole operation for payment error
    }

    // Create fee slip
    const { data: feeSlip, error: slipError } = await supabase
      .from('fee_slips')
      .insert([{
        member_id: params.id,
        membership_id: membership.id,
        fee_amount: parseFloat(body.fee_amount),
        start_date: body.start_date,
        end_date: endDate,
        duration_label: body.duration_label,
        gym_name: 'FitnessAnytime Gym',
        signed_by: 'Suraj Tomar'
      }])
      .select()
      .single()

    if (slipError) {
      console.error('Fee slip creation error:', slipError)
      return NextResponse.json({ 
        error: 'Failed to create fee slip',
        details: slipError.message
      }, { status: 500 })
    }

    // Get member details for email
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', params.id)
      .single()

    // Send fee slip email if member has email
    if (member && member.email && feeSlip) {
      try {
        const emailHtml = generateFeeSlipEmail(member.full_name, feeSlip)
        const emailSent = await sendEmail({
          to: member.email,
          subject: 'FitnessAnytime - Fee Receipt & Membership Confirmation',
          html: emailHtml
        })
        
        if (emailSent) {
          console.log('Fee slip email sent successfully')
        } else {
          console.error('Failed to send fee slip email')
        }
      } catch (emailError) {
        console.error('Error sending fee slip email:', emailError)
      }
    }

    console.log('Membership activated successfully:', { membership, feeSlip })
    return NextResponse.json({ membership, feeSlip })
  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json({ 
      error: 'Failed to activate membership',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}