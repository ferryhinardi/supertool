# 🚀 DNS Quick Start - 10 Minute Setup Guide

This is the condensed version of the full DNS setup guide. For detailed explanations, see `DNS_SETUP_GUIDE.md`.

---

## Prerequisites

- [ ] Access to your domain registrar (where you bought `supertool.id`)
- [ ] Access to Resend dashboard (https://resend.com/login)
- [ ] Your Resend API key (already configured in `.env.local`)

---

## 3 Simple Steps

### Step 1: Add Domain to Resend (2 minutes)

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter: `supertool.id`
4. Click **"Add"**
5. **Keep this page open** - you'll need the DNS values shown

---

### Step 2: Add 3 DNS Records to Your Registrar (5 minutes)

**Find your DNS settings:**
- Cloudflare: Dashboard → Select domain → DNS tab
- Namecheap: Domain List → Manage → Advanced DNS
- GoDaddy: My Products → DNS
- Google Domains: Select domain → DNS → Manage custom records

**Add these 3 TXT records:**

#### Record 1: SPF
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

#### Record 2: DKIM
```
Type: TXT
Name: resend._domainkey
Value: [Copy entire DKIM key from Resend - very long string starting with p=]
TTL: 3600
```

#### Record 3: DMARC
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@supertool.id
TTL: 3600
```

**Save all records** in your registrar panel.

---

### Step 3: Wait & Verify (1-48 hours)

**Check propagation every few hours:**
```bash
# Check if DNS records are live
dig +short TXT supertool.id | grep spf
dig +short TXT resend._domainkey.supertool.id
dig +short TXT _dmarc.supertool.id
```

**Or use web tool:**
- Go to: https://www.whatsmydns.net
- Enter: `supertool.id`, Type: `TXT`
- Check multiple worldwide locations

**Once propagated (usually 1-4 hours):**
1. Return to Resend dashboard: https://resend.com/domains
2. Click **"Verify"** button next to `supertool.id`
3. Wait for green checkmark: ✅ **Verified**

---

## After DNS Verification

### Update Production Environment Variable

**On Vercel:**
1. Go to your project settings
2. Environment Variables → Production
3. Find: `RESEND_FROM_EMAIL`
4. Change from: `onboarding@resend.dev`
5. Change to: `noreply@supertool.id`
6. Save & redeploy

---

## Test It Works

**Method 1: Quick API Test**
```bash
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer re_f7R32XF8_7bXg4YcfifUJ3XtxnPNBmaaS" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@supertool.id",
    "to": "your-email@example.com",
    "subject": "DNS Test",
    "html": "<p>If you got this in your inbox (not spam), DNS is working!</p>"
  }'
```

**Method 2: Real Donation Test**
1. Go to https://supertool.id/support
2. Make $5 test donation
3. Check email inbox (should arrive there, not spam)

---

## Troubleshooting

### DNS not propagating after 4 hours?
- Wait up to 48 hours (rare but possible)
- Check for typos in DNS records
- Try flushing your local DNS cache:
  ```bash
  # macOS
  sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
  ```

### Resend shows "Not Verified"?
- Wait 15-30 more minutes after DNS propagation
- Double-check DKIM record - entire key must be copied
- Some registrars need full domain in Name field: `resend._domainkey.supertool.id`

### Emails still going to spam?
- Ensure all 3 records (SPF, DKIM, DMARC) show as verified in Resend
- Check email headers - all should show "PASS"
- Domain warming: Start with low volume, increase gradually over 2 weeks

---

## Success Criteria

You'll know it's working when:
- ✅ Resend dashboard shows domain with green checkmark
- ✅ Test emails arrive in **inbox** (not spam folder)
- ✅ Email headers show `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`
- ✅ Emails show "from noreply@supertool.id" instead of "via resend.dev"

---

## Timeline

- **Now**: Add domain + DNS records (7 minutes)
- **+1-4 hours**: DNS propagation completes
- **+4 hours**: Verify in Resend, update prod env vars
- **+4 hours**: Test and confirm working

**Total active work**: ~15 minutes  
**Total wait time**: 1-4 hours (up to 48 hours in rare cases)

---

## Quick Links

- **Resend Domains**: https://resend.com/domains
- **DNS Checker**: https://www.whatsmydns.net
- **Full Guide**: `./DNS_SETUP_GUIDE.md`
- **Production Checklist**: `./PRODUCTION_DEPLOYMENT_CHECKLIST.md`

---

**Status**: Ready to begin  
**Next Action**: Step 1 - Add domain to Resend
