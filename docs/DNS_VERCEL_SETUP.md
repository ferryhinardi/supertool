# 🚀 Vercel DNS Setup Guide for SuperTool

Complete guide for configuring DNS records using Vercel DNS and Vercel CLI.

---

## Prerequisites

- [x] Vercel CLI installed
- [x] Domain `supertool.id` added to Vercel project
- [ ] Access to Resend dashboard (https://resend.com/login)
- [ ] Resend API key (already in `.env.local`)

---

## Step 1: Check Domain DNS Configuration (2 minutes)

First, verify if your domain is using Vercel DNS nameservers:

```bash
# Check current domain DNS settings
vercel domains inspect supertool.id

# List all domains in your project
vercel domains ls
```

**Expected Output:**
```
Domain: supertool.id
Nameservers: ns1.vercel-dns.com, ns2.vercel-dns.com
Status: Active
```

If nameservers are **NOT** pointing to Vercel DNS, you need to update them at your registrar:
- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

---

## Step 2: Add Domain to Resend (5 minutes)

1. **Login to Resend Dashboard**
   - Go to: https://resend.com/login

2. **Add Domain**
   - Navigate to: https://resend.com/domains
   - Click **"Add Domain"**
   - Enter: `supertool.id`
   - Click **"Add"**

3. **Copy DNS Values**
   - Resend will display 3 DNS records
   - **Keep this page open** - you'll need these values

The records will look like:
- **SPF**: `v=spf1 include:_spf.resend.com ~all`
- **DKIM**: `p=MIGfMA0GCSqGSIb3DQEBAQUAA...` (very long key)
- **DMARC**: `v=DMARC1; p=none; rua=mailto:dmarc@supertool.id`

---

## Step 3: Add DNS Records via Vercel CLI (5 minutes)

### Method 1: Using Vercel CLI (Recommended)

#### Add SPF Record
```bash
vercel dns add supertool.id @ TXT "v=spf1 include:_spf.resend.com ~all" --scope <your-team-slug>
```

#### Add DKIM Record
```bash
# Replace DKIM_KEY_FROM_RESEND with the actual key from Resend dashboard
vercel dns add supertool.id resend._domainkey TXT "DKIM_KEY_FROM_RESEND" --scope <your-team-slug>
```

#### Add DMARC Record
```bash
vercel dns add supertool.id _dmarc TXT "v=DMARC1; p=none; rua=mailto:dmarc@supertool.id" --scope <your-team-slug>
```

**Notes:**
- Replace `<your-team-slug>` with your Vercel team slug (or omit if personal account)
- Wrap values in double quotes
- The DKIM key is very long (200+ characters) - copy the entire value

### Method 2: Using Vercel Dashboard (Alternative)

If you prefer GUI:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Domains**
4. Click on `supertool.id`
5. Scroll to **DNS Records**
6. Click **"Add Record"** for each record:

**Record 1: SPF**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**Record 2: DKIM**
```
Type: TXT
Name: resend._domainkey
Value: [Paste entire DKIM key from Resend]
```

**Record 3: DMARC**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@supertool.id
```

---

## Step 4: Verify DNS Records (2 minutes)

### List Current DNS Records
```bash
# View all DNS records for your domain
vercel dns ls supertool.id

# Should show your 3 new TXT records
```

### Check DNS Propagation
```bash
# Check SPF record
dig +short TXT supertool.id | grep spf

# Check DKIM record
dig +short TXT resend._domainkey.supertool.id

# Check DMARC record
dig +short TXT _dmarc.supertool.id
```

**Or use online tool:**
- Go to: https://www.whatsmydns.net
- Check: `supertool.id` (Type: TXT)
- Check: `resend._domainkey.supertool.id` (Type: TXT)
- Check: `_dmarc.supertool.id` (Type: TXT)

---

## Step 5: Wait for DNS Propagation (15 minutes - 4 hours)

**Timeline:**
- **Vercel DNS is FAST**: Usually propagates in 5-15 minutes
- **Global propagation**: 1-4 hours for worldwide availability
- **Maximum wait**: Up to 24 hours (rare)

**Check every 15-30 minutes:**
```bash
# Quick check script
while true; do
  echo "Checking DNS records..."
  dig +short TXT supertool.id | grep spf
  dig +short TXT resend._domainkey.supertool.id | head -c 50
  dig +short TXT _dmarc.supertool.id
  echo "---"
  sleep 900  # Wait 15 minutes
done
```

---

## Step 6: Verify Domain in Resend (1 minute)

Once DNS has propagated:

1. **Return to Resend Dashboard**
   - https://resend.com/domains

2. **Verify Domain**
   - Find `supertool.id` in the list
   - Click **"Verify"** button
   - Wait 1-2 minutes for verification

3. **Check Status**
   - Should show: ✅ **Verified** (green checkmark)
   - All 3 records should show as verified:
     - ✅ SPF: Verified
     - ✅ DKIM: Verified
     - ✅ DMARC: Verified

**If verification fails:**
- Wait another 15-30 minutes
- Click "Verify" again
- Check DNS records for typos

---

## Step 7: Update Production Environment Variable (3 minutes)

### Using Vercel CLI
```bash
# Remove old environment variable
vercel env rm RESEND_FROM_EMAIL production

# Add new environment variable
vercel env add RESEND_FROM_EMAIL production
# When prompted, enter: noreply@supertool.id

# Verify it's set correctly
vercel env ls
```

### Using Vercel Dashboard (Alternative)
1. Go to: https://vercel.com/dashboard
2. Select your SuperTool project
3. Go to **Settings** → **Environment Variables**
4. Find: `RESEND_FROM_EMAIL`
5. Edit value:
   - Old: `onboarding@resend.dev`
   - New: `noreply@supertool.id`
6. Click **"Save"**

### Trigger Redeployment
```bash
# Trigger a new production deployment
vercel --prod

# Or just redeploy current commit
vercel deploy --prod
```

---

## Step 8: Test Email Deliverability (5 minutes)

### Test 1: Direct API Test
```bash
# Replace YOUR_EMAIL with your actual email
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer re_f7R32XF8_7bXg4YcfifUJ3XtxnPNBmaaS" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@supertool.id",
    "to": "YOUR_EMAIL@example.com",
    "subject": "Vercel DNS Test - SuperTool",
    "html": "<h1>Success!</h1><p>If you received this in your inbox (not spam), your Vercel DNS setup is working correctly!</p>"
  }'
```

**Expected Result:**
- ✅ Email arrives in **INBOX** (not spam folder)
- ✅ Shows "from noreply@supertool.id"
- ✅ No spam warnings

### Test 2: Real Donation Flow
1. Go to: https://supertool.id/support
2. Make a $5 test donation
3. Check your email inbox
4. Verify thank-you email arrives correctly

### Test 3: Check Email Authentication
1. Open the received test email
2. Click **"Show Original"** or **"View Headers"**
3. Look for authentication results:

```
✅ SPF: PASS
✅ DKIM: PASS
✅ DMARC: PASS
✅ From: noreply@supertool.id
```

---

## Vercel DNS Management Commands

### Useful Vercel DNS Commands
```bash
# List all DNS records for domain
vercel dns ls supertool.id

# Add a new DNS record
vercel dns add <domain> <name> <type> <value>

# Remove a DNS record by ID
vercel dns rm <record-id>

# Get domain information
vercel domains inspect supertool.id

# List all domains
vercel domains ls

# Check domain verification status
vercel domains verify supertool.id
```

### Example: Removing and Re-adding a Record
```bash
# List records to find the ID
vercel dns ls supertool.id

# Remove a record (if you need to fix a typo)
vercel dns rm <record-id>

# Add the corrected record
vercel dns add supertool.id @ TXT "corrected-value"
```

---

## Troubleshooting

### Issue: "Domain not found" when using Vercel CLI

**Solution:**
```bash
# Make sure you're authenticated
vercel login

# Check which domains are available
vercel domains ls

# If using a team, add --scope flag
vercel dns ls supertool.id --scope <team-slug>
```

### Issue: DNS records not appearing in `vercel dns ls`

**Solution:**
- Wait 1-2 minutes after adding (Vercel DNS has internal caching)
- Refresh: `vercel dns ls supertool.id --force`
- Check Vercel dashboard to confirm records exist

### Issue: DNS propagation slower than expected

**Solution:**
- Vercel DNS is fast, but global propagation takes time
- Use multiple DNS checkers: https://www.whatsmydns.net
- Check from different networks/locations
- Wait up to 4 hours for full global propagation

### Issue: DKIM key too long for command line

**Solution:**
```bash
# Create a temporary file with the DKIM key
echo "p=YOUR_VERY_LONG_DKIM_KEY_HERE" > /tmp/dkim.txt

# Add using file
vercel dns add supertool.id resend._domainkey TXT "$(cat /tmp/dkim.txt)"

# Clean up
rm /tmp/dkim.txt
```

### Issue: Emails still going to spam after verification

**Solution:**
1. Verify all 3 records show as verified in Resend
2. Check email headers for authentication results
3. **Domain warming**: Start with low volume
   - Day 1-3: 5-10 emails/day
   - Week 1: 20-30 emails/day
   - Week 2: 50-100 emails/day
   - Week 3+: Normal volume
4. Ensure email content is not spammy

---

## Success Checklist

- [ ] Domain uses Vercel DNS nameservers
- [ ] Domain added to Resend dashboard
- [ ] SPF record added via Vercel CLI/dashboard
- [ ] DKIM record added via Vercel CLI/dashboard
- [ ] DMARC record added via Vercel CLI/dashboard
- [ ] All 3 records visible in `vercel dns ls`
- [ ] DNS propagation complete (verified with dig/online tools)
- [ ] Domain shows as ✅ Verified in Resend
- [ ] Production env var updated: `RESEND_FROM_EMAIL=noreply@supertool.id`
- [ ] Application redeployed to production
- [ ] Test email sent and received in inbox
- [ ] Donation flow tested successfully
- [ ] Email headers show SPF/DKIM/DMARC all PASS

---

## Quick Command Reference

```bash
# List DNS records
vercel dns ls supertool.id

# Add SPF
vercel dns add supertool.id @ TXT "v=spf1 include:_spf.resend.com ~all"

# Add DKIM (replace with actual key)
vercel dns add supertool.id resend._domainkey TXT "p=YOUR_DKIM_KEY"

# Add DMARC
vercel dns add supertool.id _dmarc TXT "v=DMARC1; p=none; rua=mailto:dmarc@supertool.id"

# Check propagation
dig +short TXT supertool.id
dig +short TXT resend._domainkey.supertool.id
dig +short TXT _dmarc.supertool.id

# Update env var
vercel env add RESEND_FROM_EMAIL production
vercel env ls

# Deploy
vercel --prod
```

---

## Timeline

- **Now**: Add domain to Resend (5 min)
- **Now + 5 min**: Add DNS records via Vercel CLI (5 min)
- **Now + 15-30 min**: DNS propagation (Vercel DNS is fast!)
- **Now + 30 min**: Verify in Resend + update env vars (5 min)
- **Now + 35 min**: Test email deliverability (5 min)

**Total Active Work**: ~20 minutes  
**Total Wait Time**: 15-30 minutes (Vercel DNS is much faster than typical registrars!)

---

## Additional Resources

- **Vercel DNS Docs**: https://vercel.com/docs/projects/domains/working-with-domains
- **Vercel CLI Docs**: https://vercel.com/docs/cli
- **Resend Dashboard**: https://resend.com/domains
- **DNS Checker**: https://www.whatsmydns.net
- **Full Setup Guide**: `./DNS_SETUP_GUIDE.md`

---

**Last Updated**: January 2, 2026  
**Status**: Ready for implementation  
**Next Action**: Check if domain is using Vercel DNS nameservers
