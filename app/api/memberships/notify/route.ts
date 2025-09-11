import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { sendEmail, generateExpiryAlertEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(cookies())
    console.log('Checking for expiring memberships...')
    
    // Mark expired memberships first
    const { data: expiredCount, error: markError } = await supabase
      .rpc('mark_expired_memberships')
    
    if (markError) {
      console.error('Error marking expired memberships:', markError)
    } else {
      console.log(`Marked ${expiredCount} memberships as expired`)
    }

    // Get expiring memberships (within 7 days)
    const { data: expiringMemberships, error: expiringError } = await supabase
      .rpc('get_expiring_memberships', { days_ahead: 7 })

    if (expiringError) {
      console.error('Error fetching expiring memberships:', expiringError)
      return NextResponse.json({ 
        error: 'Failed to fetch expiring memberships',
        details: expiringError.message
      }, { status: 500 })
    }

    // Get expired memberships
    const { data: expiredMemberships, error: expiredError } = await supabase
      .rpc('get_expired_memberships')

    if (expiredError) {
      console.error('Error fetching expired memberships:', expiredError)
      return NextResponse.json({ 
        error: 'Failed to fetch expired memberships',
        details: expiredError.message
      }, { status: 500 })
    }

    const allMemberships = [...(expiringMemberships || []), ...(expiredMemberships || [])]
    console.log(`Found ${allMemberships.length} memberships requiring notification`)

    let emailsSent = 0
    let emailsFailed = 0

    // Send notification emails
    for (const membership of allMemberships) {
      if (!membership.member_email) continue

      try {
        const emailHtml = generateExpiryAlertEmail(membership.member_name, {
          end_date: membership.end_date,
          duration_label: membership.duration_label,
          fee_amount: membership.fee_amount
        })
        
        const emailSent = await sendEmail({
          to: membership.member_email,
          subject: 'FitnessAnytime - Membership Expiry Alert',
          html: emailHtml
        })
        
        if (emailSent) {
          emailsSent++
          console.log(`Expiry alert sent to ${membership.member_email}`)
          
          // Add to email queue for tracking
          await supabase
            .from('email_queue')
            .insert([{
              member_id: membership.member_id,
              email_type: 'expiry_alert',
              recipient_email: membership.member_email,
              subject: 'FitnessAnytime - Membership Expiry Alert',
              html_content: emailHtml,
              status: 'sent',
              sent_at: new Date().toISOString()
            }])
        } else {
          emailsFailed++
          console.error(`Failed to send email to ${membership.member_email}`)
          
          // Add to email queue as failed
          await supabase
            .from('email_queue')
            .insert([{
              member_id: membership.member_id,
              email_type: 'expiry_alert',
              recipient_email: membership.member_email,
              subject: 'FitnessAnytime - Membership Expiry Alert',
              html_content: emailHtml,
              status: 'failed',
              error_message: 'SMTP sending failed'
            }])
        }
      } catch (emailError) {
        emailsFailed++
        console.error(`Error sending email to ${membership.member_email}:`, emailError)
        
        // Add to email queue as failed
        await supabase
          .from('email_queue')
          .insert([{
            member_id: membership.member_id,
            email_type: 'expiry_alert',
            recipient_email: membership.member_email,
            subject: 'FitnessAnytime - Membership Expiry Alert',
            html_content: '',
            status: 'failed',
            error_message: emailError instanceof Error ? emailError.message : 'Unknown error'
          }])
      }
    }

    console.log(`Email notification summary: ${emailsSent} sent, ${emailsFailed} failed`)
    
    return NextResponse.json({
      success: true,
      summary: {
        expiredMarked: expiredCount || 0,
        notificationsFound: allMemberships.length,
        emailsSent,
        emailsFailed
      }
    })
  } catch (error) {
    console.error('Error in notification process:', error)
    return NextResponse.json({ 
      error: 'Notification process failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}