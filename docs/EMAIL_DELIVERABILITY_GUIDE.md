# Email Deliverability Guide

## 🎯 Current Status: Working but Landing in Spam

**Issue**: Emails are successfully sent but Gmail/other providers filter them to spam folder.

**Root Cause**: Using Resend's shared domain `onboarding@resend.dev` on free tier, which:
- Has no established sender reputation with your brand
- Shares email reputation with all other Resend free tier users
- Lacks custom SPF/DKIM/DMARC authentication for your domain

**Confirmation**: ✅ Email system is working correctly - the API sends emails successfully to Resend, and they deliver. This is purely a deliverability/reputation issue.

---

## 🔧 Immediate Solution for Production

### Step 1: Configure Custom Domain (Required for Production)

**Goal**: Send emails from `noreply@supertool.id` instead of `onboarding@resend.dev`

#### 1.1 Add Domain to Resend

1. Go to: https://resend.com/domains
2. Click "Add Domain"
3. Enter: `supertool.id`
4. Follow verification steps

#### 1.2 Add DNS Records

Resend will provide these DNS records to add to your domain registrar:

```dns
# SPF Record (TXT)
Name: @
Type: TXT
Value: v=spf1 include:_spf.resend.com ~all

# DKIM Record (TXT)
Name: resend._domainkey
Type: TXT
Value: [Resend will provide this - unique per domain]

# DMARC Record (TXT)
Name: _dmarc
Type: TXT
Value: v=DMARC1; p=none; rua=mailto:dmarc@supertool.id
```

**Where to add these**:
- Go to your domain registrar (where you bought `supertool.id`)
- Find DNS settings / DNS management
- Add each record exactly as shown
- Wait 24-48 hours for DNS propagation (usually faster)

#### 1.3 Verify Domain in Resend

1. After adding DNS records, return to Resend dashboard
2. Click "Verify" next to your domain
3. Wait for verification (usually instant if DNS is propagated)
4. Status should change to "Verified" ✓

#### 1.4 Update Environment Variables

In `.env.local`:

```bash
# BEFORE (dev/testing)
RESEND_FROM_EMAIL=onboarding@resend.dev

# AFTER (production)
RESEND_FROM_EMAIL=noreply@supertool.id
RESEND_REPLY_TO_EMAIL=support@supertool.id  # Optional
```

**Important**: No code changes needed! Just update the environment variable and redeploy.

---

## 📊 Expected Results After Custom Domain Setup

### Deliverability Improvements

| Factor | Before (Free Tier) | After (Custom Domain) |
|--------|-------------------|----------------------|
| **Sender Domain** | onboarding@resend.dev | noreply@supertool.id |
| **SPF Authentication** | ❌ No (shared domain) | ✅ Yes (your domain) |
| **DKIM Signature** | ⚠️ Shared reputation | ✅ Your reputation |
| **DMARC Policy** | ❌ No | ✅ Yes |
| **Inbox Placement** | ~30-50% (spam) | ~95%+ (inbox) |
| **Trust Score** | Low (shared) | High (dedicated) |

### Timeline to Inbox Delivery

- **Immediate**: SPF/DKIM/DMARC pass authentication checks
- **Week 1-2**: Gmail/Outlook start recognizing your domain
- **Week 3-4**: Full inbox delivery as reputation builds
- **Ongoing**: Maintain good sender practices

---

## 🚀 Quick Win: Whitelist Instructions for Early Users

While building domain reputation, help users find your emails:

### Add to Email Template (Optional)

```html
<p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
  <strong>Not seeing our emails?</strong> Check your spam folder and mark this 
  email as "Not Spam" to ensure future emails reach your inbox.
</p>
```

### Support Page Notice (Optional)

Add to `app/support/page.tsx` after donation form:

```tsx
<div className={css({
  mt: '6',
  p: '4',
  bg: 'blue.50',
  border: '1px solid',
  borderColor: 'blue.200',
  borderRadius: 'lg'
})}>
  <p className={css({ fontSize: 'sm', color: 'blue.800' })}>
    📧 <strong>Check your inbox!</strong> Your receipt will arrive within 2-3 minutes.
    If you don't see it, please check your spam folder and mark as "Not Spam".
  </p>
</div>
```

---

## 🧪 Testing Email Deliverability

### Current Testing (Development)

```bash
# Test endpoint (sends to spam currently)
curl "http://localhost:3000/api/test/email?to=your-email@example.com&amount=1500"

# Expected result:
# ✅ API returns success
# ✅ Email sent to Resend
# ✅ Email delivered to recipient
# ⚠️  Email lands in spam folder
```

### After Custom Domain Setup (Production)

```bash
# Same test, but email should land in inbox
curl "https://supertool.id/api/test/email?to=your-email@example.com&amount=1500"

# Expected result:
# ✅ API returns success
# ✅ Email sent to Resend
# ✅ Email delivered to recipient
# ✅ Email lands in INBOX (not spam)
```

### Monitor Deliverability

1. **Resend Dashboard**: https://resend.com/emails
   - Track delivery rates
   - Check bounce rates
   - Monitor spam complaints

2. **Mail-Tester.com**: Send test email to their address
   - Get spam score (aim for 9-10/10)
   - See authentication results
   - Get improvement recommendations

3. **Google Postmaster Tools**: https://postmaster.google.com
   - Monitor Gmail sender reputation
   - Track spam complaint rates
   - See domain authentication status

---

## 📋 Pre-Production Deployment Checklist

### DNS Configuration ✅
- [ ] Add SPF record to domain DNS
- [ ] Add DKIM record to domain DNS
- [ ] Add DMARC record to domain DNS
- [ ] Verify domain in Resend dashboard
- [ ] Test DNS propagation: `dig TXT supertool.id`

### Environment Variables ✅
- [ ] Update `RESEND_FROM_EMAIL=noreply@supertool.id`
- [ ] Set `RESEND_REPLY_TO_EMAIL=support@supertool.id` (optional)
- [ ] Keep `RESEND_API_KEY` unchanged
- [ ] Deploy updated environment variables to Vercel

### Code Cleanup ✅
- [ ] **DELETE** `app/api/test/email/route.ts` (security risk)
- [ ] Remove test endpoint from any documentation
- [ ] Verify no test code in production build

### Testing ✅
- [ ] Send test donation via Polar test mode
- [ ] Verify webhook triggers email
- [ ] Check email lands in inbox (not spam)
- [ ] Verify email formatting on mobile
- [ ] Test with different email providers (Gmail, Outlook, Yahoo)

### Monitoring ✅
- [ ] Set up Resend webhook for bounce notifications
- [ ] Monitor delivery rates in Resend dashboard
- [ ] Track spam complaint rates
- [ ] Check Google Postmaster Tools weekly

---

## 🔍 Troubleshooting Common Issues

### Issue 1: Domain Verification Failing

**Symptoms**: Resend shows "Pending Verification" after 24 hours

**Solutions**:
1. Check DNS records are correct: `dig TXT supertool.id`
2. Wait for DNS propagation (can take 24-48 hours)
3. Remove and re-add DNS records if incorrect
4. Contact Resend support if still failing after 48 hours

### Issue 2: Emails Still Going to Spam

**Symptoms**: Custom domain configured but emails still in spam

**Solutions**:
1. **Check authentication**: Use mail-tester.com to verify SPF/DKIM/DMARC pass
2. **Build reputation**: Send consistently to engaged users (takes 2-4 weeks)
3. **Warm up domain**: Start with low volume, gradually increase
4. **Avoid spam triggers**: 
   - Don't use ALL CAPS in subject
   - Avoid spam words like "FREE", "URGENT", "ACT NOW"
   - Include plain text version (we already do this)
   - Have clear unsubscribe option (not needed for receipts)

### Issue 3: High Bounce Rate

**Symptoms**: Many emails bouncing back

**Solutions**:
1. **Validate emails**: Use email validation before sending
2. **Remove invalid emails**: Clean up email list regularly
3. **Check typos**: Common mistake is email field has typo
4. **Verify webhook**: Make sure Polar sends correct email to webhook

### Issue 4: Gmail "This message seems dangerous"

**Symptoms**: Gmail shows warning banner

**Solutions**:
1. **Authentication missing**: Verify SPF/DKIM/DMARC are set up
2. **Suspicious content**: Remove any shortened URLs or suspicious-looking links
3. **New domain**: Gmail is cautious with new senders (resolves over time)
4. **Report false positive**: Use Gmail's "Report not spam" feedback

---

## 💡 Best Practices for Email Deliverability

### Content Guidelines

✅ **Do This**:
- Use clear, descriptive subject lines
- Include plain text version (we already do)
- Keep HTML simple and clean
- Use recognizable "From" name ("SuperTool")
- Include clear sender information in footer
- Send from consistent domain/email address

❌ **Avoid This**:
- ALL CAPS in subject or body
- Excessive exclamation marks!!!
- Misleading subject lines
- Too many images (text-to-image ratio)
- Shortened URLs (bit.ly, tinyurl, etc.)
- Spam trigger words

### Technical Guidelines

✅ **Do This**:
- Authenticate with SPF, DKIM, DMARC
- Use proper HTML email structure
- Include both HTML and plain text versions
- Set appropriate email headers
- Monitor bounce and complaint rates
- Keep email size under 102KB

❌ **Avoid This**:
- Shared/free domains for production
- Missing or incorrect DNS records
- Sending from different domains randomly
- Ignoring bounce/complaint feedback
- Large attachments (we don't use these)

### Volume Guidelines

| Phase | Daily Volume | Notes |
|-------|-------------|-------|
| **Week 1** | 10-50 emails | Initial warm-up |
| **Week 2** | 50-200 emails | Gradual increase |
| **Week 3** | 200-500 emails | Building reputation |
| **Week 4+** | 500+ emails | Full volume |

**For SuperTool**: Donation emails are transactional (not marketing), so warm-up is less critical. But still start gradually.

---

## 📈 Measuring Success

### Key Metrics to Track

1. **Delivery Rate**: % of emails accepted by recipient server
   - **Target**: > 99%
   - **Check**: Resend dashboard

2. **Inbox Placement Rate**: % of emails landing in inbox vs spam
   - **Target**: > 95%
   - **Check**: Mail-tester.com, seed lists

3. **Bounce Rate**: % of emails bouncing back
   - **Target**: < 2%
   - **Check**: Resend dashboard

4. **Spam Complaint Rate**: % of recipients marking as spam
   - **Target**: < 0.1%
   - **Check**: Resend dashboard, Google Postmaster

5. **Open Rate**: % of emails opened (for marketing only)
   - **Not applicable**: Donation receipts (transactional)

---

## 🎓 Additional Resources

### Official Documentation
- **Resend Domain Setup**: https://resend.com/docs/dashboard/domains/introduction
- **SPF Records**: https://www.dmarcian.com/what-is-spf/
- **DKIM Explained**: https://www.dmarcian.com/what-is-dkim/
- **DMARC Policy**: https://www.dmarcian.com/what-is-dmarc/

### Testing Tools
- **Mail Tester**: https://www.mail-tester.com (spam score)
- **MX Toolbox**: https://mxtoolbox.com (DNS checker)
- **Google Postmaster**: https://postmaster.google.com (Gmail reputation)

### Troubleshooting
- **Resend Support**: support@resend.com
- **Resend Discord**: https://resend.com/discord
- **Resend Status**: https://status.resend.com

---

## 📝 Summary

### Current State (Development)
✅ Email system fully functional  
✅ Sends via Resend successfully  
✅ Beautiful HTML template  
⚠️ Lands in spam (expected on free tier)

### Production Ready Checklist
1. ✅ Configure custom domain in Resend
2. ✅ Add DNS records (SPF, DKIM, DMARC)
3. ✅ Update environment variables
4. ✅ Delete test endpoint
5. ✅ Test with real donation
6. ✅ Monitor deliverability

**Timeline**: 1-2 hours setup, 24-48 hours DNS propagation, 2-4 weeks reputation building

**Expected Result**: 95%+ inbox delivery rate for donation receipt emails
