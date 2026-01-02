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
  try {
    // Get recipient email from query params
    const { searchParams } = new URL(request.url)
    const recipientEmail = searchParams.get('to') || 'test@example.com'
    const testAmount = Number.parseInt(searchParams.get('amount') || '1500', 10)

    console.log('Testing donation thank you email...')
    console.log('Recipient:', recipientEmail)
    console.log('Amount:', testAmount, 'cents')

    // Send test donation thank you email
    const result = await sendDonationThankYou(recipientEmail, 'Test Donor', testAmount, 'USD')

    console.log('✓ Test email sent successfully')
    console.log('Email ID:', result.id)

    return NextResponse.json({
      success: true,
      message: 'Test donation thank you email sent successfully',
      emailId: result.id,
      recipient: recipientEmail,
      amount: testAmount,
      formattedAmount: `$${(testAmount / 100).toFixed(2)}`,
      note: 'Check your inbox! Also check spam folder if not in inbox.',
    })
  } catch (error) {
    console.error('Test email failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        note: 'Make sure RESEND_API_KEY is set in .env',
      },
      { status: 500 }
    )
  }
}
