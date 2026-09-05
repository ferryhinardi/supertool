# DNS Setup Guide for SuperTool Email Deliverability

## 🎯 Overview

This guide will help you configure DNS records for your domain `supertool.id` to enable email deliverability through Resend. After completing this setup, your donation thank-you emails will be sent from `noreply@supertool.id` and will arrive in recipients' inboxes instead of spam folders.

**Estimated Time**: 30 minutes setup + 24-48 hours DNS propagation  
**Prerequisites**: Access to your domain registrar's DNS management panel

---

## 📋 Step-by-Step Process

### Step 1: Add Domain to Resend (5 minutes)

1. **Login to Resend Dashboard**
   - Go to: https://resend.com/login
   - Login with your Resend account

2. **Navigate to Domains Section**
   - Click on **"Domains"** in the left sidebar
   - Or go directly to: https://resend.com/domains

3. **Add New Domain**
   - Click the **"Add Domain"** button
   - Enter your domain: `supertool.id`
   - Click **"Add"**

4. **Get DNS Records**
   - After adding the domain, Resend will display 3 DNS records:
     - **SPF Record** (TXT record)
     - **DKIM Record** (TXT record with a long key)
     - **DMARC Record** (TXT record for reporting)
   
   - Keep this page open - you'll need to copy these values in the next steps

---

### Step 2: Access Your Domain Registrar's DNS Settings (2 minutes)

You need to add DNS records through your domain registrar (where you purchased `supertool.id`). Here are instructions for common registrars:

#### Option A: Cloudflare DNS
1. Login to https://dash.cloudflare.com
2. Select your domain `supertool.id`
3. Click **"DNS"** tab on the left
4. Click **"Add record"** button

#### Option B: Namecheap
1. Login to https://www.namecheap.com/myaccount/login/
2. Go to **"Domain List"**
3. Click **"Manage"** next to `supertool.id`
4. Go to **"Advanced DNS"** tab
5. Scroll to **"Host Records"** section

#### Option C: GoDaddy
1. Login to https://account.godaddy.com
2. Click **"My Products"**
3. Find `supertool.id` and click **"DNS"**
4. Scroll to **"Records"** section
5. Click **"Add"** button

#### Option D: Google Domains / Squarespace Domains
1. Login to https://domains.google.com or https://domains.squarespace.com
2. Select `supertool.id`
3. Click **"DNS"** in the left menu
4. Scroll to **"Custom records"** section
5. Click **"Manage custom records"**

#### Option E: Other Registrars
- Look for sections named: "DNS Management", "DNS Records", "DNS Settings", or "Name Server Records"
- You need to add **TXT records** - this is standard across all registrars

---

### Step 3: Add SPF Record (3 minutes)

The SPF (Sender Policy Framework) record tells receiving servers that Resend is authorized to send emails on behalf of your domain.

**Record Details from Resend Dashboard:**
- **Type**: TXT
- **Name/Host**: `@` or leave blank (represents root domain `supertool.id`)
- **Value/Content**: Copy the SPF value from Resend (looks like: `v=spf1 include:_spf.resend.com ~all`)
- **TTL**: 3600 (or use Auto/Default)

**Example Values:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

**⚠️ Important Notes:**
- If you already have an SPF record, you need to **modify** it, not add a new one
- A domain can only have **one SPF record**
- If existing SPF record exists (e.g., `v=spf1 include:_spf.google.com ~all`), modify it to include Resend:
  ```
  v=spf1 include:_spf.google.com include:_spf.resend.com ~all
  ```
- Keep the `~all` at the end

**How to Add:**
1. Click **"Add Record"** or **"Add New Record"** button
2. Select type: **TXT**
3. Enter name: **@** (or leave blank)
4. Paste the SPF value from Resend dashboard
5. Set TTL to **3600** (1 hour)
6. Click **"Save"** or **"Add Record"**

---

### Step 4: Add DKIM Record (5 minutes)

The DKIM (DomainKeys Identified Mail) record allows receiving servers to verify that emails weren't tampered with during transit.

**Record Details from Resend Dashboard:**
- **Type**: TXT
- **Name/Host**: `resend._domainkey` (Resend will show you the exact subdomain)
- **Value/Content**: Copy the DKIM key from Resend (very long string starting with `p=`)
- **TTL**: 3600

**Example Values:**
```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ... (very long key)
TTL: 3600
```

**⚠️ Important Notes:**
- The DKIM value is usually **very long** (200+ characters)
- Copy the **entire** value exactly as shown in Resend
- Do **not** add quotes unless your registrar requires them
- Some registrars may split long values into multiple text boxes - that's okay

**How to Add:**
1. Click **"Add Record"** button again
2. Select type: **TXT**
3. Enter name: **resend._domainkey** (exact value from Resend)
4. Paste the entire DKIM key from Resend dashboard
5. Set TTL to **3600**
6. Click **"Save"**

---

### Step 5: Add DMARC Record (3 minutes)

The DMARC (Domain-based Message Authentication, Reporting & Conformance) record specifies how receiving servers should handle emails that fail SPF/DKIM checks.

**Record Details:**
- **Type**: TXT
- **Name/Host**: `_dmarc`
- **Value/Content**: `v=DMARC1; p=none; rua=mailto:dmarc@supertool.id`
- **TTL**: 3600

**Example Values:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@supertool.id
TTL: 3600
```

**⚠️ What This Does:**
- `v=DMARC1` - DMARC version 1
- `p=none` - Monitor mode (don't reject failed emails, just report them)
- `rua=mailto:dmarc@supertool.id` - Send aggregate reports to this email

**How to Add:**
1. Click **"Add Record"** button again
2. Select type: **TXT**
3. Enter name: **_dmarc**
4. Paste value: `v=DMARC1; p=none; rua=mailto:dmarc@supertool.id`
5. Set TTL to **3600**
6. Click **"Save"**

---

### Step 6: Verify DNS Records (2 minutes)

After adding all 3 DNS records, verify they're saved correctly:

1. **In Your Registrar Panel:**
   - Refresh the DNS records page
   - Confirm you see all 3 new TXT records:
     - `@` with SPF value
     - `resend._domainkey` with DKIM value
     - `_dmarc` with DMARC value

2. **In Resend Dashboard:**
   - Go back to https://resend.com/domains
   - Find your domain `supertool.id`
   - Click **"Verify"** or **"Check DNS"** button
   - Note: Verification may take 15-30 minutes initially

---

### Step 7: Wait for DNS Propagation (24-48 hours)

DNS changes take time to propagate across the internet.

**Timeline:**
- **5-15 minutes**: Changes visible in DNS lookup tools
- **1-4 hours**: Propagation to major DNS servers
- **24-48 hours**: Full global propagation

**How to Check Propagation:**

1. **Using Command Line** (instant check):
   ```bash
   # Check SPF record
   dig +short TXT supertool.id | grep spf
   
   # Check DKIM record
   dig +short TXT resend._domainkey.supertool.id
   
   # Check DMARC record
   dig +short TXT _dmarc.supertool.id
   ```

2. **Using Online Tools** (easier, visual):
   - https://www.whatsmydns.net
   - Enter: `supertool.id`, Type: `TXT`
   - Enter: `resend._domainkey.supertool.id`, Type: `TXT`
   - Enter: `_dmarc.supertool.id`, Type: `TXT`
   - Check multiple locations worldwide

3. **Using MXToolbox** (detailed analysis):
   - https://mxtoolbox.com/SuperTool.aspx
   - Check SPF: `spf:supertool.id`
   - Check DKIM: `txt:resend._domainkey.supertool.id`
   - Check DMARC: `dmarc:supertool.id`

**What to Look For:**
- ✅ **SPF**: Should show `v=spf1 include:_spf.resend.com ~all`
- ✅ **DKIM**: Should show long key starting with `p=`
- ✅ **DMARC**: Should show `v=DMARC1; p=none; rua=mailto:dmarc@supertool.id`

---

### Step 8: Verify Domain in Resend (1 minute)

Once DNS has propagated (usually 1-4 hours, max 48 hours):

1. **Go to Resend Dashboard**
   - https://resend.com/domains

2. **Find Your Domain**
   - Look for `supertool.id` in the domains list

3. **Verify Status**
   - Should show: ✅ **Verified** (green checkmark)
   - If not verified yet, click **"Verify"** button
   - Resend will check DNS records automatically

4. **Check All Records**
   - SPF: ✅ Verified
   - DKIM: ✅ Verified
   - DMARC: ✅ Verified (may show as "Recommended" - that's okay)

**If Verification Fails:**
- Wait another 1-2 hours and try again
- DNS propagation can take up to 48 hours
- Double-check DNS records in your registrar for typos
- Use the "Check Propagation" commands above

---

## 🔧 Update Production Environment Variables

After domain is verified in Resend, update your production environment:

### On Vercel (or your hosting platform):

1. **Go to Project Settings**
   - https://vercel.com/dashboard
   - Select your SuperTool project
   - Go to **"Settings"** → **"Environment Variables"**

2. **Update Environment Variable**
   - Find: `RESEND_FROM_EMAIL`
   - Current value: `onboarding@resend.dev`
   - **New value**: `noreply@supertool.id`
   - Click **"Save"**

3. **Redeploy Application**
   - Go to **"Deployments"** tab
   - Click **"Redeploy"** on the latest deployment
   - Or push a new commit to trigger automatic deployment

### Verify Configuration:

```bash
# Check current production env var (if you have Vercel CLI)
vercel env ls

# Or check in Vercel dashboard:
# Settings > Environment Variables > Production
```

---

## ✅ Testing Email Deliverability

After domain is verified and production is deployed:

### Test 1: Send Test Email via Resend API

```bash
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@supertool.id",
    "to": "your-email@example.com",
    "subject": "Test Email from SuperTool",
    "html": "<p>This is a test email to verify DNS configuration.</p>"
  }'
```

**Expected Result:**
- ✅ Email arrives in **INBOX** (not spam)
- ✅ Email shows "via supertool.id" or "from noreply@supertool.id"
- ✅ No spam warnings

### Test 2: Real Donation Flow

1. Go to: https://supertool.id/support
2. Make a small test donation ($5)
3. Check your email inbox (not spam folder)
4. Verify thank-you email arrives correctly

### Test 3: Check Email Headers

In your email client:
1. Open the received email
2. View **"Show Original"** or **"View Headers"**
3. Look for these indicators:

```
✅ SPF: PASS
✅ DKIM: PASS
✅ DMARC: PASS
✅ From: noreply@supertool.id
✅ Authenticated: via supertool.id
```

---

## 🔍 Troubleshooting

### Issue: DNS Records Not Propagating

**Symptoms:** DNS lookup shows no records after 1 hour

**Solutions:**
1. Check TTL values - lower values propagate faster (use 300 = 5 minutes during testing)
2. Clear your local DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```
3. Wait longer - some DNS servers cache aggressively (up to 48 hours)

### Issue: Resend Verification Fails

**Symptoms:** Domain shows "Not Verified" in Resend dashboard

**Common Causes:**
1. **Typo in DNS records** - Double-check spelling, spaces, quotes
2. **Wrong Name/Host field** - Some registrars want full domain (`resend._domainkey.supertool.id`) instead of subdomain (`resend._domainkey`)
3. **Multiple SPF records** - Merge into one record
4. **DKIM value truncated** - Ensure entire key is copied

**How to Fix:**
1. Compare DNS records in registrar with values in Resend dashboard character-by-character
2. Use `dig` command to verify what's actually published:
   ```bash
   dig +short TXT resend._domainkey.supertool.id
   ```
3. If value looks correct but verification fails, wait 15-30 more minutes

### Issue: Emails Still Going to Spam

**Symptoms:** Domain verified but emails land in spam folder

**Solutions:**
1. **Check SPF alignment**: Ensure SPF record includes Resend
2. **Warm up your domain**: 
   - Start with low volume (5-10 emails/day)
   - Gradually increase over 2-3 weeks
   - Avoid sudden spikes in email volume
3. **Improve email content**:
   - Don't use spammy words ("FREE", "URGENT", "CLICK HERE")
   - Include plain text version (our email service already does this)
   - Keep HTML simple
   - Add unsubscribe link
4. **Check email reputation**: https://www.senderscore.org

### Issue: DMARC Reports Not Arriving

**Symptoms:** No DMARC aggregate reports after 7 days

**This is Normal:**
- DMARC reports are sent by receiving email servers (Gmail, Outlook, etc.)
- You only get reports when someone receives your email on those platforms
- Low volume senders may never receive reports
- Not a problem for email deliverability

**If You Want Reports:**
- Use a DMARC monitoring service:
  - https://dmarc.postmarkapp.com (free)
  - https://dmarcian.com (paid)
  - https://www.valimail.com (enterprise)

---

## 📊 Expected Results & Metrics

### Before DNS Setup (Current State)
- ❌ Emails from: `onboarding@resend.dev` (shared domain)
- ❌ Delivery to: **Spam folder** (60-80% of recipients)
- ❌ Email reputation: Shared with other Resend users
- ❌ SPF/DKIM: Passes, but for `resend.dev`, not your domain

### After DNS Setup (Goal State)
- ✅ Emails from: `noreply@supertool.id` (your domain)
- ✅ Delivery to: **Inbox** (95%+ of recipients)
- ✅ Email reputation: Dedicated to your domain
- ✅ SPF/DKIM/DMARC: All pass for `supertool.id`

### Industry Benchmarks
- **Inbox placement rate**: 95%+ (with proper DNS setup)
- **Average email open rate**: 20-25% for transactional emails
- **Spam complaint rate**: <0.1% (should be near zero for donation thank-yous)

---

## 📅 Timeline Summary

| Day | Task | Duration | Status |
|-----|------|----------|--------|
| **Day 1** | Add domain to Resend | 5 min | ⏳ Pending |
| **Day 1** | Add DNS records to registrar | 15 min | ⏳ Pending |
| **Day 1** | Initial DNS propagation | 1-4 hours | ⏳ Pending |
| **Day 1-2** | Full DNS propagation | 24-48 hours | ⏳ Pending |
| **Day 2-3** | Verify domain in Resend | 1 min | ⏳ Pending |
| **Day 2-3** | Update production env vars | 5 min | ⏳ Pending |
| **Day 2-3** | Test email deliverability | 10 min | ⏳ Pending |

**Total Active Work Time**: ~40 minutes  
**Total Calendar Time**: 2-3 days (mostly waiting for DNS)

---

## 🎯 Quick Reference Commands

```bash
# Check SPF record
dig +short TXT supertool.id | grep spf

# Check DKIM record  
dig +short TXT resend._domainkey.supertool.id

# Check DMARC record
dig +short TXT _dmarc.supertool.id

# Check all DNS propagation worldwide
# Visit: https://www.whatsmydns.net

# Test email sending (after domain verified)
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from": "noreply@supertool.id", "to": "test@example.com", "subject": "Test", "html": "<p>Test</p>"}'
```

---

## 📚 Additional Resources

### Official Documentation
- **Resend Domain Setup**: https://resend.com/docs/dashboard/domains/introduction
- **SPF Record Syntax**: https://www.rfc-editor.org/rfc/rfc7208
- **DKIM Specification**: https://www.rfc-editor.org/rfc/rfc6376
- **DMARC Overview**: https://dmarc.org/overview/

### DNS Tools
- **DNS Propagation Checker**: https://www.whatsmydns.net
- **MX Toolbox**: https://mxtoolbox.com
- **Google Admin Toolbox**: https://toolbox.googleapps.com/apps/dig/
- **DNS Checker**: https://dnschecker.org

### Email Deliverability
- **Sender Score**: https://www.senderscore.org
- **Mail Tester**: https://www.mail-tester.com
- **Gmail Postmaster Tools**: https://postmaster.google.com
- **Microsoft SNDS**: https://sendersupport.olc.protection.outlook.com/snds/

---

## ✅ Success Checklist

Use this checklist to track your progress:

- [ ] Domain added to Resend dashboard
- [ ] SPF record added to DNS (Type: TXT, Name: @)
- [ ] DKIM record added to DNS (Type: TXT, Name: resend._domainkey)
- [ ] DMARC record added to DNS (Type: TXT, Name: _dmarc)
- [ ] DNS records saved in registrar panel
- [ ] Wait 1-4 hours for initial propagation
- [ ] Check DNS propagation with `dig` or online tools
- [ ] Domain verified in Resend dashboard (green checkmark)
- [ ] Production env var updated: `RESEND_FROM_EMAIL=noreply@supertool.id`
- [ ] Application redeployed to production
- [ ] Test email sent via Resend API
- [ ] Test email arrives in inbox (not spam)
- [ ] Real donation test completed successfully
- [ ] Email headers show SPF/DKIM/DMARC all passing

---

**Last Updated**: January 2, 2026  
**Status**: Ready for implementation  
**Next Action**: Add domain to Resend dashboard and begin DNS configuration
