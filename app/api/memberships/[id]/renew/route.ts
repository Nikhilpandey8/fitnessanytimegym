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
    console.log('Renewing membership:', params.id, body)
    
    // Validate required fields
    if (!body.duration_label || !body.fee_amount || !body.start_date) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Get current membership
    const { data: currentMembership, error: fetchError } = await supabase
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

    const endDate = calculateEndDate(body.start_date, body.duration_label)
    const previousEndDate = currentMembership.end_date

    // Update membership
    const { data: updatedMembership, error: updateError } = await supabase
      .from('memberships')
      .update({
        start_date: body.start_date,
        end_date: endDate,
        duration_label: body.duration_label,
        fee_amount: parseFloat(body.fee_amount),
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Membership update error:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update membership',
        details: updateError.message
      }, { status: 500 })
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert([{
        member_id: currentMembership.member_id,
        membership_id: params.id,
        amount: parseFloat(body.fee_amount),
        note: `Renewal payment for ${body.duration_label} membership`
      }])

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
    }

    // Create fee slip
    const { data: feeSlip, error: slipError } = await supabase
      .from('fee_slips')
      .insert([{
        member_id: currentMembership.member_id,
        membership_id: params.id,
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

    // Create renewal record
    // Create renewal record with retry logic
    let renewalCreated = false
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { error: renewalError } = await supabase
          .from('membership_renewals')
          .insert([{
            membership_id: params.id,
            member_id: currentMembership.member_id,
            previous_end_date: previousEndDate,
            new_end_date: endDate,
            duration_label: body.duration_label,
            fee_amount: parseFloat(body.fee_amount),
            renewed_by: 'Suraj Tomar'
          }])

        if (!renewalError) {
          renewalCreated = true
          console.log('Renewal record created successfully')
          break
        } else {
          console.error(`Renewal record creation error (attempt ${attempt + 1}):`, renewalError)
          if (attempt < 2) {
            // Wait 1 second before retry to allow schema cache to refresh
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      } catch (renewalError) {
        console.error(`Renewal record creation failed (attempt ${attempt + 1}):`, renewalError)
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    if (!renewalCreated) {
      console.warn('Failed to create renewal record after 3 attempts - continuing with membership renewal')
    }

    // Get member details for email
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', currentMembership.member_id)
      .single()

    // Send renewal confirmation email if member has email and fee slip was created
    if (member && member.email && feeSlip) {
      try {
        const emailHtml = generateFeeSlipEmail(member.full_name, feeSlip)
        const emailSent = await sendEmail({
          to: member.email,
          subject: 'FitnessAnytime - Membership Renewed Successfully!',
          html: emailHtml
        })
        
        if (emailSent) {
          console.log('Renewal confirmation email sent successfully')
        } else {
          console.error('Failed to send renewal confirmation email')
        }
      } catch (emailError) {
        console.error('Error sending renewal confirmation email:', emailError)
      }
    }

    console.log('Membership renewed successfully:', { updatedMembership, feeSlip })
    return NextResponse.json({ membership: updatedMembership, feeSlip })
  } catch (error) {
    console.error('Renewal error:', error)
    return NextResponse.json({ 
      error: 'Failed to renew membership',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}