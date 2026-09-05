# Fix: Polar Payment Setup Issue

## Problem
**Error**: "Payments are currently unavailable. SuperTool needs to complete their payment setup before you can make a purchase."

## Root Cause
Polar.sh requires **merchant account verification** before accepting real payments. Your integration is technically correct, but Polar needs you to complete onboarding steps.

---

## ✅ Solution: Complete Polar Merchant Onboarding

### Step 1: Complete Account Verification

1. **Login to Polar Dashboard**
   ```bash
   open https://polar.sh/dashboard
   ```

2. **Navigate to Settings → Organization**
   - Go to: https://polar.sh/dashboard/settings/organization
   - Or click your profile → Settings → Organization

3. **Complete Required Information**
   You must provide:
   - ✅ **Business/Individual Information**
     - Legal entity name (or your full name)
     - Business address
     - Tax ID (SSN for individuals, EIN for businesses)
   
   - ✅ **Bank Account Details** (for payouts)
     - Country
     - Currency
     - Bank account or routing numbers
     - Account holder name
   
   - ✅ **Identity Verification**
     - Government-issued ID (passport, driver's license)
     - Proof of address (utility bill, bank statement)

### Step 2: Connect Payment Processor

Polar works with Stripe Connect. You need to:

1. **Go to Payment Settings**
   ```bash
   open https://polar.sh/dashboard/settings/payments
   ```

2. **Connect Stripe Account**
   - Click "Connect Stripe" or "Setup Payment Processing"
   - Complete Stripe Connect onboarding
   - Provide business information to Stripe

3. **Verify Stripe Connection**
   - Ensure status shows "Connected" or "Active"
   - Test mode should be disabled for production

### Step 3: Verify Product Configuration

1. **Check Your Donation Product**
   ```bash
   open https://polar.sh/dashboard/products
   ```

2. **Verify Product Settings**
   - Product ID: `154cebe5-58d2-424f-bc76-c2eb114ba55f` (from your config)
   - Product should be **Published** (not draft)
   - Pricing should be configured
   - Payment processor should be connected

3. **Update Product if Needed**
   - Ensure "Allow custom amount" is enabled (for donations)
   - Set minimum amount (e.g., $1.00)
   - Set maximum amount (e.g., $10,000.00)

### Step 4: Enable Live Mode

1. **Switch from Test to Live Mode**
   ```bash
   open https://polar.sh/dashboard/settings
   ```

2. **Toggle Live Mode**
   - Look for "Test Mode" toggle
   - Switch to "Live Mode" or "Production Mode"
   - Accept terms of service if prompted

3. **Verify Webhook is Production-Ready**
   ```bash
   open https://polar.sh/dashboard/settings/webhooks
   ```
   - Webhook URL: `https://supertool.id/api/webhooks/polar`
   - Ensure webhook is enabled for production events
   - Test webhook delivery

---

## 🧪 Testing After Setup

### Test 1: Verify Merchant Status

Run this to check your organization status:

```bash
curl -X GET https://api.polar.sh/v1/organizations/44fd13eb-dea6-4666-b2f4-9035e47e1c47 \
  -H "Authorization: Bearer $POLAR_ACCESS_TOKEN"
```

Expected response should include:
```json
{
  "id": "44fd13eb-dea6-4666-b2f4-9035e47e1c47",
  "name": "SuperTool",
  "payment_processor_status": "active",
  "onboarding_completed": true
}
```

### Test 2: Create Test Checkout

```bash
curl -X POST https://supertool.id/api/payment/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "154cebe5-58d2-424f-bc76-c2eb114ba55f",
    "amount": 500,
    "customerEmail": "test@example.com"
  }'
```

Expected: Should return checkout URL without errors.

### Test 3: Complete Real Payment

1. Visit the checkout URL from Test 2
2. Enter test card details:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - Zip: Any 5 digits
3. Complete payment
4. Verify webhook received at `/api/webhooks/polar`

---

## 🔍 Verify Onboarding Status

### Method 1: Dashboard Check

1. **Go to Dashboard**
   ```bash
   open https://polar.sh/dashboard
   ```

2. **Look for Banners/Alerts**
   - If onboarding incomplete, you'll see a yellow banner
   - Banner will say "Complete your account setup" or similar
   - Click the banner to see required steps

### Method 2: API Check

```bash
# Get organization details
curl -X GET https://api.polar.sh/v1/organizations/44fd13eb-dea6-4666-b2f4-9035e47e1c47 \
  -H "Authorization: Bearer $POLAR_ACCESS_TOKEN" \
  | jq '.onboarding_completed, .payment_processor_status'
```

Expected output:
```json
true
"active"
```

If you see `false` or `"incomplete"`, onboarding is not complete.

---

## ⚠️ Important Notes

### Verification Timeline
- **Identity verification**: Usually 1-3 business days
- **Bank account verification**: 1-2 business days
- **Stripe onboarding**: Immediate to 1 day

### During Verification Period
While waiting for verification:
- You can still **test** with test mode products
- You can **create** products and pricing
- You **cannot** accept real payments
- Users will see "Payment setup incomplete" message

### Production Requirements
To accept live payments, you MUST have:
1. ✅ Verified identity
2. ✅ Connected bank account
3. ✅ Completed Stripe Connect onboarding
4. ✅ Published products (not drafts)
5. ✅ Live mode enabled (not test mode)

---

## 🆘 Troubleshooting

### Issue: "Account under review"
- **Cause**: Stripe/Polar reviewing your business
- **Solution**: Wait 1-3 business days, check email for updates

### Issue: "Bank account verification failed"
- **Cause**: Incorrect bank details
- **Solution**: Re-enter bank information, try micro-deposit verification

### Issue: "Identity verification required"
- **Cause**: Need to upload ID documents
- **Solution**: Upload passport or driver's license + proof of address

### Issue: "Payment processor not connected"
- **Cause**: Stripe Connect not completed
- **Solution**: Complete Stripe onboarding at Settings → Payments

---

## 📞 Get Help

### Polar Support
- **Email**: support@polar.sh
- **Dashboard**: https://polar.sh/dashboard/settings/support
- **Response time**: Usually within 24 hours

### Documentation
- **Polar Docs**: https://docs.polar.sh
- **Onboarding Guide**: https://docs.polar.sh/merchants/onboarding
- **Payment Setup**: https://docs.polar.sh/merchants/payments

---

## ✅ Verification Checklist

Before testing payments, ensure:

- [ ] Identity documents uploaded and verified
- [ ] Bank account connected and verified
- [ ] Stripe Connect completed
- [ ] Organization settings complete (name, address, tax ID)
- [ ] Products published (not draft)
- [ ] Live mode enabled
- [ ] Webhook endpoint configured for production
- [ ] Test payment successful
- [ ] Webhook received and processed

---

## 🎯 Quick Fix Summary

**The issue is NOT with your code.** Your integration is correct. The problem is:

1. **You need to complete Polar merchant onboarding**
2. **Go to**: https://polar.sh/dashboard/settings/organization
3. **Complete**: Business info, bank account, identity verification
4. **Connect**: Stripe payment processor
5. **Enable**: Live mode (disable test mode)
6. **Wait**: 1-3 days for verification

Once onboarding is complete, payments will work immediately.

---

**Last Updated**: 2025-01-02  
**Next Steps**: Complete merchant onboarding at https://polar.sh/dashboard
