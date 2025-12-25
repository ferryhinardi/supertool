# Polar Payment Integration - End-to-End Testing Guide

## 🎯 Testing Overview

This guide walks you through testing the complete payment flow from checkout to webhook delivery to database storage.

**Estimated Time**: 15 minutes  
**Prerequisites**: 
- Production deployment at https://supertool.id
- Polar dashboard access
- Supabase dashboard access

---

## 📋 Pre-Test Checklist

Verify all environment variables are set:

```bash
cd /Users/ferryhinardi/Project/supertool
vercel env ls production | grep POLAR
```

Expected output:
```
POLAR_ACCESS_TOKEN              (Sensitive)
POLAR_WEBHOOK_SECRET            (Sensitive)
POLAR_ORGANIZATION_ID           44fd13eb-dea6-4666-b2f4-9035e47e1c47
NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID    154cebe5-58d2-424f-bc76-c2eb114ba55f
```

---

## 🧪 Test 1: Checkout API (Backend Test)

### Test Case 1.1: Valid Checkout Request

```bash
curl -X POST https://supertool.id/api/payment/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "154cebe5-58d2-424f-bc76-c2eb114ba55f",
    "amount": 500
  }' \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response**:
```json
{
  "checkoutId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "url": "https://polar.sh/checkout/polar_c_XXXXXXXXXXXXXXXX"
}
Status: 200
```

**What This Tests**:
- ✅ API endpoint is accessible
- ✅ Polar SDK initialization works
- ✅ Access token is valid
- ✅ Product ID is correct
- ✅ Checkout session creation succeeds

### Test Case 1.2: Invalid Product ID

```bash
curl -X POST https://supertool.id/api/payment/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "invalid-product-id",
    "amount": 500
  }' \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response**:
```json
{
  "error": "Invalid product ID"
}
Status: 400
```

### Test Case 1.3: Invalid Amount (Below Minimum)

```bash
curl -X POST https://supertool.id/api/payment/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "154cebe5-58d2-424f-bc76-c2eb114ba55f",
    "amount": 50
  }' \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response**:
```json
{
  "error": "Amount must be between $1 and $10,000"
}
Status: 400
```

### Test Case 1.4: Invalid Amount (Above Maximum)

```bash
curl -X POST https://supertool.id/api/payment/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "154cebe5-58d2-424f-bc76-c2eb114ba55f",
    "amount": 1500000
  }' \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response**:
```json
{
  "error": "Amount must be between $1 and $10,000"
}
Status: 400
```

---

## 🧪 Test 2: Webhook API (Security Test)

### Test Case 2.1: Invalid Signature (Should Reject)

```bash
curl -X POST https://supertool.id/api/webhooks/polar \
  -H "Content-Type: application/json" \
  -H "webhook-id: test_$(date +%s)" \
  -H "webhook-timestamp: $(date +%s)" \
  -H "webhook-signature: invalid_signature" \
  -d '{"type":"checkout.created","data":{}}' \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response**:
```json
{
  "error": "Invalid signature"
}
Status: 401
```

**What This Tests**:
- ✅ Webhook endpoint is accessible
- ✅ Signature verification is working
- ✅ Unauthorized requests are rejected
- ✅ Webhook secret is configured

### Test Case 2.2: Missing Headers (Should Reject)

```bash
curl -X POST https://supertool.id/api/webhooks/polar \
  -H "Content-Type: application/json" \
  -d '{"type":"checkout.created"}' \
  -w "\nStatus: %{http_code}\n"
```

**Expected Response**:
```json
{
  "error": "Missing required webhook headers"
}
Status: 400
```

---

## 🧪 Test 3: Frontend UI Test (Browser Test)

### Step 1: Access the Payment Dialog

1. Open browser: https://supertool.id
2. Look for floating button at bottom-right corner (says "Treat Me" or coffee cup icon)
3. Click the button to open payment dialog

**Expected Result**:
- ✅ Dialog opens smoothly
- ✅ Two tabs visible: "Donation" and "International Payment"
- ✅ Default tab is "Donation"

### Step 2: Navigate to International Payment Tab

1. Click "International Payment" tab
2. Observe the UI elements

**Expected Result**:
- ✅ Amount input field visible (with $ prefix)
- ✅ Preset amount buttons: $5, $10, $20, $50
- ✅ "Continue to Payment" button at bottom
- ✅ Polar logo/branding visible

### Step 3: Enter Custom Amount

1. Click on amount input field
2. Type: `7.50`
3. Observe the input behavior

**Expected Result**:
- ✅ Input accepts decimal values
- ✅ Value is formatted with 2 decimal places
- ✅ "Continue to Payment" button remains enabled

### Step 4: Try Preset Amounts

1. Click "$5" preset button
2. Observe input field updates to "5.00"
3. Click "$20" preset button
4. Observe input field updates to "20.00"

**Expected Result**:
- ✅ Clicking preset buttons updates input immediately
- ✅ No console errors
- ✅ Button animations work smoothly

### Step 5: Test Validation

**Test 5.1: Below Minimum**
1. Enter amount: `0.50`
2. Click "Continue to Payment"

**Expected Result**:
- ✅ Error message appears: "Amount must be between $1 and $10,000"
- ✅ No redirect occurs

**Test 5.2: Above Maximum**
1. Enter amount: `15000`
2. Click "Continue to Payment"

**Expected Result**:
- ✅ Error message appears: "Amount must be between $1 and $10,000"
- ✅ No redirect occurs

**Test 5.3: Empty Amount**
1. Clear amount input field
2. Click "Continue to Payment"

**Expected Result**:
- ✅ Error message appears: "Please enter an amount"
- ✅ No redirect occurs

### Step 6: Complete Checkout Flow

1. Enter valid amount: `5`
2. Click "Continue to Payment"
3. Wait for redirect

**Expected Result**:
- ✅ Loading indicator appears briefly
- ✅ Browser redirects to: `https://polar.sh/checkout/polar_c_XXXXXXX`
- ✅ Polar checkout page loads successfully
- ✅ Product name visible: "Support SuperTool Development"
- ✅ Amount displays: "$5.00 USD"

---

## 🧪 Test 4: Complete Payment Flow (End-to-End)

### Step 1: Complete Payment on Polar

1. On Polar checkout page, fill in test card details:
   ```
   Email: test@example.com
   Card Number: 4242 4242 4242 4242
   Expiry: 12/26
   CVC: 123
   ZIP: 12345
   ```

2. Click "Pay $5.00" button

**Expected Result**:
- ✅ Payment processes successfully
- ✅ Success page appears
- ✅ Confirmation message displayed

### Step 2: Verify Webhook Delivery

1. Open Polar dashboard: https://polar.sh/dashboard/settings/webhooks
2. Navigate to webhook settings
3. Find your webhook: `https://supertool.id/api/webhooks/polar`
4. Click on recent deliveries

**Expected Webhook Events** (in order):
```
1. checkout.created    → Status: 200
2. checkout.updated    → Status: 200
3. order.created       → Status: 200
```

**Webhook Payload Example** (order.created):
```json
{
  "type": "order.created",
  "data": {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "amount": 500,
    "currency": "USD",
    "user_id": "...",
    "product_id": "154cebe5-58d2-424f-bc76-c2eb114ba55f",
    "created_at": "2024-12-25T..."
  }
}
```

**What to Check**:
- ✅ All webhooks show 200 status (not 401/500)
- ✅ Response time is reasonable (<2 seconds)
- ✅ Retry attempts: 0 (successful on first try)

### Step 3: Verify Database Records

1. Open Supabase dashboard
2. Navigate to SQL Editor
3. Run this query:

```sql
-- Check recent orders
SELECT 
  id,
  polar_order_id,
  amount,
  currency,
  status,
  user_id,
  created_at
FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected Result**:
```
id                                   | polar_order_id                       | amount | currency | status    | user_id | created_at
-------------------------------------|--------------------------------------|--------|----------|-----------|---------|------------------
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | 500    | USD      | succeeded | NULL    | 2024-12-25 ...
```

**What to Verify**:
- ✅ Order record exists
- ✅ `polar_order_id` is populated (not NULL)
- ✅ `amount` is correct (500 cents = $5)
- ✅ `currency` is "USD"
- ✅ `status` is "succeeded"
- ✅ `created_at` timestamp matches payment time
- ✅ `user_id` is NULL (anonymous donation) or populated (if logged in)

### Step 4: Check Order Metadata

```sql
-- Check detailed order information
SELECT 
  id,
  polar_order_id,
  amount,
  status,
  metadata,
  created_at
FROM orders 
WHERE polar_order_id = 'PASTE_ORDER_ID_HERE';
```

**Expected `metadata` JSON**:
```json
{
  "product_name": "Support SuperTool Development",
  "checkout_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

## 🧪 Test 5: Edge Cases & Error Handling

### Test 5.1: Network Timeout Simulation

1. Open browser DevTools (F12)
2. Go to Network tab
3. Throttle network to "Slow 3G"
4. Try completing payment flow

**Expected Result**:
- ✅ Loading indicator shows while API call is in progress
- ✅ Request completes eventually (may take 10-30 seconds)
- ✅ No JavaScript errors in console

### Test 5.2: Duplicate Payment Prevention

1. Complete a successful payment
2. Go back to SuperTool site
3. Try paying again with same amount immediately

**Expected Result**:
- ✅ New checkout session is created (Polar allows this)
- ✅ Each payment creates separate order record
- ✅ No duplicate order ID conflicts

### Test 5.3: Browser Refresh During Payment

1. Start payment flow
2. On Polar checkout page, refresh browser (F5)
3. Complete payment again

**Expected Result**:
- ✅ Checkout session remains valid
- ✅ Payment can be completed
- ✅ Only one order is recorded

### Test 5.4: Abandoned Checkout

1. Create checkout session
2. Close browser tab without completing payment
3. Check webhook logs after 10 minutes

**Expected Webhooks**:
- ✅ `checkout.created` → Status: 200
- ❌ No `order.created` event (payment not completed)

**Database Check**:
```sql
SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '1 hour';
```
- ✅ No order record created (only webhooks create orders)

---

## 🧪 Test 6: Analytics Tracking

### Verify Analytics Events

1. Open browser DevTools → Console
2. Complete payment flow
3. Look for console logs (if in development mode)

**Expected Analytics Events** (tracked via `trackToolEvent`):
```javascript
// When opening payment dialog
trackToolEvent('payment_dialog_opened', 'international')

// When clicking preset amount
trackToolEvent('preset_amount_selected', 'international', { amount: 5 })

// When clicking continue
trackToolEvent('checkout_initiated', 'international', { amount: 5 })

// When checkout URL is generated
trackToolEvent('checkout_url_generated', 'international', { checkoutId: 'xxx' })
```

**What NOT to Track** (verify these DON'T appear):
- ❌ User email addresses
- ❌ Card numbers or payment details
- ❌ Polar order IDs
- ❌ Personal identifiable information (PII)

---

## 🧪 Test 7: Mobile Responsiveness

### Test on Mobile Devices

**Devices to Test**:
- iPhone (iOS Safari)
- Android (Chrome)
- Tablet (iPad)

### Test Cases:

**7.1: Payment Dialog on Mobile**
1. Open https://supertool.id on mobile
2. Tap "Treat Me" button
3. Observe dialog behavior

**Expected Result**:
- ✅ Dialog opens in full-screen mode on mobile
- ✅ Close button is easily tappable (min 44px touch target)
- ✅ Input fields are large enough to tap
- ✅ Keyboard appears when tapping amount field
- ✅ Preset buttons are properly sized and spaced

**7.2: Keyboard Behavior**
1. Tap amount input field
2. Observe keyboard type

**Expected Result**:
- ✅ Numeric keyboard appears (with decimal point)
- ✅ Input remains visible above keyboard
- ✅ Can scroll if needed

**7.3: Orientation Changes**
1. Start payment flow in portrait mode
2. Rotate device to landscape
3. Continue payment

**Expected Result**:
- ✅ Dialog adapts to landscape orientation
- ✅ All elements remain accessible
- ✅ No layout breaking or overlapping

---

## 📊 Test Results Template

Use this template to document your test results:

```markdown
## Test Session: [Date/Time]

### Environment
- **Browser**: [Chrome 120 / Safari 17 / Firefox 121]
- **Device**: [Desktop / iPhone 14 / Samsung Galaxy S23]
- **Network**: [Wi-Fi / 4G / Slow 3G]

### Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| Checkout API - Valid Request | ✅ PASS | Response time: 450ms |
| Checkout API - Invalid Product | ✅ PASS | Proper 400 error |
| Webhook - Invalid Signature | ✅ PASS | Rejected with 401 |
| UI - Amount Input | ✅ PASS | Decimal formatting works |
| UI - Preset Buttons | ✅ PASS | Updates immediately |
| E2E - Complete Payment | ✅ PASS | Order created in DB |
| E2E - Webhook Delivery | ✅ PASS | All 200 status |
| Database - Order Record | ✅ PASS | Correct amount & status |
| Mobile - Dialog UI | ✅ PASS | Responsive on iPhone |
| Analytics - Event Tracking | ✅ PASS | No PII logged |

### Issues Found
- None

### Recommendations
- Consider adding loading skeleton for amount input
- Test with international cards (non-US)
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid signature" on Valid Webhooks

**Symptoms**:
- Webhooks show 401 status in Polar dashboard
- Error message: "Invalid signature"

**Possible Causes**:
1. Webhook secret mismatch between Polar and Vercel
2. Webhook secret has trailing newline or spaces

**Solution**:
```bash
# Remove old secret
cd /Users/ferryhinardi/Project/supertool
echo "y" | vercel env rm POLAR_WEBHOOK_SECRET production

# Add new secret (ensure no trailing newline)
printf "YOUR_WEBHOOK_SECRET_HERE" | vercel env add POLAR_WEBHOOK_SECRET production

# Redeploy
vercel --prod --yes
```

### Issue 2: "Invalid product ID" Error

**Symptoms**:
- Checkout API returns 400
- Error: "Invalid product ID"

**Possible Causes**:
1. Product ID has trailing newline
2. Wrong product ID in environment variable
3. Product deleted/archived in Polar

**Solution**:
```bash
# Verify product ID
vercel env ls production | grep PRODUCT_ID

# If wrong, remove and re-add
echo "y" | vercel env rm NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID production
printf "154cebe5-58d2-424f-bc76-c2eb114ba55f" | vercel env add NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID production

# Redeploy
vercel --prod --yes
```

### Issue 3: Orders Not Created in Database

**Symptoms**:
- Payment completes successfully
- Webhook shows 200 status
- But no record in `orders` table

**Possible Causes**:
1. Supabase service role key is wrong
2. Database migration not applied
3. RLS policies blocking inserts

**Solution**:
```bash
# Check migration status
cd /Users/ferryhinardi/Project/supertool
supabase migration list

# Apply migration if missing
supabase db push

# Verify service role key
vercel env ls production | grep SUPABASE_SERVICE_ROLE_KEY
```

### Issue 4: CORS Errors in Browser

**Symptoms**:
- Network error in browser console
- "CORS policy" error message

**Solution**:
- This should NOT happen as APIs are same-origin
- If it does, check if you're testing on localhost
- Production domain (supertool.id) should work fine

### Issue 5: Checkout Redirect Not Working

**Symptoms**:
- Click "Continue to Payment"
- Nothing happens or error shows

**Debugging**:
```javascript
// Open browser console and check for errors
// Look for network requests to /api/payment/checkout
// Check response status and body
```

**Possible Solutions**:
1. Check if amount is valid (1-10000)
2. Verify product ID is not empty
3. Check network tab for actual error response

---

## ✅ Success Criteria

All tests pass when:

- [x] Checkout API returns 200 with valid checkout URL
- [x] Webhook API rejects invalid signatures with 401
- [x] Payment dialog UI renders correctly on all devices
- [x] Amount validation works (min $1, max $10,000)
- [x] Preset amount buttons update input field
- [x] Complete payment flow succeeds with test card
- [x] Webhooks deliver with 200 status (no retries)
- [x] Order record created in database with correct data
- [x] No console errors during entire flow
- [x] Analytics events tracked (without PII)
- [x] Mobile experience is smooth and responsive

---

## 📚 Additional Resources

- **Polar Dashboard**: https://polar.sh/dashboard
- **Webhook Logs**: https://polar.sh/dashboard/settings/webhooks
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Test Cards**: https://docs.stripe.com/testing#cards (Polar uses Stripe)
- **API Reference**: `/docs/POLAR_API_REFERENCE.md`
- **Deployment Guide**: `/docs/POLAR_DEPLOYMENT_COMPLETE.md`

---

**Last Updated**: December 25, 2024  
**Status**: Integration Complete - Ready for Testing  
**Version**: 1.0
