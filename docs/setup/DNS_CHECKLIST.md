╔════════════════════════════════════════════════════════════════════════════╗
║                    DNS SETUP CHECKLIST FOR SUPERTOOL.ID                    ║
║                        Email Deliverability Setup                           ║
╚════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PHASE 1: ADD DOMAIN TO RESEND (2 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] Login to Resend: https://resend.com/login
[ ] Navigate to Domains: https://resend.com/domains
[ ] Click "Add Domain" button
[ ] Enter domain: supertool.id
[ ] Click "Add"
[ ] Keep page open (need DNS values)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 PHASE 2: ADD DNS RECORDS (5 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] Login to domain registrar (where you bought supertool.id)
[ ] Navigate to DNS settings/management
[ ] Add 3 TXT records below:

┌────────────────────────────────────────────────────────────────────────────┐
│ RECORD 1: SPF (Sender Policy Framework)                                   │
├────────────────────────────────────────────────────────────────────────────┤
│ Type:  TXT                                                                 │
│ Name:  @                                                                   │
│ Value: v=spf1 include:_spf.resend.com ~all                                │
│ TTL:   3600                                                                │
└────────────────────────────────────────────────────────────────────────────┘

[ ] Record 1 (SPF) added and saved

┌────────────────────────────────────────────────────────────────────────────┐
│ RECORD 2: DKIM (DomainKeys Identified Mail)                               │
├────────────────────────────────────────────────────────────────────────────┤
│ Type:  TXT                                                                 │
│ Name:  resend._domainkey                                                   │
│ Value: [Copy ENTIRE key from Resend dashboard - starts with p=]           │
│ TTL:   3600                                                                │
└────────────────────────────────────────────────────────────────────────────┘

[ ] Record 2 (DKIM) added and saved
[ ] Verified ENTIRE DKIM key copied (200+ characters)

┌────────────────────────────────────────────────────────────────────────────┐
│ RECORD 3: DMARC (Domain-based Message Authentication)                     │
├────────────────────────────────────────────────────────────────────────────┤
│ Type:  TXT                                                                 │
│ Name:  _dmarc                                                              │
│ Value: v=DMARC1; p=none; rua=mailto:dmarc@supertool.id                    │
│ TTL:   3600                                                                │
└────────────────────────────────────────────────────────────────────────────┘

[ ] Record 3 (DMARC) added and saved

[ ] All 3 records visible in registrar DNS panel
[ ] All records saved successfully
[ ] Note time added: _________________ (for tracking propagation)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏳ PHASE 3: WAIT FOR DNS PROPAGATION (1-48 hours, typically 1-4 hours)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Check propagation every 1-2 hours using these commands:

Terminal Commands (macOS/Linux):
┌────────────────────────────────────────────────────────────────────────────┐
│ dig +short TXT supertool.id | grep spf                                    │
│ dig +short TXT resend._domainkey.supertool.id                             │
│ dig +short TXT _dmarc.supertool.id                                        │
└────────────────────────────────────────────────────────────────────────────┘

OR use online tool: https://www.whatsmydns.net

Propagation Timeline:
[ ] +15 min: First check  - Expected: May not be visible yet
[ ] +1 hour: Second check - Expected: Visible in some locations
[ ] +2 hours: Third check - Expected: Visible in most locations
[ ] +4 hours: Final check - Expected: Fully propagated

[ ] SPF record visible worldwide
[ ] DKIM record visible worldwide (long key starting with p=)
[ ] DMARC record visible worldwide

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PHASE 4: VERIFY IN RESEND (1 minute)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] Go to Resend dashboard: https://resend.com/domains
[ ] Find domain: supertool.id
[ ] Click "Verify" button
[ ] Wait for verification (may take 1-2 minutes)

Status should show:
[ ] SPF: ✅ Verified
[ ] DKIM: ✅ Verified  
[ ] DMARC: ✅ Verified (or "Recommended" - both OK)
[ ] Overall domain status: ✅ Verified (green checkmark)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 PHASE 5: UPDATE PRODUCTION (5 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

On Vercel (or your hosting platform):

[ ] Login to hosting dashboard
[ ] Navigate to project settings
[ ] Go to Environment Variables
[ ] Find: RESEND_FROM_EMAIL
[ ] Change value:
    FROM: onboarding@resend.dev
    TO:   noreply@supertool.id
[ ] Save changes
[ ] Trigger redeployment (or push new commit)
[ ] Wait for deployment to complete (~2-3 minutes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 PHASE 6: TEST EMAIL DELIVERABILITY (5 minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1: Direct API Test
┌────────────────────────────────────────────────────────────────────────────┐
│ curl -X POST "https://api.resend.com/emails" \                            │
│   -H "Authorization: Bearer re_f7R32XF8_7bXg4YcfifUJ3XtxnPNBmaaS" \       │
│   -H "Content-Type: application/json" \                                   │
│   -d '{"from": "noreply@supertool.id",                                    │
│        "to": "YOUR-EMAIL@example.com",                                    │
│        "subject": "DNS Test",                                             │
│        "html": "<p>Testing DNS setup!</p>"}'                              │
└────────────────────────────────────────────────────────────────────────────┘

[ ] API test email sent
[ ] Email received in INBOX (not spam)
[ ] Email shows "from noreply@supertool.id"

Test 2: Real Donation Flow
[ ] Go to: https://supertool.id/support
[ ] Make $5 test donation
[ ] Payment processed successfully
[ ] Thank-you email received in INBOX
[ ] Email content looks correct
[ ] Email headers show SPF/DKIM/DMARC all PASS

Test 3: Check Email Headers
[ ] Open received email
[ ] View "Show Original" or "View Headers"
[ ] Verify authentication results:
    [ ] SPF: PASS
    [ ] DKIM: PASS
    [ ] DMARC: PASS
    [ ] From: noreply@supertool.id
    [ ] No spam warnings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FINAL VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] ✅ Domain verified in Resend (green checkmark)
[ ] ✅ All 3 DNS records propagated worldwide
[ ] ✅ Production environment updated
[ ] ✅ Test emails arrive in inbox (not spam)
[ ] ✅ Email authentication passes (SPF/DKIM/DMARC)
[ ] ✅ Donation flow working end-to-end
[ ] ✅ Database records being created correctly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 COMPLETION LOG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DNS Records Added:      ______________________ (date/time)
DNS Propagated:         ______________________ (date/time)
Domain Verified:        ______________________ (date/time)
Production Updated:     ______________________ (date/time)
Testing Completed:      ______________________ (date/time)

Total Setup Time:       ______ hours (active work + waiting)
Active Work Time:       ______ minutes

Completed By:           ______________________
Verified By:            ______________________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆘 TROUBLESHOOTING QUICK REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue: DNS not propagating after 4 hours
→ Wait up to 48 hours (rare but possible)
→ Check for typos in DNS records
→ Flush local DNS cache (see DNS_SETUP_GUIDE.md)

Issue: Resend shows "Not Verified"
→ Wait 15-30 more minutes
→ Ensure entire DKIM key copied (200+ chars)
→ Check Name field format (some registrars need full domain)

Issue: Emails still going to spam
→ Verify all 3 records show as verified in Resend
→ Check email headers for authentication results
→ Domain warming: start low volume, increase gradually

For detailed troubleshooting, see: docs/setup/DNS_SETUP_GUIDE.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 REFERENCE LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Resend Dashboard:     https://resend.com/domains
DNS Checker:          https://www.whatsmydns.net
MX Toolbox:           https://mxtoolbox.com
Full Setup Guide:     docs/setup/DNS_SETUP_GUIDE.md
Quick Start Guide:    docs/setup/DNS_QUICK_START.md
Production Checklist: docs/setup/PRODUCTION_DEPLOYMENT_CHECKLIST.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: Ready to begin
Next Action: Phase 1 - Add domain to Resend

Last Updated: January 2, 2026
