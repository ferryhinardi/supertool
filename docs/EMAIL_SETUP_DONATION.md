# Email Setup for Donation Thank You Emails

## Overview

Donation thank you emails are automatically sent when a user completes a donation through the `/support` page. This document explains how to set up and test the email functionality.

## Architecture

**Email Flow**:
1. User completes donation on Polar checkout
2. Polar sends `order.created` webhook to `/api/webhooks/polar`
3. Webhook handler saves order to Supabase `orders` table
4. Webhook handler sends thank you email via Resend
5. User receives beautiful HTML email with receipt info

**Files Involved**:
- `lib/services/email.ts` - Email service wrapper (Resend client)
- `app/api/webhooks/polar/route.ts` - Webhook handler (calls email service)
- `.env` - Email configuration (API key, sender email)

## Setup Instructions

### 1. Sign Up for Resend

1. Go to https://resend.com
2. Sign up for a free account (3,000 emails/month, 100 emails/day)
3. Verify your email address

### 2. Get API Key

1. Navigate to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it "SuperTool Production" (or similar)
4. Copy the API key (starts with `re_`)

### 3. Configure Environment Variables

Add to your `.env` file:

```bash
# Resend Email Configuration
RESEND_API_KEY=re_your_actual_api_key_here

# For testing: Use Resend's test email (no domain verification needed)
RESEND_FROM_EMAIL=onboarding@resend.dev

# For production: Use your verified domain
# RESEND_FROM_EMAIL=support@supertool.app

# Optional: Where users can reply
RESEND_REPLY_TO_EMAIL=hello@supertool.app
```

### 4. Verify Sender Domain (Production Only)

**For testing**: Skip this step - use `onboarding@resend.dev`

**For production**:
1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., `supertool.app`)
4. Add DNS records to your domain provider:
   - SPF record
   - DKIM records (2 records)
   - DMARC record (optional but recommended)
5. Wait for verification (usually < 5 minutes)
6. Update `RESEND_FROM_EMAIL` to use your domain

### 5. Test Email Configuration

Create a test API route to verify email setup:

```typescript
// app/api/test/email/route.ts
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/services/email'

export async function GET() {
  try {
    const result = await sendEmail({
      to: 'your-email@example.com', // Replace with your email
      subject: 'SuperTool Email Test',
      html: '<h1>Success!</h1><p>Email configuration is working.</p>',
      text: 'Success! Email configuration is working.',
    })

    return NextResponse.json({ success: true, emailId: result.id })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
```

Visit `http://localhost:3000/api/test/email` and check your inbox.

## Testing Donation Emails

### Option 1: Make a Real Test Donation

1. Start dev server: `pnpm dev`
2. Go to http://localhost:3000/support
3. Select a tier or enter custom amount
4. Complete checkout with test card
5. Check webhook logs for email confirmation
6. Verify email received in inbox

### Option 2: Simulate Webhook Event

Create a script to send a test webhook:

```bash
# scripts/test-donation-email.sh
#!/bin/bash

curl -X POST http://localhost:3000/api/webhooks/polar \
  -H "Content-Type: application/json" \
  -H "webhook-id: test_$(date +%s)" \
  -H "webhook-timestamp: $(date -u +%s)" \
  -H "webhook-signature: skip_for_local_testing" \
  -d '{
    "type": "order.created",
    "data": {
      "id": "test_order_123",
      "customer": {
        "id": "cust_123",
        "email": "your-email@example.com",
        "name": "Test Donor"
      },
      "amount": 1500,
      "currency": "USD",
      "status": "succeeded"
    }
  }'
```

**Note**: This won't work in production due to webhook signature verification.

## Email Template Customization

### Edit Email Content

Modify the HTML template in `lib/services/email.ts`:

```typescript
function generateDonationThankYouHTML({ donorName, amount }) {
  return `
    <!DOCTYPE html>
    <html>
      <!-- Edit email content here -->
    </html>
  `
}
```

### Email Features

- **Responsive Design**: Works on mobile and desktop
- **Dark Mode Compatible**: Looks good in light and dark email clients
- **Plain Text Fallback**: Includes text-only version for accessibility
- **Professional Branding**: Uses SuperTool gradient colors
- **Clear CTA**: "Explore SuperTool" button links back to site

### Customization Ideas

1. **Add Receipt PDF**: Generate PDF receipt and attach to email
2. **Add Tax Info**: Include tax deduction information (if applicable)
3. **Personalized Message**: Different messages based on donation amount
4. **Donor Recognition**: Option to opt-in to public supporter list
5. **Impact Stats**: Show how donation helps (e.g., "Covers 100 tool uses")

## Troubleshooting

### Email Not Sending

**Check 1: Verify API Key**
```bash
# In your terminal
echo $RESEND_API_KEY
# Should output: re_...
```

**Check 2: Check Logs**
```bash
# Look for email errors in console
pnpm dev
# Watch for "Failed to send thank you email:" messages
```

**Check 3: Verify Webhook Received**
```bash
# Check Polar dashboard → Webhooks → Event Log
# Should see "order.created" events
```

**Check 4: Test Resend Directly**
```typescript
// Quick test in email.ts
const { data, error } = await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'delivered@resend.dev', // Resend test inbox
  subject: 'Test',
  html: '<p>Test</p>',
})
console.log({ data, error })
```

### Email Goes to Spam

**Solutions**:
1. Verify domain with DKIM, SPF, DMARC records
2. Use professional "from" email (not gmail/yahoo)
3. Avoid spam trigger words ("free money", "click here now")
4. Include unsubscribe link (if sending marketing emails)
5. Warm up sending domain gradually (start with low volume)

### Rate Limits

**Free Tier Limits**:
- 3,000 emails/month
- 100 emails/day
- 10 emails/second

**If exceeded**:
- Upgrade to paid plan ($20/month for 50K emails)
- Or add queueing system to batch emails

## Security Considerations

1. **Never expose API key**: Keep `RESEND_API_KEY` server-side only
2. **Validate email addresses**: Prevent sending to invalid/malicious addresses
3. **Rate limiting**: Add rate limiting to prevent abuse
4. **Content sanitization**: Sanitize donor names to prevent XSS
5. **Webhook verification**: Always verify Polar webhook signatures (already implemented)

## Monitoring & Analytics

### Track Email Success

Add logging to track email metrics:

```typescript
// In handleOrderCreated
try {
  const emailResult = await sendDonationThankYou(...)
  
  // Log to analytics
  await supabaseServer.from('email_logs').insert({
    order_id: data.id,
    email: customerEmail,
    email_id: emailResult.id,
    status: 'sent',
    sent_at: new Date().toISOString(),
  })
} catch (error) {
  // Log failed emails for retry
  await supabaseServer.from('email_logs').insert({
    order_id: data.id,
    email: customerEmail,
    status: 'failed',
    error_message: error.message,
    failed_at: new Date().toISOString(),
  })
}
```

### Resend Dashboard Metrics

View email metrics at https://resend.com/emails:
- **Delivered**: Successfully delivered to inbox
- **Opened**: User opened email (requires tracking pixels)
- **Clicked**: User clicked links in email
- **Bounced**: Email address invalid or mailbox full
- **Complained**: User marked as spam

## Production Checklist

- [ ] Resend API key configured in production env
- [ ] Custom domain verified (not using onboarding@resend.dev)
- [ ] Reply-to email set to monitored inbox
- [ ] Email template tested on multiple clients (Gmail, Outlook, Apple Mail)
- [ ] Unsubscribe functionality added (if sending recurring emails)
- [ ] Email logging/monitoring set up
- [ ] Error handling tested (API key invalid, rate limit exceeded)
- [ ] Webhook signature verification working
- [ ] Test donation completed successfully
- [ ] Email arrives within 30 seconds of donation

## Cost Estimates

**Free Tier** (0-3,000 emails/month):
- **Cost**: $0/month
- **Suitable for**: < 100 donations/day

**Paid Tier** ($20/month for 50K emails):
- **Cost**: $0.0004/email
- **Suitable for**: 100-1,666 donations/day
- **Example**: 500 donations/month = $10/month actual cost

## Next Steps

After email setup is working:

1. **Add Email Preferences**: Let donors opt-out of emails
2. **Recurring Donor Emails**: Monthly thank you emails for repeat donors
3. **Impact Reports**: Quarterly emails showing donation impact
4. **Email A/B Testing**: Test different subject lines and content
5. **Transactional SMS**: Add SMS notifications via Twilio

## Support

- **Resend Docs**: https://resend.com/docs
- **API Reference**: https://resend.com/docs/api-reference/introduction
- **Status Page**: https://status.resend.com
- **Support**: support@resend.com

---

**Last Updated**: 2025-01-02
**Feature Status**: ✅ Ready for Production
