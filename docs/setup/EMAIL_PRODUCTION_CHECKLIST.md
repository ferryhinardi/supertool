# Before Production: Complete Email Setup Checklist

This guide provides detailed step-by-step instructions for making the donation email system production-ready.

## Table of Contents

1. [Domain Verification (Required)](#1-domain-verification-required)
2. [Environment Variables Setup](#2-environment-variables-setup)
3. [Email Template Customization](#3-email-template-customization)
4. [Delete Test Endpoint](#4-delete-test-endpoint)
5. [Production Testing](#5-production-testing)
6. [Monitoring Setup](#6-monitoring-setup)
7. [Email Deliverability Optimization](#7-email-deliverability-optimization)
8. [Security Hardening](#8-security-hardening)
9. [Performance Optimization](#9-performance-optimization)
10. [Final Launch Checklist](#10-final-launch-checklist)

---

## 1. Domain Verification (Required)

### Why This Matters

Using `onboarding@resend.dev` is fine for testing, but for production:
- ❌ Looks unprofessional to donors
- ❌ Higher chance of landing in spam
- ❌ Cannot customize sender name
- ✅ Custom domain builds trust and brand recognition

### Step-by-Step Domain Verification

#### Step 1.1: Access Resend Dashboard

```bash
# 1. Go to Resend Domains page
https://resend.com/domains

# 2. Click "Add Domain" button
```

#### Step 1.2: Enter Your Domain

**Choose Your Domain Strategy**:

**Option A: Use Subdomain (Recommended)**
```
Domain: mail.supertool.app
Sender Email: support@mail.supertool.app
Benefits: Isolates email reputation, easier to manage
```

**Option B: Use Root Domain**
```
Domain: supertool.app
Sender Email: support@supertool.app
Benefits: Cleaner email addresses
Warning: Affects your entire domain's email reputation
```

**Recommendation**: Use subdomain for production email to isolate email reputation from your main domain.

#### Step 1.3: Add DNS Records

Resend will provide 4 DNS records to add:

**1. SPF Record** (TXT)
```
Type: TXT
Name: mail.supertool.app (or @)
Value: v=spf1 include:resend.com ~all
TTL: 3600
```

**2. DKIM Records** (CNAME) - You'll get 2 of these
```
Type: CNAME
Name: resend._domainkey.mail.supertool.app
Value: resend._domainkey.u12345.wl.resend.com
TTL: 3600

Type: CNAME
Name: resend2._domainkey.mail.supertool.app
Value: resend2._domainkey.u12345.wl.resend.com
TTL: 3600
```

**3. DMARC Record** (TXT) - Optional but highly recommended
```
Type: TXT
Name: _dmarc.mail.supertool.app
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
TTL: 3600
```

#### Step 1.4: Add Records to Your DNS Provider

The process varies by provider. Here are guides for popular ones:

**Vercel DNS**:
```bash
# 1. Go to Vercel Dashboard → Your Project → Settings → Domains
# 2. Find your domain → Click "Edit"
# 3. Scroll to "DNS Records"
# 4. Click "Add Record"
# 5. Add each record from above

# Example for SPF:
Type: TXT
Name: mail
Value: v=spf1 include:resend.com ~all
```

**Cloudflare**:
```bash
# 1. Go to Cloudflare Dashboard
# 2. Select your domain
# 3. Go to DNS → Records
# 4. Click "Add record"
# 5. Add each record

# IMPORTANT: Turn OFF Cloudflare proxy (grey cloud icon) for email records
```

**GoDaddy**:
```bash
# 1. Go to GoDaddy Domain Manager
# 2. Find your domain → Click "DNS"
# 3. Click "Add" under DNS Records
# 4. Add each record
```

**Namecheap**:
```bash
# 1. Go to Domain List → Manage
# 2. Advanced DNS tab
# 3. Click "Add New Record"
# 4. Add each record
```

**AWS Route 53**:
```bash
# 1. Go to Route 53 Console
# 2. Select your hosted zone
# 3. Click "Create Record"
# 4. Add each record

# For CNAME records, ensure Name is the full subdomain
```

#### Step 1.5: Verify DNS Propagation

```bash
# Wait 5-15 minutes for DNS propagation
# Then check if records are live:

# Check SPF record
dig TXT mail.supertool.app

# Check DKIM records
dig CNAME resend._domainkey.mail.supertool.app
dig CNAME resend2._domainkey.mail.supertool.app

# Check DMARC record
dig TXT _dmarc.mail.supertool.app
```

**Expected Output**:
```
mail.supertool.app.    3600    IN    TXT    "v=spf1 include:resend.com ~all"
```

#### Step 1.6: Verify in Resend Dashboard

```bash
# 1. Go back to Resend → Domains
# 2. Click "Verify" button next to your domain
# 3. Status should change to "Verified" ✓
# 4. If not verified, wait longer or check DNS records

# Troubleshooting: Click "Check DNS" to see which records are missing
```

---

## 2. Environment Variables Setup

### Step 2.1: Update Production Environment

**Vercel Deployment**:

```bash
# 1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

# 2. Add RESEND_API_KEY
Variable Name: RESEND_API_KEY
Value: re_your_production_api_key_here
Environments: ✓ Production (only)

# 3. Add RESEND_FROM_EMAIL
Variable Name: RESEND_FROM_EMAIL
Value: support@mail.supertool.app
Environments: ✓ Production

# 4. Add RESEND_REPLY_TO_EMAIL (Optional)
Variable Name: RESEND_REPLY_TO_EMAIL
Value: hello@supertool.app
Environments: ✓ Production

# 5. Click "Save"
```

**Other Hosting Providers**:

**Netlify**:
```bash
# Site Settings → Build & deploy → Environment → Environment variables
RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=support@mail.supertool.app
RESEND_REPLY_TO_EMAIL=hello@supertool.app
```

**Railway**:
```bash
# Project → Variables → New Variable
RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=support@mail.supertool.app
```

**Self-Hosted (Docker/VPS)**:
```bash
# Add to your .env file on server
echo "RESEND_API_KEY=re_your_key" >> /app/.env
echo "RESEND_FROM_EMAIL=support@mail.supertool.app" >> /app/.env
echo "RESEND_REPLY_TO_EMAIL=hello@supertool.app" >> /app/.env

# Restart application
pm2 restart supertool
# or
docker-compose restart
```

### Step 2.2: Verify Environment Variables

Create a temporary verification endpoint:

```typescript
// app/api/admin/verify-env/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    resendConfigured: !!process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || 'NOT SET',
    replyToEmail: process.env.RESEND_REPLY_TO_EMAIL || 'NOT SET',
    // Don't expose actual API key
    apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 5) || 'NOT SET',
  })
}
```

Visit: `https://yourdomain.com/api/admin/verify-env`

**Expected Output**:
```json
{
  "resendConfigured": true,
  "fromEmail": "support@mail.supertool.app",
  "replyToEmail": "hello@supertool.app",
  "apiKeyPrefix": "re_ab"
}
```

**⚠️ Delete this endpoint after verification!**

### Step 2.3: Separate API Keys for Environments

**Best Practice**: Use different API keys for staging and production

```bash
# Development
RESEND_API_KEY=re_dev_xxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev

# Staging
RESEND_API_KEY=re_staging_xxxxxxxx
RESEND_FROM_EMAIL=staging@mail.supertool.app

# Production
RESEND_API_KEY=re_prod_xxxxxxxx
RESEND_FROM_EMAIL=support@mail.supertool.app
```

**Create API Keys**:
```bash
# 1. Go to https://resend.com/api-keys
# 2. Create separate keys:
#    - "SuperTool Development" (for local testing)
#    - "SuperTool Staging" (for staging env)
#    - "SuperTool Production" (for production)
# 3. Copy each key to appropriate environment
```

---

## 3. Email Template Customization

### Step 3.1: Update Branding

Edit `lib/services/email.ts` to customize email template:

```typescript
// Line 92: Update sender name
const DEFAULT_FROM_NAME = 'SuperTool' // Change to your brand name

// Line 156: Update email header gradient colors
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// Change to match your brand colors

// Line 161: Update header title
<h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff;">
  Thank You! 💙  {/* Customize message and emoji */}
</h1>

// Line 203: Update CTA button link
<a href="https://supertool.app" style="...">
  Explore SuperTool
</a>
// Change to your actual domain

// Line 220: Update footer branding
<p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
  SuperTool - Free Productivity Tools for Everyone
</p>
```

### Step 3.2: Test Customized Template

```bash
# 1. Update template in lib/services/email.ts
# 2. Restart dev server
pnpm dev

# 3. Send test email
http://localhost:3000/api/test/email?to=your-email@example.com

# 4. Check email rendering in multiple clients:
#    - Gmail (web + mobile app)
#    - Outlook (web + desktop)
#    - Apple Mail (macOS + iOS)
#    - Yahoo Mail
#    - ProtonMail
```

### Step 3.3: Email Preview Tool

Use Resend's built-in preview:

```bash
# 1. Send test email via Resend API
# 2. Go to https://resend.com/emails
# 3. Click on sent email
# 4. Click "Preview" tab
# 5. Test in different email clients via preview tool
```

### Step 3.4: Mobile Responsiveness Check

Ensure email looks good on mobile:

```html
<!-- Key responsive elements in template: -->

<!-- 1. Responsive table width -->
<table width="600" ... style="max-width: 600px; width: 100%;">

<!-- 2. Responsive padding -->
style="padding: 40px 40px;" <!-- Desktop -->
@media only screen and (max-width: 600px) {
  padding: 20px !important; /* Mobile */
}

<!-- 3. Responsive font sizes -->
style="font-size: 18px;" <!-- Desktop -->
@media only screen and (max-width: 600px) {
  font-size: 16px !important; /* Mobile */
}
```

Test on actual devices:
- iPhone (Safari Mail)
- Android (Gmail app)
- iPad (Apple Mail)

---

## 4. Delete Test Endpoint

### Step 4.1: Remove Test Files

```bash
# Delete test endpoint directory
rm -rf app/api/test

# Verify deletion
ls -la app/api/test
# Should output: No such file or directory
```

### Step 4.2: Remove Test References

Search for any test endpoint references:

```bash
# Search for test endpoint usage
grep -r "api/test/email" . --exclude-dir=node_modules --exclude-dir=.git

# Should return: docs files only (safe to keep in docs)
```

### Step 4.3: Verify in Production Build

```bash
# Build production version
pnpm build

# Output should not include test route
# Look for: Route (app) /api/test/email
# If present, delete didn't work - try again
```

---

## 5. Production Testing

### Step 5.1: Deploy to Staging First

```bash
# 1. Deploy to staging environment
git push origin staging

# 2. Wait for deployment
# Vercel: Check deployment status at vercel.com
# Netlify: Check deploy logs

# 3. Verify staging URL is live
curl https://staging.supertool.app/api/webhooks/polar
# Should return 401 (expected - webhook requires signature)
```

### Step 5.2: Test Email on Staging

**Option A: Make Real Test Donation**

```bash
# 1. Go to staging site
https://staging.supertool.app/support

# 2. Select $5 donation (minimum)

# 3. Use Polar test card:
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)

# 4. Complete checkout

# 5. Check email arrives within 30 seconds
# 6. Verify email content is correct
# 7. Check sender name and email address
```

**Option B: Simulate Webhook (Advanced)**

```bash
# Get webhook secret from Polar dashboard
WEBHOOK_SECRET="polar_whs_..."

# Create test signature (requires standard-webhooks library)
# This is complex - recommend Option A instead
```

### Step 5.3: Production Smoke Test

After deploying to production:

```bash
# 1. Make real $5 test donation on production
https://supertool.app/support

# 2. Verify email received within 30 seconds

# 3. Check all email elements:
   ✓ From: support@mail.supertool.app (not onboarding@resend.dev)
   ✓ Subject: "Thank you for supporting SuperTool! 💙"
   ✓ Donor name is correct
   ✓ Donation amount is correct ($5.00)
   ✓ Email renders correctly on mobile
   ✓ CTA button links to correct URL
   ✓ Reply-To is set (if configured)

# 4. Check webhook logs
# Vercel: Functions → Select webhook function → Logs
# Look for:
#   ✓ Order created/updated: ord_xxx
#   ✓ Thank you email sent to: donor@example.com

# 5. Verify order in database
# Supabase: SQL Editor → Run:
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;
# Should show your test order
```

### Step 5.4: Multi-Device Testing

Test email on different devices:

```bash
# Desktop
✓ Gmail (Chrome)
✓ Outlook (Edge)
✓ Apple Mail (Safari)
✓ Yahoo Mail (Firefox)

# Mobile
✓ Gmail app (Android)
✓ Apple Mail (iOS)
✓ Outlook app (Android/iOS)

# Tablet
✓ Gmail (iPad)
✓ Apple Mail (iPad)
```

### Step 5.5: Spam Filter Testing

Check if emails land in spam:

```bash
# 1. Send test email to multiple providers
#    - Gmail
#    - Outlook/Hotmail
#    - Yahoo
#    - iCloud
#    - ProtonMail

# 2. Check each inbox
#    ✓ Email in Inbox (not Spam/Promotions)
#    ✓ No spam warnings shown
#    ✓ Sender name displayed correctly
#    ✓ No "via resend.com" warning (means DKIM is working)

# 3. Check email headers for spam score
#    Gmail: More → Show original → Look for:
#      SPF: PASS
#      DKIM: PASS
#      DMARC: PASS
```

**If emails go to spam**, see [Section 7: Email Deliverability](#7-email-deliverability-optimization)

---

## 6. Monitoring Setup

### Step 6.1: Set Up Email Logging (Optional but Recommended)

Create database table for email logs:

```sql
-- Run in Supabase SQL Editor
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(polar_order_id),
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL DEFAULT 'donation_thank_you',
  email_id TEXT, -- Resend email ID
  status TEXT NOT NULL, -- 'sent', 'failed', 'bounced'
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_email_logs_order_id ON email_logs(order_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
```

### Step 6.2: Update Webhook Handler with Logging

Edit `app/api/webhooks/polar/route.ts`:

```typescript
// Around line 327, replace email sending code with:

if (customerEmail && data.amount > 0) {
  try {
    const emailResult = await sendDonationThankYou(
      customerEmail,
      customerName,
      data.amount,
      data.currency || 'USD'
    )
    
    console.log('✓ Thank you email sent to:', customerEmail)
    
    // Log successful email send
    await supabaseServer.from('email_logs').insert({
      order_id: data.id,
      recipient_email: customerEmail,
      email_type: 'donation_thank_you',
      email_id: emailResult.id,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    
  } catch (emailError) {
    console.error('Failed to send thank you email:', emailError)
    
    // Log failed email attempt
    await supabaseServer.from('email_logs').insert({
      order_id: data.id,
      recipient_email: customerEmail,
      email_type: 'donation_thank_you',
      status: 'failed',
      error_message: emailError instanceof Error ? emailError.message : String(emailError),
      created_at: new Date().toISOString(),
    })
  }
}
```

### Step 6.3: Set Up Resend Webhooks (Advanced)

Monitor email delivery events:

```bash
# 1. Go to Resend Dashboard → Webhooks
https://resend.com/webhooks

# 2. Click "Add Endpoint"

# 3. Enter webhook URL:
https://supertool.app/api/webhooks/resend

# 4. Select events to monitor:
   ✓ email.sent
   ✓ email.delivered
   ✓ email.delivery_delayed
   ✓ email.complained
   ✓ email.bounced
   ✓ email.opened (optional)
   ✓ email.clicked (optional)

# 5. Copy webhook secret
```

Create webhook handler:

```typescript
// app/api/webhooks/resend/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/auth/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body
    
    // Update email log based on event
    switch (type) {
      case 'email.delivered':
        await supabaseServer
          .from('email_logs')
          .update({ 
            status: 'delivered',
            delivered_at: new Date().toISOString()
          })
          .eq('email_id', data.email_id)
        break
        
      case 'email.bounced':
        await supabaseServer
          .from('email_logs')
          .update({ 
            status: 'bounced',
            error_message: data.bounce_reason
          })
          .eq('email_id', data.email_id)
        break
        
      case 'email.complained':
        await supabaseServer
          .from('email_logs')
          .update({ status: 'complained' })
          .eq('email_id', data.email_id)
        break
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Resend webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
```

### Step 6.4: Create Monitoring Dashboard

Query email stats:

```sql
-- Email success rate (last 30 days)
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM email_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY status;

-- Daily email volume
SELECT 
  DATE(created_at) as date,
  COUNT(*) as emails_sent,
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced
FROM email_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Failed emails (needs retry)
SELECT 
  order_id,
  recipient_email,
  error_message,
  created_at
FROM email_logs
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 20;
```

### Step 6.5: Set Up Alerts

**Vercel Monitoring**:

```bash
# 1. Go to Vercel Dashboard → Monitoring
# 2. Set up alerts for webhook function:
#    - Error rate > 5%
#    - Response time > 10s
#    - Function invocations spike > 500/hour
```

**Resend Email Alerts**:

```bash
# 1. Go to Resend Dashboard → Settings → Notifications
# 2. Enable email alerts for:
#    - High bounce rate (> 5%)
#    - High complaint rate (> 0.1%)
#    - API errors
#    - Rate limit approaching
```

---

## 7. Email Deliverability Optimization

### Step 7.1: Check Email Authentication

```bash
# Use online tools to check DNS records:

# 1. MXToolbox
https://mxtoolbox.com/SuperTool.aspx?action=dkim%3amail.supertool.app

# 2. Mail Tester
# Send test email to the address provided at:
https://www.mail-tester.com
# They'll give you a score out of 10

# 3. Google Postmaster Tools (if sending to many Gmail users)
https://postmaster.google.com/
```

### Step 7.2: Warm Up Your Domain

**Why**: Sending high volume immediately looks like spam to ISPs.

**Strategy**:
```
Week 1: Send 50 emails/day
Week 2: Send 100 emails/day
Week 3: Send 250 emails/day
Week 4: Send 500 emails/day
Week 5+: Full volume
```

**Implementation**:
```typescript
// lib/services/email.ts - Add rate limiting

let dailyEmailCount = 0
let dailyLimit = 50 // Start conservative
const limitResetTime = new Date()

export async function sendEmail(options: SendEmailOptions) {
  // Check daily limit
  if (dailyEmailCount >= dailyLimit) {
    console.warn('Daily email limit reached:', dailyLimit)
    // Queue for next day or upgrade limit
    throw new Error('Daily email limit reached')
  }
  
  // Send email...
  const result = await resend.emails.send({...})
  
  dailyEmailCount++
  return result
}
```

### Step 7.3: Monitor Sender Reputation

```bash
# 1. Check domain reputation at:
https://senderscore.org/

# 2. Check IP reputation (Resend's IPs):
https://www.senderbase.org/

# 3. Monitor Google Postmaster Tools:
https://postmaster.google.com/
# Shows:
#   - Spam rate
#   - IP reputation
#   - Domain reputation
#   - Feedback loop data
```

### Step 7.4: Implement Feedback Loops

```bash
# 1. Register with major ISPs:

# Gmail Feedback Loop (automatic via Resend)
# - No action needed

# Microsoft JMRP
https://postmaster.live.com/snds/JMRP.aspx

# Yahoo Complaint Feedback Loop
https://help.yahoo.com/kb/postmaster/SLN3438.html

# 2. Handle complaints in webhook:
# When user marks as spam, automatically:
#   - Remove from future email lists
#   - Log complaint for analysis
```

### Step 7.5: Optimize Email Content

**Avoid Spam Triggers**:
```
❌ FREE MONEY NOW!!!
❌ Click here immediately!!!
❌ 100% guaranteed!!!
❌ Dear Friend (impersonal)
❌ All images, no text

✅ Thank you for supporting SuperTool! 💙
✅ Your generous donation of $15.00
✅ With gratitude, The SuperTool Team
✅ Personalized with donor name
✅ Good text-to-image ratio
```

**Spam Score Checker**:
```bash
# Use tools to check your email:
https://www.isnotspam.com/
# Paste your email HTML and get spam score
```

---

## 8. Security Hardening

### Step 8.1: API Key Rotation

```bash
# Rotate API keys every 90 days

# 1. Create new API key in Resend
# 2. Update production env vars
# 3. Deploy changes
# 4. Monitor for errors
# 5. Delete old API key after 24 hours
```

### Step 8.2: Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// lib/services/email-rate-limiter.ts
import { LRUCache } from 'lru-cache'

const rateLimitCache = new LRUCache<string, number>({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
})

export function checkEmailRateLimit(email: string): boolean {
  const attempts = rateLimitCache.get(email) || 0
  
  if (attempts >= 5) {
    // Max 5 emails per hour per address
    return false
  }
  
  rateLimitCache.set(email, attempts + 1)
  return true
}
```

Use in webhook handler:

```typescript
// app/api/webhooks/polar/route.ts
import { checkEmailRateLimit } from '@/lib/services/email-rate-limiter'

// Before sending email:
if (!checkEmailRateLimit(customerEmail)) {
  console.warn('Rate limit exceeded for:', customerEmail)
  // Don't send, but don't fail webhook
  return
}
```

### Step 8.3: Input Sanitization

Prevent XSS in email content:

```typescript
// lib/services/email.ts
import DOMPurify from 'isomorphic-dompurify'

function sanitizeForEmail(text: string): string {
  // Remove any HTML tags from user input
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

export async function sendDonationThankYou(
  recipientEmail: string,
  donorName: string,
  amount: number,
  currency: string = 'USD'
) {
  // Sanitize donor name
  const safeDonorName = sanitizeForEmail(donorName)
  
  // ... rest of function
}
```

### Step 8.4: Email Address Validation

```typescript
// lib/services/email-validator.ts
export function isValidEmail(email: string): boolean {
  // RFC 5322 compliant email regex
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!regex.test(email)) {
    return false
  }
  
  // Check for common typos
  const commonTypos = [
    'gmial.com', // gmail.com
    'yahooo.com', // yahoo.com
    'hotmial.com', // hotmail.com
  ]
  
  const domain = email.split('@')[1]
  if (commonTypos.includes(domain)) {
    return false
  }
  
  return true
}
```

### Step 8.5: Prevent Email Enumeration

Don't reveal whether email exists:

```typescript
// In webhook handler - always return success
try {
  await sendDonationThankYou(...)
  console.log('✓ Email sent')
} catch (emailError) {
  // Log error but don't expose to client
  console.error('Email failed:', emailError)
  // Still return success to Polar
}
```

---

## 9. Performance Optimization

### Step 9.1: Async Email Sending

Make email sending non-blocking:

```typescript
// app/api/webhooks/polar/route.ts

// Don't await email - fire and forget
if (customerEmail && data.amount > 0) {
  // Send email asynchronously
  sendDonationThankYou(customerEmail, customerName, data.amount, data.currency)
    .then(() => console.log('✓ Email sent'))
    .catch(err => console.error('Email failed:', err))
}

// Return immediately - don't wait for email
console.log('✓ Order created/updated:', data.id)
```

**Benefit**: Webhook responds faster to Polar (< 500ms)

### Step 9.2: Email Queue (Advanced)

For high volume, use a queue:

```bash
# Install queue library
pnpm add bullmq ioredis

# Set up Redis (required for queue)
# Option 1: Vercel KV (easiest)
# Option 2: Upstash Redis (free tier)
# Option 3: Self-hosted Redis
```

```typescript
// lib/services/email-queue.ts
import { Queue } from 'bullmq'
import Redis from 'ioredis'

const connection = new Redis(process.env.REDIS_URL!)

export const emailQueue = new Queue('emails', { connection })

// Add email to queue
export async function queueDonationEmail(
  recipientEmail: string,
  donorName: string,
  amount: number,
  currency: string
) {
  await emailQueue.add('donation-thank-you', {
    recipientEmail,
    donorName,
    amount,
    currency,
  })
}
```

```typescript
// lib/services/email-worker.ts
import { Worker } from 'bullmq'
import { sendDonationThankYou } from './email'

new Worker(
  'emails',
  async (job) => {
    const { recipientEmail, donorName, amount, currency } = job.data
    await sendDonationThankYou(recipientEmail, donorName, amount, currency)
  },
  { connection }
)
```

### Step 9.3: Batch Email Sending

If sending multiple emails (future feature):

```typescript
// Send up to 100 emails in single API call
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

const emails = donors.map(donor => ({
  from: 'support@mail.supertool.app',
  to: donor.email,
  subject: 'Monthly Impact Report',
  html: generateMonthlyReport(donor),
}))

// Batch send
await resend.batch.send(emails)
```

### Step 9.4: Caching Email Templates

Pre-compile templates:

```typescript
// lib/services/email-templates.ts
const templateCache = new Map<string, string>()

export function getCachedTemplate(
  templateName: string,
  data: Record<string, any>
): string {
  const cacheKey = `${templateName}-${JSON.stringify(data)}`
  
  if (templateCache.has(cacheKey)) {
    return templateCache.get(cacheKey)!
  }
  
  const html = generateTemplate(templateName, data)
  templateCache.set(cacheKey, html)
  
  return html
}
```

---

## 10. Final Launch Checklist

### Pre-Launch Checklist

**Domain & DNS**:
- [ ] Domain verified in Resend dashboard (green checkmark)
- [ ] SPF record added and verified
- [ ] DKIM records added and verified (both)
- [ ] DMARC record added (optional but recommended)
- [ ] DNS propagation complete (check with `dig` commands)
- [ ] `RESEND_FROM_EMAIL` updated to custom domain

**Environment Configuration**:
- [ ] `RESEND_API_KEY` set in production environment
- [ ] `RESEND_FROM_EMAIL` set to verified domain
- [ ] `RESEND_REPLY_TO_EMAIL` set (if applicable)
- [ ] Separate API keys for dev/staging/prod
- [ ] Environment variables verified via temporary endpoint

**Email Template**:
- [ ] Branding updated (colors, logo, sender name)
- [ ] All URLs point to production domain
- [ ] CTA button links to correct page
- [ ] Footer has correct company info
- [ ] Template tested on Gmail, Outlook, Apple Mail
- [ ] Mobile responsiveness verified
- [ ] Plain text version is readable

**Code Quality**:
- [ ] Test endpoint deleted (`app/api/test/email`)
- [ ] TypeScript compilation passes (`pnpm exec tsc --noEmit`)
- [ ] Linting passes (`pnpm exec biome check`)
- [ ] Production build succeeds (`pnpm build`)
- [ ] No console.log statements in production code
- [ ] Error handling tested (API key invalid, network errors)

**Testing**:
- [ ] Email sent successfully on staging
- [ ] Email sent successfully on production (test donation)
- [ ] Email arrives within 30 seconds
- [ ] Email not in spam folder
- [ ] Webhook logs show successful email send
- [ ] Database has order record
- [ ] Email deliverability score > 8/10 (mail-tester.com)

**Monitoring**:
- [ ] Email logging table created (if using)
- [ ] Webhook handler logs to console
- [ ] Resend dashboard accessible
- [ ] Alerts configured for high bounce/complaint rates
- [ ] Error tracking set up (Sentry, LogRocket, etc.)

**Security**:
- [ ] API key is secret (not in git)
- [ ] Rate limiting implemented
- [ ] Input sanitization added
- [ ] Email validation working
- [ ] No email enumeration possible
- [ ] Webhook signature verification working

**Documentation**:
- [ ] Team knows how to check email logs
- [ ] Runbook created for common issues
- [ ] Resend dashboard credentials saved in team password manager
- [ ] Contact info for Resend support saved

### Post-Launch Monitoring (First 7 Days)

**Day 1**:
- [ ] Monitor every email send (first 10 donations)
- [ ] Check email deliverability rate (should be 95%+)
- [ ] Verify no emails in spam
- [ ] Check Resend dashboard for errors
- [ ] Monitor webhook logs for failures

**Day 2-3**:
- [ ] Review email delivery stats in Resend
- [ ] Check for bounce rate (should be < 2%)
- [ ] Check complaint rate (should be < 0.1%)
- [ ] Look for patterns in failed emails
- [ ] Review donor feedback (if any)

**Day 4-7**:
- [ ] Calculate email success rate
- [ ] Identify any deliverability issues
- [ ] Check sender reputation score
- [ ] Review and fix any common errors
- [ ] Optimize template if needed

### Success Metrics

**Target Metrics** (after 30 days):
- Delivery Rate: > 95%
- Bounce Rate: < 5%
- Complaint Rate: < 0.1%
- Open Rate: > 40% (if tracking)
- Email Send Time: < 5 seconds
- Webhook Response Time: < 1 second

**Red Flags** (investigate immediately):
- Delivery Rate: < 90%
- Bounce Rate: > 10%
- Complaint Rate: > 0.5%
- Emails consistently in spam
- High rate of "via resend.com" warnings
- Webhook timeouts or failures

### Rollback Plan

If emails are causing issues:

```typescript
// Quick disable: Comment out email sending in webhook handler

// app/api/webhooks/polar/route.ts:324
/*
if (customerEmail && data.amount > 0) {
  try {
    await sendDonationThankYou(...)
  } catch (emailError) {
    console.error('Failed to send thank you email:', emailError)
  }
}
*/
```

Re-deploy to disable emails without breaking donations.

### Support Resources

**Resend**:
- Docs: https://resend.com/docs
- Status: https://status.resend.com
- Support: support@resend.com
- Community: https://discord.gg/resend

**Email Deliverability**:
- MXToolbox: https://mxtoolbox.com
- Mail Tester: https://www.mail-tester.com
- Postmark DMARC Guide: https://postmarkapp.com/guides/dmarc

**Emergency Contacts**:
- Resend support: support@resend.com
- Polar support: support@polar.sh
- Your hosting provider support

---

## Quick Reference Commands

```bash
# Check DNS records
dig TXT mail.supertool.app
dig CNAME resend._domainkey.mail.supertool.app

# Test email deliverability
curl -X POST https://supertool.app/api/test/email?to=your@email.com

# Check production logs
vercel logs --follow

# Monitor Resend dashboard
open https://resend.com/emails

# Query recent orders
supabase db query "SELECT * FROM orders ORDER BY created_at DESC LIMIT 10"

# Check email logs
supabase db query "SELECT status, COUNT(*) FROM email_logs GROUP BY status"
```

---

**Last Updated**: 2025-01-02  
**Estimated Time to Complete**: 30-60 minutes  
**Complexity**: Medium  
**Priority**: HIGH - Required before accepting real donations

