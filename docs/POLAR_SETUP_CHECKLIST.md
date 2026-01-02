# Polar Payment Setup - Quick Checklist

## ⚡ Quick Fix (5 minutes)

The error "Payments are currently unavailable" means **you need to complete Polar merchant onboarding**. Your code is correct.

---

## ✅ Checklist

### 1. Complete Merchant Onboarding
**Go to**: https://polar.sh/dashboard/settings/organization

- [ ] Business/Individual name
- [ ] Business address
- [ ] Tax ID (SSN or EIN)
- [ ] Phone number
- [ ] Upload ID (passport/driver's license)
- [ ] Upload proof of address

### 2. Connect Payment Processor
**Go to**: https://polar.sh/dashboard/settings/payments

- [ ] Click "Connect Stripe"
- [ ] Complete Stripe Connect onboarding
- [ ] Verify status shows "Connected"

### 3. Configure Bank Account
**In Stripe Connect onboarding**:

- [ ] Bank country
- [ ] Bank account number
- [ ] Routing number
- [ ] Account holder name

### 4. Verify Product
**Go to**: https://polar.sh/dashboard/products

- [ ] Product exists (ID: `154cebe5-58d2-424f-bc76-c2eb114ba55f`)
- [ ] Product is **Published** (not draft)
- [ ] Pricing is configured
- [ ] "Allow custom amount" enabled

### 5. Enable Live Mode
**Go to**: https://polar.sh/dashboard

- [ ] Switch from "Test Mode" to "Live Mode"
- [ ] Accept terms of service
- [ ] Verify webhook is production-ready

---

## 🧪 Test Your Setup

Run this verification script:

```bash
./scripts/check-polar-setup.sh
```

Or manually test:

```bash
# 1. Check environment variables
source .env.local
echo "POLAR_ACCESS_TOKEN: ${POLAR_ACCESS_TOKEN:0:10}..."
echo "POLAR_ORGANIZATION_ID: $POLAR_ORGANIZATION_ID"

# 2. Test API connection
curl -X GET \
  "https://api.polar.sh/v1/organizations/$POLAR_ORGANIZATION_ID" \
  -H "Authorization: Bearer $POLAR_ACCESS_TOKEN" \
  | jq '.name, .onboarding_completed, .payment_processor_status'

# 3. Test checkout creation
curl -X POST http://localhost:3000/api/payment/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "154cebe5-58d2-424f-bc76-c2eb114ba55f",
    "amount": 500
  }'
```

---

## ⏱️ Timeline

| Step | Time |
|------|------|
| Complete onboarding form | 10 minutes |
| Identity verification | 1-3 business days |
| Stripe Connect setup | 5 minutes |
| Bank account verification | 1-2 business days |
| **Total** | **2-5 business days** |

---

## 🚨 Common Issues

### "Account under review"
**Wait 1-3 days**. Check email for updates from Polar/Stripe.

### "Bank verification failed"
**Re-enter bank details**. Try micro-deposit verification.

### "Identity verification required"
**Upload clear photos** of ID and proof of address (utility bill < 3 months old).

### "Payment processor disconnected"
**Reconnect Stripe** at Settings → Payments.

---

## 📞 Get Help

- **Polar Support**: support@polar.sh
- **Dashboard**: https://polar.sh/dashboard/settings/support
- **Docs**: https://docs.polar.sh/merchants/onboarding

---

## 🎯 TL;DR

1. **Go to**: https://polar.sh/dashboard/settings/organization
2. **Complete**: Business info + ID verification
3. **Connect**: Stripe (Settings → Payments)
4. **Wait**: 1-3 days for approval
5. **Test**: Run `./scripts/check-polar-setup.sh`

**Your integration is already correct. You just need to complete onboarding.**

---

**Last Updated**: 2025-01-02  
**For details**: See `docs/POLAR_PAYMENT_SETUP_FIX.md`
