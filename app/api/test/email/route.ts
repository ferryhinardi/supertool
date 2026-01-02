/**
 * Test Email API Route
 * Used to verify Resend email configuration is working
 *
 * Usage:
 * 1. Start dev server: pnpm dev
 * 2. Visit: http://localhost:3000/api/test/email?to=your-email@example.com
 * 3. Check your inbox for test email
 *
 * DELETE THIS FILE BEFORE DEPLOYING TO PRODUCTION
 */

import { type NextRequest, NextResponse } from 'next/server'
import { sendDonationThankYou } from '@/lib/services/email'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY is not configured in environment variables')
      return NextResponse.json(
        {
          success: false,
          error: 'RESEND_API_KEY is not configured',
          note: 'Add RESEND_API_KEY to your .env.local file',
          docs: 'https://resend.com/docs/send-with-nextjs',
        },
        { status: 500 }
      )
    }

    // Get recipient email from query params
    const { searchParams } = new URL(request.url)
    const recipientEmail = searchParams.get('to') || 'test@example.com'
    const testAmount = Number.parseInt(searchParams.get('amount') || '1500', 10)

    console.log('─────────────────────────────────────────')
    console.log('📧 Testing Donation Thank You Email')
    console.log('─────────────────────────────────────────')
    console.log('Timestamp:', new Date().toISOString())
    console.log('Recipient:', recipientEmail)
    console.log('Amount:', testAmount, 'cents =', `$${(testAmount / 100).toFixed(2)}`)
    console.log('From:', process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev')
    console.log('API Key configured:', process.env.RESEND_API_KEY ? '✓ Yes' : '✗ No')
    console.log('─────────────────────────────────────────')

    // Send test donation thank you email
    console.log('Sending email via Resend API...')
    const result = await sendDonationThankYou(recipientEmail, 'Test Donor', testAmount, 'USD')

    const duration = Date.now() - startTime
    console.log('─────────────────────────────────────────')
    console.log('✓ Email sent successfully!')
    console.log('Email ID:', result.id)
    console.log('Duration:', duration, 'ms')
    console.log('─────────────────────────────────────────')
    console.log('📝 Next Steps:')
    console.log('1. Check inbox at:', recipientEmail)
    console.log('2. Check spam/junk folder if not in inbox')
    console.log('3. Check Resend dashboard:', `https://resend.com/emails/${result.id}`)
    console.log('─────────────────────────────────────────')

    return NextResponse.json({
      success: true,
      message: 'Test donation thank you email sent successfully',
      emailId: result.id,
      recipient: recipientEmail,
      amount: testAmount,
      formattedAmount: `$${(testAmount / 100).toFixed(2)}`,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      nextSteps: [
        `Check inbox at: ${recipientEmail}`,
        'Check spam/junk folder if not in inbox',
        `View in Resend dashboard: https://resend.com/emails/${result.id}`,
      ],
      note: "Email sent! If you don't see it in 2-3 minutes, check spam folder.",
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('─────────────────────────────────────────')
    console.error('❌ Test email failed')
    console.error('Duration:', duration, 'ms')
    console.error('Error:', error)
    console.error('─────────────────────────────────────────')

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        troubleshooting: [
          'Verify RESEND_API_KEY is set in .env.local',
          'Check API key is valid at https://resend.com/api-keys',
          'Verify "from" email domain at https://resend.com/domains',
          'On free tier, can only send to verified email addresses',
        ],
        note: 'Make sure RESEND_API_KEY is set in .env.local',
      },
      { status: 500 }
    )
  }
}
