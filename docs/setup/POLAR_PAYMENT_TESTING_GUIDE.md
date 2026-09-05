# Polar Payment Integration - Testing Guide

## Overview
This guide provides step-by-step instructions for testing the Polar payment integration end-to-end, including webhook validation, payment processing, and database verification.

## Prerequisites

### Required Environment Variables
```bash
# Polar Configuration
POLAR_ACCESS_TOKEN=polar_at_xxx
POLAR_ORGANIZATION_ID=org_xxx
POLAR_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID=prod_xxx

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```

### Polar Dashboard Access
1. Log in to https://polar.sh/dashboard
2. Navigate to Settings → API Keys
3. Copy your access token and organization ID
4. Go to Products and copy your donation product ID

## Test Plan

### 1. Webhook Signature Verification Test

**Purpose**: Ensure webhook endpoint validates Polar signatures correctly

**Steps**:
1. Set up local tunnel for webhook testing:
   ```bash
   # Using ngrok (recommended)
   ngrok http 3000
   
   # Or using localtunnel
   npx localtunnel --port 3000
   ```

2. Configure webhook in Polar dashboard:
   - URL: `https://your-tunnel-url.ngrok-free.app/api/webhooks/polar`
   - Events: Select all subscription and order events
   - Copy the webhook secret to `POLAR_WEBHOOK_SECRET`

3. Trigger test webhook from Polar dashboard
   - Go to Webhooks → Your Webhook → Test
   - Select event type: `order.created`
   - Send test webhook

4. **Expected Result**: 
   - Webhook received with `200 OK` status
   - Database record created in `subscriptions` or `orders` table
   - No signature verification errors in logs

5. **Test Invalid Signature**:
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/polar \
     -H "Content-Type: application/json" \
     -H "webhook-id: test-id" \
     -H "webhook-timestamp: $(date +%s)" \
     -H "webhook-signature: invalid-signature" \
     -d '{"type":"order.created","data":{}}'
   ```

6. **Expected Result**: `401 Unauthorized` with error message

---

### 2. Idempotency Test (Webhook Retries)

**Purpose**: Verify webhooks can be safely retried without creating duplicates

**Steps**:
1. Send the same webhook twice from Polar dashboard
   - Use the "Resend" button on a delivered webhook
   
2. Check database:
   ```sql
   SELECT polar_subscription_id, COUNT(*) 
   FROM subscriptions 
   GROUP BY polar_subscription_id 
   HAVING COUNT(*) > 1;
   ```

3. **Expected Result**: 
   - Query returns no rows (no duplicates)
   - Second webhook updates existing record instead of creating new one
   - Response is `200 OK` for both webhooks

---

### 3. Amount Handling Test

**Purpose**: Confirm amounts are correctly converted between dollars and cents

**Steps**:
1. Create test checkout session:
   ```bash
   curl -X POST http://localhost:3000/api/payment/checkout \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{"amount": 5}'
   ```

2. Complete payment in Polar checkout UI (use test card)

3. Check webhook payload and database:
   ```sql
   SELECT amount, polar_subscription_id 
   FROM subscriptions 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

4. **Expected Results**:
   - Checkout session created with amount: `500` cents
   - Polar charges $5.00 (not $500.00)
   - Database stores `500` in amount column
   - Frontend displays "$5.00"

5. **Test Edge Cases**:
   - $0.99 → 99 cents
   - $10.50 → 1050 cents
   - $100.00 → 10000 cents

---

### 4. End-to-End Payment Flow Test

**Purpose**: Test complete user journey from frontend to database

**Steps**:
1. Start development server:
   ```bash
   pnpm dev
   ```

2. Open browser to `http://localhost:3000`

3. Click "Treat Me" button in footer

4. Select "Pay with Credit Card" (international payment option)

5. Choose predefined amount or enter custom amount ($5-$10,000)

6. Click "Continue to Payment"

7. **Expected Frontend Behavior**:
   - Loading state shows during checkout creation
   - User redirected to Polar checkout page
   - Checkout page shows correct amount and product name

8. Complete payment with test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits

9. **Expected Backend Flow**:
   - Webhook received: `order.created`
   - Database record created in `orders` table
   - Webhook received: `subscription.created` (if recurring)
   - Database record created in `subscriptions` table

10. Verify in Supabase dashboard:
    ```sql
    SELECT * FROM orders 
    WHERE created_at > NOW() - INTERVAL '5 minutes' 
    ORDER BY created_at DESC;
    ```

---

### 5. Input Validation Test

**Purpose**: Ensure frontend and backend validate amounts correctly

**Test Cases**:

| Input | Expected Result |
|-------|----------------|
| Empty string | Error: "Please enter an amount" |
| "abc" | Error: "Please enter a valid amount" |
| "0" | Error: "Amount must be at least $1" |
| "$0.99" | Error: "Amount must be at least $1" |
| "$1" | Success - creates checkout with 100 cents |
| "$10,000" | Success - creates checkout with 1,000,000 cents |
| "$10,000.01" | Error: "Maximum amount is $10,000" |
| "-5" | Error: "Please enter a valid amount" |
| "5.999" | Success - rounded to $6.00 (600 cents) |

---

### 6. Error Handling Tests

**6.1 Missing Environment Variables**

```bash
# Remove POLAR_ACCESS_TOKEN temporarily
unset POLAR_ACCESS_TOKEN

# Try to create checkout
curl -X POST http://localhost:3000/api/payment/checkout \
  -H "Content-Type: application/json" \
  -d '{"amount": 5}'
```

**Expected**: `500 Internal Server Error` with message about missing token

**6.2 Invalid Authentication**

```bash
curl -X POST http://localhost:3000/api/payment/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d '{"amount": 5}'
```

**Expected**: `401 Unauthorized`

**6.3 Database Connection Failure**

Temporarily stop Supabase or use invalid credentials, then trigger webhook.

**Expected**: 
- Webhook returns `500` error
- Polar automatically retries webhook
- Error logged with full details

---

### 7. Security Tests

**7.1 Service Role Key Exposure Check**

```bash
# Search for service role key in client-side bundles
grep -r "SUPABASE_SERVICE_ROLE_KEY" .next/static/
```

**Expected**: No matches (service role key never exposed to client)

**7.2 Anon Key vs Service Role Separation**

- Checkout route (`/api/payment/checkout`) uses anon client ✓
- Webhook route (`/api/webhooks/polar`) uses service role client ✓

**7.3 RLS Policy Verification**

```sql
-- Verify anon users can't write to payment tables
SET ROLE anon;
INSERT INTO subscriptions (polar_subscription_id, amount) 
VALUES ('test', 100);
-- Should fail with permission denied

-- Verify service role can write
SET ROLE service_role;
INSERT INTO subscriptions (polar_subscription_id, amount) 
VALUES ('test', 100);
-- Should succeed
```

---

## Troubleshooting

### Webhook Not Receiving Events

1. **Check ngrok/tunnel is running**:
   ```bash
   curl https://your-tunnel-url.ngrok-free.app/api/webhooks/polar
   ```
   Should return `405 Method Not Allowed` (POST required)

2. **Verify webhook secret is correct**:
   - Copy from Polar dashboard
   - Base64 encode if required by SDK
   - Check env var is loaded: `console.log(process.env.POLAR_WEBHOOK_SECRET?.substring(0, 10))`

3. **Check Polar webhook logs**:
   - Go to Polar Dashboard → Webhooks → Your Webhook → Deliveries
   - View response codes and retry attempts

### Database Writes Failing

1. **Check service role key**:
   ```bash
   # Verify it starts with correct prefix
   echo $SUPABASE_SERVICE_ROLE_KEY | cut -c1-10
   ```

2. **Test database connection**:
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/polar \
     -H "Content-Type: application/json" \
     --data @test-webhook.json
   ```

3. **Check RLS policies**:
   - Service role should bypass all RLS
   - Verify in Supabase dashboard: Table Editor → Policies

### Build Failures in CI/CD

The latest commits fixed these issues:
- `SUPABASE_SERVICE_ROLE_KEY` not required during build (lazy init)
- `POLAR_ACCESS_TOKEN` not required during build (lazy init)
- Both are validated at runtime when actually used

---

## Success Criteria

All tests should pass with these results:

- ✅ Webhook signature validation works
- ✅ Invalid signatures rejected with 401
- ✅ Duplicate webhooks handled idempotently  
- ✅ Amounts correctly converted (dollars ↔ cents)
- ✅ End-to-end payment flow completes successfully
- ✅ Database records created with all required fields
- ✅ Input validation prevents invalid amounts
- ✅ Error handling graceful for all failure scenarios
- ✅ No service role key exposed to client-side
- ✅ RLS policies correctly enforced

---

## Production Deployment Checklist

Before deploying to production:

1. **Environment Variables**:
   - [ ] `POLAR_ACCESS_TOKEN` set in production env
   - [ ] `POLAR_ORGANIZATION_ID` set in production env
   - [ ] `POLAR_WEBHOOK_SECRET` set in production env
   - [ ] `NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID` set in production env
   - [ ] `SUPABASE_SERVICE_ROLE_KEY` set in production env
   - [ ] All variables verified and tested

2. **Polar Configuration**:
   - [ ] Webhook endpoint updated to production URL
   - [ ] Webhook secret regenerated for production
   - [ ] Donation product created and published
   - [ ] Payment methods enabled (Stripe, PayPal)

3. **Database**:
   - [ ] Migration applied to production Supabase
   - [ ] RLS policies reviewed and enabled
   - [ ] Indexes created for performance
   - [ ] Backup strategy in place

4. **Monitoring**:
   - [ ] Error tracking configured (Sentry, etc.)
   - [ ] Webhook delivery monitoring set up
   - [ ] Database query logging enabled
   - [ ] Alert thresholds configured

5. **Testing**:
   - [ ] All tests from this guide pass in staging
   - [ ] End-to-end payment test with real card in test mode
   - [ ] Webhook retry test in staging
   - [ ] Load testing completed

---

## Support

For issues or questions:
- **Polar Documentation**: https://polar.sh/docs
- **Supabase Documentation**: https://supabase.com/docs
- **GitHub Issues**: Create issue in repository with `payment` label
