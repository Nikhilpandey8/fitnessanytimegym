import nodemailer from 'nodemailer'

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'gymbolt30@gmail.com',
    pass: 'bexq kzos qhax goks'
  }
})

export interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailData): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: 'FitnessAnytime <gymbolt30@gmail.com>',
      to,
      subject,
      html
    })
    
    console.log('Email sent successfully:', info.messageId)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

export function generateFeeSlipEmail(memberName: string, feeSlipData: any): string {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN')
  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FitnessAnytime - Fee Receipt</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .header p { margin: 5px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .receipt-header { text-align: center; margin-bottom: 30px; }
        .receipt-header h2 { color: #333; margin: 0 0 10px 0; }
        .receipt-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .info-row:last-child { margin-bottom: 0; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .membership-details { border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .membership-details h3 { color: #667eea; margin: 0 0 15px 0; }
        .amount-section { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; }
        .amount-section h3 { margin: 0 0 10px 0; }
        .amount { font-size: 32px; font-weight: bold; margin: 0; }
        .signature-section { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; }
        .signature-line { border-bottom: 2px solid #333; display: inline-block; padding-bottom: 5px; margin-bottom: 10px; min-width: 200px; }
        .footer { background-color: #333; color: white; padding: 20px; text-align: center; }
        .footer p { margin: 5px 0; }
        @media (max-width: 600px) {
          .info-row { flex-direction: column; }
          .label { margin-bottom: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏋️ FitnessAnytime</h1>
          <p>Premium Fitness Center</p>
        </div>
        
        <div class="content">
          <div class="receipt-header">
            <h2>Fee Receipt & Membership Confirmation</h2>
            <p>Thank you for choosing FitnessAnytime!</p>
          </div>
          
          <div class="receipt-info">
            <div class="info-row">
              <span class="label">Receipt ID:</span>
              <span class="value">${feeSlipData.id.slice(0, 8)}...</span>
            </div>
            <div class="info-row">
              <span class="label">Date Issued:</span>
              <span class="value">${formatDate(feeSlipData.issued_on)}</span>
            </div>
            <div class="info-row">
              <span class="label">Member Name:</span>
              <span class="value">${memberName}</span>
            </div>
          </div>
          
          <div class="membership-details">
            <h3>Membership Details</h3>
            <div class="info-row">
              <span class="label">Duration:</span>
              <span class="value">${feeSlipData.duration_label}</span>
            </div>
            <div class="info-row">
              <span class="label">Start Date:</span>
              <span class="value">${formatDate(feeSlipData.start_date)}</span>
            </div>
            <div class="info-row">
              <span class="label">End Date:</span>
              <span class="value">${formatDate(feeSlipData.end_date)}</span>
            </div>
          </div>
          
          <div class="amount-section">
            <h3>Total Amount Paid</h3>
            <p class="amount">${formatCurrency(feeSlipData.fee_amount)}</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #2d5a2d; text-align: center;">
              <strong>🎉 Your membership is now active! Welcome to FitnessAnytime family!</strong>
            </p>
          </div>
          
          <div class="signature-section">
            <p>Authorized Signature</p>
            <div class="signature-line">Suraj Tomar</div>
            <p><strong>FitnessAnytime Gym</strong></p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>FitnessAnytime Gym</strong></p>
          <p>Shukar Bazar, Chauhanpatti, Delhi-110094</p>
          <p>Contact: 9811008460 | Email: gymbolt30@gmail.com</p>
          <p>Your Fitness, Our Priority</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateExpiryAlertEmail(memberName: string, membershipData: any): string {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN')
  const isExpired = new Date(membershipData.end_date) < new Date()
  const daysRemaining = Math.ceil((new Date(membershipData.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FitnessAnytime - Membership Alert</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 30px; }
        .alert-box { background-color: ${isExpired ? '#ffebee' : '#fff3e0'}; border-left: 5px solid ${isExpired ? '#f44336' : '#ff9800'}; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .alert-icon { font-size: 48px; text-align: center; margin-bottom: 15px; }
        .membership-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .cta-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #333; color: white; padding: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏋️ FitnessAnytime</h1>
          <p>Membership Alert</p>
        </div>
        
        <div class="content">
          <h2>Hello ${memberName}!</h2>
          
          <div class="alert-box">
            <div class="alert-icon">${isExpired ? '⚠️' : '⏰'}</div>
            <h3 style="margin: 0 0 10px 0; color: ${isExpired ? '#d32f2f' : '#f57c00'};">
              ${isExpired ? 'Membership Expired!' : 'Membership Expiring Soon!'}
            </h3>
            <p style="margin: 0; font-size: 16px;">
              ${isExpired 
                ? `Your membership expired on ${formatDate(membershipData.end_date)}. Renew now to continue your fitness journey!`
                : `Your membership will expire in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} on ${formatDate(membershipData.end_date)}.`
              }
            </p>
          </div>
          
          <div class="membership-info">
            <h3 style="color: #333; margin: 0 0 15px 0;">Current Membership Details</h3>
            <div class="info-row">
              <span class="label">Duration:</span>
              <span class="value">${membershipData.duration_label}</span>
            </div>
            <div class="info-row">
              <span class="label">End Date:</span>
              <span class="value">${formatDate(membershipData.end_date)}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value" style="color: ${isExpired ? '#d32f2f' : '#f57c00'}; font-weight: bold;">
                ${isExpired ? 'EXPIRED' : 'EXPIRING SOON'}
              </span>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <h3>Don't let your fitness journey stop!</h3>
            <p>Renew your membership today and continue achieving your fitness goals with us.</p>
            <a href="#" class="cta-button">Contact Us to Renew</a>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1565c0; text-align: center;">
              <strong>💪 Special Offer: Contact us for renewal discounts!</strong>
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>FitnessAnytime Gym</strong></p>
          <p>Shukar Bazar, Chauhanpatti, Delhi-110094</p>
          <p>Contact: 9811008460 | Email: gymbolt30@gmail.com</p>
          <p>Your Fitness, Our Priority</p>
          <p>Visit us to renew your membership today!</p>
        </div>
      </div>
    </body>
    </html>
  `
}