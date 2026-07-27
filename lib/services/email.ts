/**
 * Email Service using Resend
 * Handles transactional emails (donation receipts, confirmations, etc.)
 *
 * Setup:
 * 1. Sign up at https://resend.com (free: 3,000 emails/month, 100 emails/day)
 * 2. Get API key from https://resend.com/api-keys
 * 3. Add to .env: RESEND_API_KEY=re_...
 * 4. Verify sender domain at https://resend.com/domains (or use onboarding@resend.dev for testing)
 */

import { Resend } from 'resend'

// Lazy initialization to avoid build-time failures
let resend: Resend | null = null

function getResendClient(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured. Get one at https://resend.com/api-keys')
    }
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

/**
 * Default sender email
 * For production: Use verified domain (e.g., support@yourdomain.com)
 * For testing: Use onboarding@resend.dev (no verification needed)
 */
const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const DEFAULT_FROM_NAME = 'SuperTool'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  from?: string
}

/**
 * Send an email using Resend
 * @throws {Error} If RESEND_API_KEY is missing or email fails to send
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ id: string }> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured. Get one at https://resend.com/api-keys')
  }

  try {
    const client = getResendClient()
    const { data, error } = await client.emails.send({
      from: options.from || `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    })

    if (error) {
      console.error('Resend API error:', error)
      throw new Error(`Failed to send email: ${error.message || JSON.stringify(error)}`)
    }

    if (!data?.id) {
      throw new Error('No email ID returned from Resend')
    }

    return { id: data.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

/**
 * Send donation thank you email
 */
export async function sendDonationThankYou(
  recipientEmail: string,
  donorName: string,
  amount: number,
  currency: string = 'USD'
): Promise<{ id: string }> {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100) // Convert cents to dollars

  const html = generateDonationThankYouHTML({
    donorName,
    amount: formattedAmount,
  })

  const text = generateDonationThankYouText({
    donorName,
    amount: formattedAmount,
  })

  return sendEmail({
    to: recipientEmail,
    subject: `Thank you for supporting SuperTool! 💙`,
    html,
    text,
    replyTo: process.env.RESEND_REPLY_TO_EMAIL,
  })
}

/**
 * Generate HTML template for donation thank you email
 */
function generateDonationThankYouHTML({
  donorName,
  amount,
}: {
  donorName: string
  amount: string
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Support</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; background-color: #f9fafb; color: #111827;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 32px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff;">
                Thank You! 💙
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 18px; line-height: 1.6; color: #374151;">
                Hi <strong>${donorName}</strong>,
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                We're incredibly grateful for your generous donation of <strong style="color: #667eea; font-size: 20px;">${amount}</strong>. Your support helps us keep SuperTool free, ad-free, and accessible to everyone.
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                Thanks to supporters like you, we can continue to:
              </p>

              <ul style="margin: 0 0 24px; padding-left: 24px; font-size: 16px; line-height: 1.8; color: #4b5563;">
                <li>Maintain and improve 60+ free tools</li>
                <li>Keep the platform 100% ad-free</li>
                <li>Add new features requested by the community</li>
                <li>Ensure fast, reliable performance for all users</li>
              </ul>

              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #4b5563;">
                Your contribution makes a real difference. Thank you for being part of the SuperTool community!
              </p>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="https://supertool.app" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      Explore SuperTool
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
                With gratitude,<br>
                <strong>The SuperTool Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
                SuperTool - Free Productivity Tools for Everyone
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                This is a receipt for your donation. No further action is required.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version for donation thank you email
 */
function generateDonationThankYouText({
  donorName,
  amount,
}: {
  donorName: string
  amount: string
}): string {
  return `
Thank You for Your Support!

Hi ${donorName},

We're incredibly grateful for your generous donation of ${amount}. Your support helps us keep SuperTool free, ad-free, and accessible to everyone.

Thanks to supporters like you, we can continue to:
- Maintain and improve 60+ free tools
- Keep the platform 100% ad-free
- Add new features requested by the community
- Ensure fast, reliable performance for all users

Your contribution makes a real difference. Thank you for being part of the SuperTool community!

With gratitude,
The SuperTool Team

---
SuperTool - Free Productivity Tools for Everyone
Visit us at: https://supertool.app
  `.trim()
}

/**
 * Test email configuration (call this from API route during development)
 */
export async function testEmailConfig(): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not configured')
    return false
  }

  try {
    // Send test email
    await sendEmail({
      to: 'test@example.com', // Resend won't actually send to this
      subject: 'SuperTool Email Test',
      html: '<p>This is a test email from SuperTool.</p>',
      text: 'This is a test email from SuperTool.',
    })

    return true
  } catch (error) {
    console.error('❌ Email configuration test failed:', error)
    return false
  }
}
