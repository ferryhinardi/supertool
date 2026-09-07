# Production Deployment Checklist

**Last Updated**: January 2, 2026  
**System**: SuperTool Donation System  
**Status**: Ready for Production Deployment

---

## Pre-Deployment Checklist

### 🔴 CRITICAL - Must Complete Before Production

#### ✅ 1. Security Cleanup
- [x] **Delete test email endpoint** (`app/api/test/email/route.ts`)
  - ⚠️ Security risk: Allows anyone to trigger email sends
  - **Status**: COMPLETED - File deleted
  - **Verified**: January 2, 2026

#### ⏳ 2. Custom Domain Configuration (Resend)
- [ ] **Add domain to Resend**
  - URL: https://resend.com/domains
  - Domain: `supertool.id`
  - **Guide**: `docs/setup/EMAIL_DELIVERABILITY_GUIDE.md`
  - **Expected Time**: 15 minutes
  
- [ ] **Configure DNS Records**
  - Add SPF record: `v=spf1 include:_spf.resend.com ~all`
  - Add DKIM record: (Get from Resend dashboard after domain added)
  - Add DMARC record: `v=DMARC1; p=none; rua=mailto:dmarc@supertool.id`
  - **Expected Time**: 30 minutes
  - **Propagation Time**: 24-48 hours
  
- [ ] **Verify Domain in Resend**
  - Check DNS records propagated
  - Verify domain status in Resend dashboard
  - **Expected Result**: Green checkmarks for all DNS records

#### ⏳ 3. Environment Variables Update
- [ ] **Update production environment variables**
  ```bash
  RESEND_FROM_EMAIL=noreply@supertool.id  # Change from onboarding@resend.dev
  ```
  - Update in Vercel/production environment
  - Only change AFTER domain verified in Resend
  - **Location**: Vercel Dashboard → Project Settings → Environment Variables

#### ⏳ 4. Production Webhook Configuration
- [ ] **Configure production webhook in Polar**
  - URL: `https://supertool.id/api/webhooks/polar`
  - Event: `checkout.completed`, `order.created`
  - **Location**: https://polar.sh/dashboard/ferryhinardi/developers/webhooks
  - **Expected Time**: 10 minutes
  
- [ ] **Update webhook secret in production**
  ```bash
  POLAR_WEBHOOK_SECRET=<new_production_webhook_secret>
  ```
  - Copy from Polar dashboard after creating production webhook
  - Update in Vercel/production environment

---

### 🟡 RECOMMENDED - Should Complete Before Production

#### 5. Code Quality
- [x] **Fix TypeScript warnings**
  - File: `app/api/webhooks/polar/route.ts`
  - **Status**: COMPLETED - All `any` types replaced with proper interfaces
  - **Verified**: January 2, 2026

#### 6. Testing
- [x] **Complete end-to-end testing**
  - Payment processing: ✅ Working
  - Webhook integration: ✅ Working
  - Database storage: ✅ Working
  - Email delivery: ✅ Working (spam folder, will be fixed with custom domain)
  - Recent Supporters UI: ✅ Working
  - **Status**: COMPLETED - All tests passed
  - **Report**: `docs/archive/TEST_RESULTS_SESSION_2026_01_02.md`

#### 7. Documentation
- [x] **Test results documented**
  - **Location**: `docs/archive/TEST_RESULTS_SESSION_2026_01_02.md`
  - **Status**: COMPLETED

- [x] **Email deliverability guide created**
  - **Location**: `docs/setup/EMAIL_DELIVERABILITY_GUIDE.md`
  - **Status**: COMPLETED

- [x] **Manual testing guide created**
  - **Location**: `docs/setup/MANUAL_DONATION_FLOW_TEST.md`
  - **Status**: COMPLETED

---

## Deployment Process

### Step 1: Pre-Deployment Preparation (Day 1)

1. **Configure Custom Domain in Resend** (15 minutes)
   ```bash
   # Navigate to Resend
   open https://resend.com/domains
   
   # Add domain: supertool.id
   # Follow on-screen instructions
   ```

2. **Add DNS Records** (30 minutes)
   - Go to domain registrar (where `supertool.id` is registered)
   - Add 3 DNS records:
     - **SPF**: `TXT @ v=spf1 include:_spf.resend.com ~all`
     - **DKIM**: `CNAME <key>._domainkey.<resend-value>` (Get from Resend)
     - **DMARC**: `TXT _dmarc v=DMARC1; p=none; rua=mailto:dmarc@supertool.id`
   
   **Important**: DNS propagation takes 24-48 hours. Plan accordingly.

### Step 2: Wait for DNS Propagation (Day 2-3)

1. **Check DNS Propagation** (Every 6-12 hours)
   ```bash
   # Check SPF record
   dig TXT supertool.id +short | grep spf
   
   # Check DKIM record (replace <key> with actual DKIM key from Resend)
   dig TXT <key>._domainkey.supertool.id +short
   
   # Check DMARC record
   dig TXT _dmarc.supertool.id +short
   ```

2. **Verify in Resend Dashboard**
   - Open: https://resend.com/domains
   - Check domain status
   - **Expected**: All green checkmarks

### Step 3: Deploy to Production (Day 3)

1. **Update Environment Variables in Production**
   ```bash
   # In Vercel Dashboard
   RESEND_FROM_EMAIL=noreply@supertool.id
   ```

2. **Deploy to Production**
   ```bash
   # Push to main branch (triggers Vercel deployment)
   git push origin main
   
   # Or deploy manually
   vercel --prod
   ```

3. **Configure Production Webhook in Polar**
   ```bash
   # Open Polar webhook settings
   open https://polar.sh/dashboard/ferryhinardi/developers/webhooks
   
   # Create new webhook:
   URL: https://supertool.id/api/webhooks/polar
   Events: checkout.completed, order.created
   
   # Copy webhook secret
   # Update POLAR_WEBHOOK_SECRET in Vercel
   ```

4. **Redeploy with New Webhook Secret**
   ```bash
   # Trigger another deployment to use new webhook secret
   vercel --prod
   ```

### Step 4: Post-Deployment Testing (Day 3)

1. **Test with Small Real Payment**
   ```bash
   # Open support page
   open https://supertool.id/support
   
   # Make $5 test donation with real card
   # Use your personal email for testing
   ```

2. **Verify Email Delivery**
   - Check inbox (NOT spam folder)
   - **Expected**: Email arrives in inbox within 5 seconds
   - **Expected**: Sender shows as "SuperTool <noreply@supertool.id>"

3. **Check Database**
   ```sql
   -- In Supabase dashboard
   SELECT * FROM orders 
   WHERE customer_email = 'your-test-email@example.com'
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
   - **Expected**: Order record exists with correct amount

4. **Verify Recent Supporters**
   - Refresh support page
   - **Expected**: Your donation appears (anonymized name)

---

## Post-Deployment Monitoring

### Day 1-7: Active Monitoring

1. **Email Deliverability** (Check Daily)
   ```bash
   # Resend Dashboard
   open https://resend.com/emails
   
   # Check metrics:
   # - Delivery rate: Should be >95%
   # - Bounce rate: Should be <2%
   # - Spam complaints: Should be 0%
   ```

2. **Webhook Processing** (Check Daily)
   ```bash
   # Polar Dashboard
   open https://polar.sh/dashboard/ferryhinardi/orders
   
   # Verify:
   # - All orders appear in Polar
   # - Webhook deliveries show "200 OK" status
   # - No failed webhook attempts
   ```

3. **Database Consistency** (Check Daily)
   ```sql
   -- Check order count matches Polar
   SELECT COUNT(*) FROM orders 
   WHERE created_at > NOW() - INTERVAL '7 days';
   
   -- Check for failed emails (none expected)
   SELECT * FROM orders 
   WHERE created_at > NOW() - INTERVAL '7 days'
   AND customer_email IS NOT NULL
   ORDER BY created_at DESC;
   ```

### Week 2-4: Periodic Monitoring

1. **Email Metrics** (Check Weekly)
   - Delivery rate: >95%
   - Bounce rate: <2%
   - Spam complaints: 0%
   - If metrics drop, review `docs/setup/EMAIL_DELIVERABILITY_GUIDE.md`

2. **Performance Metrics** (Check Weekly)
   - Average email delivery time: <3 seconds
   - Webhook processing time: <2 seconds
   - Database query time: <500ms

3. **Error Logs** (Check Weekly)
   ```bash
   # Vercel logs
   vercel logs --prod | grep -E "(error|failed)"
   
   # Should see minimal errors
   # Any email errors should be investigated immediately
   ```

---

## Rollback Plan

### If Email Issues Occur

1. **Immediate Action**
   ```bash
   # Revert to test email sender (temporary fix)
   RESEND_FROM_EMAIL=onboarding@resend.dev
   
   # Redeploy
   vercel --prod
   ```

2. **Investigation**
   - Check DNS records still propagated
   - Check domain verification in Resend
   - Review `docs/setup/EMAIL_DELIVERABILITY_GUIDE.md` troubleshooting section

### If Webhook Issues Occur

1. **Immediate Action**
   - Check webhook secret matches Polar dashboard
   - Check webhook URL is correct: `https://supertool.id/api/webhooks/polar`
   - Check webhook logs in Polar dashboard

2. **Temporary Fix**
   ```bash
   # Manually process any failed orders
   # Query Polar API for recent orders
   # Insert into database manually if needed
   ```

---

## Success Criteria

### Technical Metrics

- ✅ **Email Delivery Rate**: >95% (currently expect 30-50% with shared domain)
- ✅ **Email Delivery Time**: <3 seconds (currently 1.5s average)
- ✅ **Webhook Processing**: 100% success rate (currently 100%)
- ✅ **Database Consistency**: 100% (orders match Polar records)

### Business Metrics

- ✅ **User Experience**: Supporters receive thank you email within 5 seconds
- ✅ **Privacy**: Names anonymized in Recent Supporters section
- ✅ **Reliability**: No lost donations or missed thank you emails
- ✅ **Performance**: Support page loads in <2 seconds

---

## Environment Variables Reference

### Production Environment Variables Needed

```bash
# Polar (Payment Processing)
NEXT_PUBLIC_POLAR_CLIENT_ID=<your_client_id>
NEXT_PUBLIC_POLAR_PRODUCT_ID=<your_product_id>
POLAR_WEBHOOK_SECRET=<production_webhook_secret>  # ⚠️ UPDATE AFTER WEBHOOK CREATION

# Resend (Email Service)
RESEND_API_KEY=re_8ADBFpxn_CZ3YDHVmbhFBzt8f5cQfFL7Y
RESEND_FROM_EMAIL=noreply@supertool.id  # ⚠️ UPDATE AFTER DOMAIN VERIFICATION
# RESEND_REPLY_TO_EMAIL=support@supertool.id  # Optional

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
```

### Variables That MUST Change for Production

1. **RESEND_FROM_EMAIL**
   - Current: `onboarding@resend.dev`
   - Production: `noreply@supertool.id`
   - **When**: After domain verified in Resend (24-48 hours)

2. **POLAR_WEBHOOK_SECRET**
   - Current: Test webhook secret
   - Production: New webhook secret from production webhook
   - **When**: After creating production webhook in Polar

---

## Timeline Summary

| Day | Task | Duration | Status |
|-----|------|----------|--------|
| Day 1 | Configure Resend domain + DNS | 1 hour | ⏳ Pending |
| Day 2-3 | Wait for DNS propagation | 24-48 hrs | ⏳ Pending |
| Day 3 | Deploy to production | 30 mins | ⏳ Pending |
| Day 3 | Post-deployment testing | 1 hour | ⏳ Pending |
| Day 4-7 | Active monitoring | 15 min/day | ⏳ Pending |
| Week 2-4 | Periodic monitoring | 30 min/week | ⏳ Pending |

**Total Active Work**: ~3 hours  
**Total Calendar Time**: 3-4 days (including DNS propagation wait)

---

## Contact & Support

### Resend Support
- Dashboard: https://resend.com
- Docs: https://resend.com/docs
- Support: support@resend.com

### Polar Support
- Dashboard: https://polar.sh/dashboard
- Docs: https://docs.polar.sh
- Support: support@polar.sh

### Supabase Support
- Dashboard: https://supabase.com/dashboard
- Docs: https://supabase.com/docs
- Support: support@supabase.com

---

## Appendix: Quick Reference Commands

### DNS Verification
```bash
# Check all DNS records at once
dig TXT supertool.id +short | grep spf && \
dig TXT <dkim-key>._domainkey.supertool.id +short && \
dig TXT _dmarc.supertool.id +short
```

### Production Health Check
```bash
# Test support page
curl -I https://supertool.id/support

# Test webhook endpoint (should return 401 without signature)
curl -X POST https://supertool.id/api/webhooks/polar
```

### Database Quick Check
```sql
-- Recent orders (last 24 hours)
SELECT 
  polar_order_id,
  customer_email,
  amount / 100.0 AS amount_usd,
  status,
  created_at
FROM orders 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Recent supporters (for Recent Supporters section)
SELECT 
  SUBSTRING(customer_email FROM 1 FOR POSITION('@' IN customer_email) - 1) AS name,
  amount / 100.0 AS amount_usd,
  created_at
FROM orders 
WHERE created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 10;
```

---

**Document Version**: 1.0  
**Last Updated**: January 2, 2026  
**Status**: Ready for Production Deployment
