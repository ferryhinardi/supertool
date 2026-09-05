# Payment Gateway Comparison - SuperTool

**Date:** December 23, 2025  
**Status:** ✅ Polar Already Integrated  
**Research Scope:** Lemon Squeezy, Polar, RevenueCat

---

## Executive Summary

After comprehensive research of three payment gateway APIs, **Polar is the recommended and already-integrated solution** for SuperTool. The project has Polar SDK (`@polar-sh/sdk@0.42.1`) installed with a checkout API endpoint already implemented.

### Quick Comparison

| Platform | Transaction Fee | MoR | Best For | Integration Status |
|----------|----------------|-----|----------|-------------------|
| **Polar** ✅ | 4% + $0.40 | Yes | Developer tools, SaaS | **Already integrated** |
| Lemon Squeezy | 5% + $0.50 | Yes | Digital products | Not needed |
| RevenueCat | 1% (after $2.5K MTR) | No | Mobile apps | Wrong use case |

---

## 1. Polar (Current Choice) ✅

### Overview
- **Website:** https://polar.sh
- **Pricing:** 4% + $0.40 per transaction
- **Type:** Merchant of Record (MoR)
- **Status:** ✅ **Already integrated in SuperTool**

### Key Features
✅ **Cheapest MoR option** (4% vs Lemon Squeezy's 5%)  
✅ **Open source** - Full transparency  
✅ **Developer-first** - Built for technical products  
✅ **13+ framework adapters** (Next.js, Laravel, Django, etc.)  
✅ **GitHub integration** - Native sponsor-to-customer flow  
✅ **Global tax compliance** - Handles VAT, sales tax, etc.  
✅ **Modern API** - Well-documented REST + TypeScript SDK  
✅ **Webhooks** - Real-time event notifications  

### Pricing Breakdown
```
Transaction Fee: 4% + $0.40
Stripe/PayPal Fee: ~2.9% + $0.30 (passed through)
Total Cost: ~6.9% + $0.70 per transaction

Example: $50 sale
- Platform fee: $2.40
- Stripe fee: $1.75
- Net revenue: $45.85 (91.7%)
```

### API Quality: ⭐⭐⭐⭐⭐ (5/5)

**Strengths:**
- TypeScript-first SDK with full type safety
- Comprehensive documentation with code examples
- RESTful design following best practices
- Webhook system for async operations
- Great error handling and validation

**Code Example (Already in Project):**
```typescript
// lib/services/polar.ts
import { Polar } from '@polar-sh/sdk'

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
})

// app/api/payment/checkout/route.ts
const checkout = await polar.checkouts.create({
  productPriceId: 'price_xxx',
  successUrl: 'https://supertool.com/success',
  customerEmail: 'user@example.com',
})
```

### Integration Complexity: ⭐⭐⭐⭐⭐ (Very Easy)

**What's Already Done:**
- ✅ SDK installed (`@polar-sh/sdk@0.42.1`)
- ✅ Checkout API route created (`app/api/payment/checkout/route.ts`)
- ✅ Polar service configured (`lib/services/polar.ts`)
- ✅ Webhook event types defined
- ✅ Supabase auth integration included

**What's Missing (Next Steps):**
- ⏳ Webhook endpoint for handling payment events
- ⏳ Database schema for storing subscriptions
- ⏳ Frontend pricing page component
- ⏳ Customer portal integration
- ⏳ Email notification system

### Pros
✅ Lowest pricing among MoR solutions  
✅ Developer-friendly API and documentation  
✅ Open source - can audit code  
✅ Native GitHub integration  
✅ Handles global tax compliance automatically  
✅ Built specifically for developer tools and SaaS  
✅ Modern tech stack (TypeScript, REST)  
✅ **Already integrated in SuperTool**  

### Cons
⚠️ Newer platform (less track record vs Lemon Squeezy)  
⚠️ Smaller user base  
⚠️ Limited UI/UX customization vs Stripe  

### Use Cases
✅ **Perfect for:**
- SaaS subscriptions
- Developer tools (like SuperTool)
- Software licenses
- Digital products
- GitHub sponsor monetization
- B2B software sales

❌ **Not ideal for:**
- Mobile app subscriptions (use RevenueCat)
- Physical goods
- High-volume e-commerce

---

## 2. Lemon Squeezy (Alternative)

### Overview
- **Website:** https://www.lemonsqueezy.com
- **Pricing:** 5% + $0.50 per transaction
- **Type:** Merchant of Record (MoR)

### Key Features
✅ Full Merchant of Record  
✅ Global tax compliance (180+ countries)  
✅ More established than Polar  
✅ Better UI/UX for customers  
✅ Built-in fraud protection  
✅ Affiliate program support  
✅ Email marketing tools  

### Pricing Breakdown
```
Transaction Fee: 5% + $0.50
Stripe Fee: ~2.9% + $0.30
Total Cost: ~7.9% + $0.80 per transaction

Example: $50 sale
- Platform fee: $3.00
- Stripe fee: $1.75
- Net revenue: $45.25 (90.5%)

Cost vs Polar: +$0.60 per $50 transaction (1.2% more)
```

### API Quality: ⭐⭐⭐⭐ (4/5)

**Strengths:**
- Well-documented REST API
- Webhook system
- Good error messages
- Multiple SDKs (official PHP, community JS)

**Weaknesses:**
- No official TypeScript SDK
- Less developer-focused than Polar
- API design less modern than Polar

**Code Example:**
```typescript
// Would need to implement custom API wrapper
const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email: 'user@example.com',
        },
        product_options: {
          redirect_url: 'https://supertool.com/success',
        },
      },
      relationships: {
        store: { data: { type: 'stores', id: 'store_xxx' } },
        variant: { data: { type: 'variants', id: 'var_xxx' } },
      },
    },
  }),
})
```

### Integration Complexity: ⭐⭐⭐ (Moderate)

**Estimated Effort:**
- SDK wrapper implementation: 4-6 hours
- Checkout flow: 3-4 hours
- Webhook handling: 2-3 hours
- Database integration: 2-3 hours
- **Total: 11-16 hours**

### Pros
✅ More established (2021 vs Polar's 2023)  
✅ Better customer-facing UI  
✅ Built-in marketing tools  
✅ Affiliate program support  
✅ More payment methods  

### Cons
❌ **20% more expensive than Polar** ($0.60 more per $50)  
❌ No official TypeScript SDK  
❌ Less developer-focused  
❌ Not open source  
❌ Would require full integration work  

### Use Cases
✅ **Perfect for:**
- Digital products (ebooks, courses)
- SaaS with strong marketing focus
- Products needing affiliate programs
- Non-technical founders

❌ **Not ideal for:**
- Developer tools (Polar better)
- Mobile apps (RevenueCat better)
- Cost-sensitive projects

---

## 3. RevenueCat (Wrong Use Case)

### Overview
- **Website:** https://www.revenuecat.com
- **Pricing:** Free up to $2,500 MTR, then 1% of revenue
- **Type:** Subscription Management Platform (NOT a payment processor)

### Key Features
✅ Best-in-class mobile subscription handling  
✅ Lowest cost at scale (1% vs 4-5%)  
✅ Cross-platform (iOS, Android, Web)  
✅ Works with Apple/Google/Stripe  
✅ Advanced analytics  

### Why It's Wrong for SuperTool

❌ **Designed for mobile apps with in-app purchases**  
❌ Requires Apple App Store or Google Play integration  
❌ Not a Merchant of Record  
❌ Not a payment processor  
❌ Overkill for web-only applications  

SuperTool is a **web-based developer toolkit** without mobile apps. RevenueCat would add unnecessary complexity without benefits.

### API Quality: ⭐⭐⭐⭐⭐ (5/5)
Excellent API, but irrelevant for SuperTool's use case.

### Integration Complexity: ⭐ (Very Complex)
Would require:
- Mobile app development (iOS/Android)
- App Store/Play Store setup
- Stripe Connect integration for web
- Complex cross-platform sync
- **Estimated: 40-60 hours** (not worth it)

### Use Cases
✅ **Perfect for:**
- Mobile apps with subscriptions
- Cross-platform subscription apps
- Apps using Apple/Google in-app purchases

❌ **Not for SuperTool:**
- Web-only application
- No mobile apps
- No in-app purchases

---

## Side-by-Side Feature Comparison

| Feature | Polar ✅ | Lemon Squeezy | RevenueCat |
|---------|---------|---------------|------------|
| **Pricing** |
| Transaction Fee | 4% + $0.40 | 5% + $0.50 | 1% (after $2.5K) |
| Cost on $50 sale | $2.40 | $3.00 | $0.50 |
| Net revenue (excl. Stripe) | $47.60 | $47.00 | $49.50 |
| **Merchant of Record** | ✅ Yes | ✅ Yes | ❌ No |
| **Tax Compliance** | ✅ Global | ✅ Global | ⚠️ Via stores |
| **API Quality** |
| TypeScript SDK | ✅ Official | ❌ Community | ✅ Official |
| Documentation | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| REST API | ✅ Modern | ✅ Good | ✅ Excellent |
| Webhooks | ✅ Yes | ✅ Yes | ✅ Yes |
| **Integration** |
| Next.js Adapter | ✅ Yes | ❌ No | ❌ No |
| GitHub Integration | ✅ Native | ❌ No | ❌ No |
| Setup Time | ✅ 0 min (done) | ⚠️ 11-16 hrs | ❌ 40-60 hrs |
| **Features** |
| Subscriptions | ✅ Yes | ✅ Yes | ✅ Yes |
| One-time Payments | ✅ Yes | ✅ Yes | ❌ No |
| Affiliate Program | ❌ No | ✅ Yes | ❌ No |
| Email Marketing | ❌ No | ✅ Yes | ❌ No |
| Customer Portal | ✅ Yes | ✅ Yes | ✅ Yes |
| **Target Use Case** |
| Web SaaS | ✅ Perfect | ✅ Good | ❌ Wrong |
| Developer Tools | ✅ Perfect | ⚠️ Okay | ❌ Wrong |
| Mobile Apps | ❌ No | ❌ No | ✅ Perfect |
| Digital Products | ✅ Good | ✅ Perfect | ❌ Wrong |
| **Business** |
| Founded | 2023 | 2021 | 2017 |
| Open Source | ✅ Yes | ❌ No | ❌ No |
| VC Backed | ✅ Yes | ✅ Yes | ✅ Yes |

---

## Cost Analysis (Annual Revenue Scenarios)

### Scenario 1: $1,000/month revenue
```
Polar:
- 100 × $10 transactions
- Platform fees: $44/month ($528/year)
- Net: $956/month (95.6%)

Lemon Squeezy:
- 100 × $10 transactions
- Platform fees: $55/month ($660/year)
- Net: $945/month (94.5%)

Difference: Polar saves $132/year
```

### Scenario 2: $10,000/month revenue
```
Polar:
- 400 × $25 transactions
- Platform fees: $560/month ($6,720/year)
- Net: $9,440/month (94.4%)

Lemon Squeezy:
- 400 × $25 transactions
- Platform fees: $700/month ($8,400/year)
- Net: $9,300/month (93.0%)

Difference: Polar saves $1,680/year
```

### Scenario 3: $100,000/month revenue
```
Polar:
- 2,000 × $50 transactions
- Platform fees: $4,800/month ($57,600/year)
- Net: $95,200/month (95.2%)

Lemon Squeezy:
- 2,000 × $50 transactions
- Platform fees: $6,000/month ($72,000/year)
- Net: $94,000/month (94.0%)

Difference: Polar saves $14,400/year
```

**Note:** RevenueCat would only charge 1% ($1,000/month) at $100K revenue, but requires mobile app infrastructure which SuperTool doesn't have.

---

## Integration Difficulty Score

| Platform | Setup | Development | Maintenance | Total Score |
|----------|-------|-------------|-------------|-------------|
| **Polar** | ✅ 5/5 (done) | ✅ 5/5 (easy) | ✅ 5/5 (low) | **15/15** |
| Lemon Squeezy | ⚠️ 3/5 (medium) | ⚠️ 3/5 (moderate) | ✅ 4/5 (low) | **10/15** |
| RevenueCat | ❌ 1/5 (hard) | ❌ 1/5 (complex) | ⚠️ 3/5 (medium) | **5/15** |

---

## Recommendation Matrix

### Choose **Polar** (Current Choice) if:
✅ Building developer tools or SaaS  
✅ Want lowest transaction fees  
✅ Value open source and transparency  
✅ Need GitHub integration  
✅ Want modern TypeScript API  
✅ **Already have it integrated** ← SuperTool is here!  

### Choose **Lemon Squeezy** if:
✅ Selling digital products (courses, ebooks)  
✅ Need affiliate program  
✅ Want built-in email marketing  
✅ Prefer more established platform  
✅ Don't mind 20% higher fees  

### Choose **RevenueCat** if:
✅ Building iOS/Android mobile app  
✅ Need Apple/Google in-app purchases  
✅ Want cross-platform subscription sync  
✅ Have mobile app infrastructure  
❌ **Not applicable to SuperTool**  

---

## Final Recommendation

### ✅ **Stick with Polar**

**Reasoning:**
1. **Already integrated** - Zero migration cost
2. **Lowest fees** - Saves $132-$14,400/year vs alternatives
3. **Perfect fit** - Built specifically for developer tools like SuperTool
4. **Modern API** - TypeScript-first, excellent DX
5. **Open source** - Transparency and community trust
6. **Next.js adapter** - Native framework integration

**Cost of switching to Lemon Squeezy:**
- Development time: 11-16 hours ($1,100-$1,600 at $100/hr)
- Lost revenue during migration: ~$500-$1,000
- Higher ongoing fees: +$132-$14,400/year
- **Total first-year cost: $1,732-$17,000**

**Cost of switching to RevenueCat:**
- Would require building mobile apps (not viable)
- Estimated 6-12 months development
- Not worth considering

### Next Steps

1. ✅ **Complete Polar integration** (see `PAYMENT_GATEWAY_INTEGRATION_PLAN.md`)
2. Implement webhook handling
3. Build pricing page
4. Set up customer portal
5. Add email notifications
6. Launch MVP with Polar

---

## Resources

### Polar
- Docs: https://docs.polar.sh
- Dashboard: https://polar.sh/dashboard
- API Reference: https://docs.polar.sh/api
- SDK: https://github.com/polarsource/polar/tree/main/clients/packages/sdk

### Lemon Squeezy
- Docs: https://docs.lemonsqueezy.com
- Dashboard: https://app.lemonsqueezy.com
- API Reference: https://docs.lemonsqueezy.com/api

### RevenueCat
- Docs: https://www.revenuecat.com/docs
- Dashboard: https://app.revenuecat.com
- API Reference: https://www.revenuecat.com/reference/basic

---

**Document Version:** 1.0  
**Last Updated:** December 23, 2025  
**Author:** OpenCode AI  
**Project:** SuperTool Payment Integration Research
