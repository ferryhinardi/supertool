# Donation Tiers Implementation

## Overview

Added donation tiers with preset amounts to make it easier for users to support SuperTool.

## Files Created

### 1. `lib/data/donation-tiers.ts`
Donation configuration with preset amounts:

- **☕ Coffee** - $5.00: Buy us a coffee to fuel development
- **🍕 Pizza** - $15.00: Treat the team to pizza (POPULAR)
- **🚀 Rocket Fuel** - $50.00: Supercharge development  
- **💎 Diamond** - $100.00: Become a platinum supporter

Utility functions:
- `formatAmount(cents)` - Format cents to USD string
- `parseAmount(usd)` - Parse USD string to cents
- `isValidAmount(cents)` - Validate amount ($1-$10,000)
- `getDonationTier(id)` - Get tier by ID
- `getDonationTierByAmount(cents)` - Get tier by amount

### 2. `app/support/page.tsx`
Full-featured donation page with:

- **Tier Selection** - Visual cards for each tier with icons
- **Custom Amount** - Input for custom donation amounts
- **Validation** - Amount validation ($1.00 - $10,000.00)
- **Checkout Integration** - Calls `/api/payment/checkout`
- **Error Handling** - User-friendly error messages
- **FAQ Section** - Common questions about donations
- **Stats Display** - 60+ tools, 100% open source, 0 ads

### 3. `app/support/layout.tsx`
SEO metadata for the support page

## Features

### Tier Selection UI
- Glassmorphic design matching SuperTool theme
- Hover effects and animations
- Popular badge on recommended tier
- Large icons for visual appeal
- Clear pricing and descriptions

### Custom Amount
- Dollar sign prefix
- Real-time validation
- Placeholder suggestion ($25.00)
- Min/max range display

### User Experience
- Mobile-responsive grid layout
- Clear selected state
- Loading indicator during checkout
- Error messages with context
- Smooth transitions

## Usage

### Visit the Page
```bash
open http://localhost:3000/support
```

Or in production:
```bash
open https://supertool.id/support
```

### Select a Tier
1. Click on a preset tier (Coffee, Pizza, Rocket, Diamond)
2. OR enter a custom amount
3. Click "Continue to Checkout"
4. Redirects to Polar checkout page

### Integration
The page calls the existing `/api/payment/checkout` endpoint:

```typescript
POST /api/payment/checkout
{
  "productId": "154cebe5-58d2-424f-bc76-c2eb114ba55f",
  "amount": 500 // Amount in cents ($5.00)
}
```

## Testing

### Test Preset Tiers
```bash
# Start dev server
pnpm dev

# Visit http://localhost:3000/support
# Click on "Pizza" tier ($15.00)
# Should create checkout for $15.00
```

### Test Custom Amount
```bash
# Visit http://localhost:3000/support
# Enter "25.00" in custom amount field
# Click "Continue to Checkout"
# Should create checkout for $25.00
```

### Test Validation
```bash
# Try entering $0.50 (should show error - minimum $1.00)
# Try entering $15000 (should show error - maximum $10,000.00)
# Try entering invalid format (should handle gracefully)
```

## Conversion Rate Optimization

### Design Choices
1. **Visual Tiers** - Icons make options memorable
2. **Popular Badge** - Anchors user to $15 option
3. **Custom Amount** - Allows any contribution
4. **Social Proof** - Stats show value (60+ tools, 0 ads)
5. **FAQ** - Addresses objections upfront
6. **Clear CTA** - Single prominent button

### Expected Impact
- **Baseline**: 0.5-1% conversion without tiers
- **With Tiers**: 1-2% conversion (2x increase)
- **Average Donation**: $12-18 (anchored by $15 tier)

## Future Improvements

### Potential Enhancements
1. **Thank You Email** - Send receipt and gratitude
2. **Recent Supporters** - Display recent donations (opt-in)
3. **Progress Goal** - "87% to monthly goal"
4. **Recurring Donations** - Monthly supporter options
5. **Supporter Benefits** - Badge, Discord role, etc.

### Analytics Tracking
Add tracking for:
- Tier selection rates
- Custom amount frequency
- Average donation amount
- Conversion funnel
- Abandonment points

## Maintenance

### Updating Tiers
Edit `lib/data/donation-tiers.ts`:

```typescript
export const DONATION_TIERS: DonationTier[] = [
  {
    id: 'coffee',
    name: 'Coffee',
    icon: '☕',
    amount: 500, // $5.00 in cents
    description: 'Buy us a coffee to fuel development',
  },
  // Add or modify tiers here
]
```

### Changing Min/Max Amounts
Update validation in `lib/data/donation-tiers.ts`:

```typescript
export function isValidAmount(cents: number): boolean {
  return cents >= 100 && cents <= 1000000 // $1 to $10,000
}
```

## Links

- **Support Page**: `/support` or `/pricing`
- **API Endpoint**: `/api/payment/checkout`
- **Polar Dashboard**: https://polar.sh/dashboard/orders
- **Webhook**: `/api/webhooks/polar`

---

**Status**: ✅ Ready for production
**Last Updated**: 2025-01-02
**Author**: OpenCode AI Agent
