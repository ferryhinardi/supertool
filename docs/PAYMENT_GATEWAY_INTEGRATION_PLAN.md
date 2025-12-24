# Payment Gateway Integration Plan - Polar

**Project:** SuperTool  
**Platform:** Polar (https://polar.sh)  
**Status:** 🟡 Partially Integrated (40% Complete)  
**Target:** Full Subscription & Payment System  
**Timeline:** 2-3 weeks

---

## Current Status Overview

### ✅ What's Already Done (40%)

1. **SDK Installation**
   - ✅ `@polar-sh/sdk@0.42.1` installed
   - ✅ Located in `package.json:38`

2. **Core Configuration**
   - ✅ Polar service module created (`lib/services/polar.ts`)
   - ✅ Environment variables defined
   - ✅ Webhook event types enumerated

3. **Checkout API Endpoint**
   - ✅ `/api/payment/checkout` route created
   - ✅ Supabase auth integration included
   - ✅ User metadata tracking implemented

### ⏳ What Needs to Be Done (60%)

1. **Webhook Handling** (15%)
2. **Database Schema** (10%)
3. **Frontend Components** (20%)
4. **Customer Portal** (5%)
5. **Email Notifications** (5%)
6. **Testing & Documentation** (5%)

---

## Phase 1: Backend Infrastructure (Week 1)

### Task 1.1: Create Webhook Endpoint ⏳

**Priority:** 🔴 Critical  
**Estimated Time:** 4 hours  
**Dependencies:** None

**Implementation:**

```typescript
// app/api/webhooks/polar/route.ts
import { type NextRequest, NextResponse } from 'next/server'
import { validatePolarWebhook } from '@polar-sh/sdk'
import { POLAR_CONFIG, POLAR_WEBHOOK_EVENTS } from '@/lib/services/polar'
import { supabase } from '@/lib/auth/supabaseClient'

export const runtime = 'nodejs'

interface PolarWebhookPayload {
  type: string
  data: {
    id: string
    attributes: {
      status: string
      customer_email: string
      user_id?: string
      // ... more fields
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Get raw body and signature
    const body = await request.text()
    const signature = request.headers.get('polar-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // 2. Verify webhook signature
    const isValid = validatePolarWebhook(
      body,
      signature,
      POLAR_CONFIG.webhookSecret
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 3. Parse payload
    const payload: PolarWebhookPayload = JSON.parse(body)
    const { type, data } = payload

    // 4. Handle different webhook events
    switch (type) {
      case POLAR_WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(data)
        break

      case POLAR_WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(data)
        break

      case POLAR_WEBHOOK_EVENTS.SUBSCRIPTION_CANCELED:
        await handleSubscriptionCanceled(data)
        break

      case POLAR_WEBHOOK_EVENTS.ORDER_CREATED:
        await handleOrderCreated(data)
        break

      default:
        console.log(`Unhandled webhook type: ${type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Webhook handlers
async function handleSubscriptionCreated(data: any) {
  const { error } = await supabase.from('subscriptions').insert({
    polar_subscription_id: data.id,
    user_id: data.attributes.metadata?.userId,
    customer_email: data.attributes.customer_email,
    status: data.attributes.status,
    plan_id: data.attributes.product_id,
    current_period_start: data.attributes.current_period_start,
    current_period_end: data.attributes.current_period_end,
    created_at: new Date().toISOString(),
  })

  if (error) throw error
}

async function handleSubscriptionUpdated(data: any) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: data.attributes.status,
      current_period_start: data.attributes.current_period_start,
      current_period_end: data.attributes.current_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('polar_subscription_id', data.id)

  if (error) throw error
}

async function handleSubscriptionCanceled(data: any) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('polar_subscription_id', data.id)

  if (error) throw error
}

async function handleOrderCreated(data: any) {
  const { error } = await supabase.from('orders').insert({
    polar_order_id: data.id,
    user_id: data.attributes.metadata?.userId,
    customer_email: data.attributes.customer_email,
    amount: data.attributes.amount,
    currency: data.attributes.currency,
    status: data.attributes.status,
    product_id: data.attributes.product_id,
    created_at: new Date().toISOString(),
  })

  if (error) throw error
}
```

**Steps:**
1. Create `app/api/webhooks/polar/route.ts`
2. Implement webhook signature validation
3. Add event handlers for each webhook type
4. Test with Polar dashboard webhook tester

**Testing:**
```bash
# Test webhook locally with Polar CLI (if available) or use ngrok
ngrok http 3000
# Add webhook URL in Polar dashboard: https://xxx.ngrok.io/api/webhooks/polar
```

---

### Task 1.2: Database Schema Setup ⏳

**Priority:** 🔴 Critical  
**Estimated Time:** 3 hours  
**Dependencies:** None

**Supabase Migration:**

```sql
-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  polar_subscription_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
  plan_id TEXT NOT NULL,
  plan_name TEXT,
  amount INTEGER, -- in cents
  currency TEXT DEFAULT 'USD',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table (one-time payments)
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  polar_order_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),
  product_id TEXT NOT NULL,
  product_name TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_records table (for usage-based billing)
CREATE TABLE usage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric TEXT NOT NULL, -- e.g., 'api_calls', 'storage_gb'
  quantity INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_polar_id ON subscriptions(polar_subscription_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_polar_id ON orders(polar_order_id);
CREATE INDEX idx_usage_records_subscription_id ON usage_records(subscription_id);
CREATE INDEX idx_usage_records_user_id ON usage_records(user_id);

-- Add RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own usage records
CREATE POLICY "Users can view own usage records"
  ON usage_records FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert/update (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage orders"
  ON orders FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
```

**Steps:**
1. Create migration file in `supabase/migrations/`
2. Run migration: `supabase migration up`
3. Verify tables in Supabase dashboard
4. Create TypeScript types

**TypeScript Types:**

```typescript
// types/subscriptions.ts
export interface Subscription {
  id: string
  user_id: string
  polar_subscription_id: string
  customer_email: string
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
  plan_id: string
  plan_name?: string
  amount?: number
  currency: string
  current_period_start?: string
  current_period_end?: string
  cancel_at_period_end: boolean
  canceled_at?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id?: string
  polar_order_id: string
  customer_email: string
  amount: number
  currency: string
  status: 'succeeded' | 'failed' | 'pending' | 'refunded'
  product_id: string
  product_name?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface UsageRecord {
  id: string
  subscription_id: string
  user_id: string
  metric: string
  quantity: number
  timestamp: string
  period_start: string
  period_end: string
}
```

---

### Task 1.3: Subscription Management API ⏳

**Priority:** 🟡 Medium  
**Estimated Time:** 3 hours  
**Dependencies:** Task 1.2 (Database)

**Implementation:**

```typescript
// app/api/subscription/status/route.ts
import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/auth/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's active subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({
      hasActiveSubscription: !!subscription,
      subscription: subscription || null,
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}

// app/api/subscription/cancel/route.ts
import { type NextRequest, NextResponse } from 'next/server'
import { polar } from '@/lib/services/polar'
import { supabase } from '@/lib/auth/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('polar_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Cancel subscription in Polar
    await polar.subscriptions.cancel(subscription.polar_subscription_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Subscription cancel error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
```

**Steps:**
1. Create subscription status endpoint
2. Create cancel endpoint
3. Create reactivate endpoint (if applicable)
4. Add customer portal redirect endpoint

---

## Phase 2: Frontend Components (Week 2)

### Task 2.1: Integrate Polar Payment into "Treat Me" Popup ⏳

**Priority:** 🔴 Critical  
**Estimated Time:** 4 hours  
**Dependencies:** Task 1.1, 1.2

**Current State:**
The project already has a "Treat Me" popup (`components/features/shared/TreatMeDialog.tsx`) that shows:
- ✅ QRIS payment (working with static QR image)
- ⏳ International Payment (marked as "Coming Soon")
- ⏳ Cryptocurrency (marked as "Coming Soon")

**Goal:**
Replace "International Payment" option with Polar checkout integration for one-time donations.

**Implementation:**

```typescript
// components/features/shared/TreatMeDialog.tsx
// Add new state and handler

type PaymentStep = 'select' | 'qris' | 'crypto' | 'international' | 'polar'

// Add donation amounts
const DONATION_AMOUNTS = [
  { value: 5, label: '$5', description: 'Buy me a coffee ☕' },
  { value: 10, label: '$10', description: 'Buy me lunch 🍱' },
  { value: 25, label: '$25', description: 'Support for a week 🎉' },
  { value: 50, label: '$50', description: 'Premium support 💎' },
]

// Add Polar checkout handler
async function handlePolarCheckout(amount: number) {
  try {
    setLoading(true)
    
    const response = await fetch('/api/payment/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productPriceId: process.env.NEXT_PUBLIC_POLAR_DONATION_PRICE_ID,
        successUrl: `${window.location.origin}/?payment=success&amount=${amount}`,
        amount: amount * 100, // Convert to cents
        metadata: {
          type: 'donation',
          amount,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout')
    }

    const data = await response.json()
    
    // Redirect to Polar checkout
    window.location.href = data.url
  } catch (error) {
    console.error('Checkout error:', error)
    toast.error('Failed to start checkout. Please try again.')
  } finally {
    setLoading(false)
  }
}

// Update International Payment button to use Polar
<button
  onClick={() => onSelectMethod('polar')}
  style={{
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: '0.75rem',
    padding: '1rem',
    textAlign: 'left',
    transition: 'all 0.3s',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    background:
      'linear-gradient(to right, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15))',
    cursor: 'pointer',
  }}
  type="button"
>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div
        style={{
          display: 'flex',
          width: '3rem',
          height: '3rem',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.5rem',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
        }}
      >
        <CreditCard
          style={{ width: '1.5rem', height: '1.5rem', color: 'rgb(96, 165, 250)' }}
        />
      </div>
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>
          Card Payment
        </div>
        <div style={{ fontSize: '0.75rem', color: 'rgb(209, 213, 219)' }}>
          Credit Card • Debit Card • PayPal
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span
        style={{
          borderRadius: '9999px',
          paddingLeft: '0.75rem',
          paddingRight: '0.75rem',
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'rgb(147, 197, 253)',
          backgroundColor: 'rgba(59, 130, 246, 0.3)',
        }}
      >
        Available
      </span>
      <ArrowLeft
        style={{
          width: '1.25rem',
          height: '1.25rem',
          transform: 'rotate(180deg)',
          color: 'rgb(96, 165, 250)',
          transition: 'transform 0.3s',
        }}
      />
    </div>
  </div>
</button>

// Add PolarPayment component
function PolarPayment({ onBack }: { onBack: () => void }) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    const amount = selectedAmount || Number.parseFloat(customAmount)
    
    if (!amount || amount < 1) {
      toast.error('Please select or enter an amount')
      return
    }

    await handlePolarCheckout(amount)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'white',
          }}
        >
          <CreditCard style={{ width: '1.5rem', height: '1.5rem', color: 'rgb(96, 165, 250)' }} />
          <h2>Card Payment</h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'white' }}>
          Secure checkout powered by Polar
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Amount Selection */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
          }}
        >
          {DONATION_AMOUNTS.map((donation) => (
            <button
              key={donation.value}
              onClick={() => {
                setSelectedAmount(donation.value)
                setCustomAmount('')
              }}
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '2px solid',
                borderColor: selectedAmount === donation.value
                  ? 'rgb(59, 130, 246)'
                  : 'rgb(55, 65, 81)',
                backgroundColor: selectedAmount === donation.value
                  ? 'rgba(59, 130, 246, 0.1)'
                  : 'rgba(31, 41, 55, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              type="button"
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
                {donation.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgb(209, 213, 219)' }}>
                {donation.description}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div>
          <label style={{ fontSize: '0.875rem', color: 'white', marginBottom: '0.5rem', display: 'block' }}>
            Or enter custom amount
          </label>
          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="$ Amount"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value)
              setSelectedAmount(null)
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '2px solid rgb(55, 65, 81)',
              backgroundColor: 'rgba(31, 41, 55, 0.5)',
              color: 'white',
              fontSize: '1rem',
            }}
          />
        </div>

        {/* Info */}
        <div
          style={{
            borderRadius: '0.5rem',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            padding: '1rem',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: 'rgb(147, 197, 253)' }}>
            ✓ Secure payment via Polar
            <br />
            ✓ Accepts all major cards
            <br />
            ✓ No recurring charges
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          onClick={handleCheckout}
          disabled={loading || (!selectedAmount && !customAmount)}
          style={{
            width: '100%',
            background: 'linear-gradient(to right, rgb(59, 130, 246), rgb(37, 99, 235))',
            color: 'white',
            fontWeight: 600,
            padding: '0.75rem',
          }}
        >
          {loading ? 'Processing...' : 'Continue to Checkout'}
        </Button>

        <Button
          variant="outline"
          onClick={onBack}
          style={{
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderColor: 'rgb(64, 64, 64)',
          }}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Back to Payment Methods
        </Button>
      </div>
    </div>
  )
}
```

**Steps:**
1. Update `TreatMeDialog.tsx` to add Polar payment option
2. Create amount selection UI
3. Integrate with `/api/payment/checkout` endpoint
4. Add success/error handling
5. Test donation flow end-to-end

**Environment Variables Needed:**
```bash
# Add to .env.local
NEXT_PUBLIC_POLAR_DONATION_PRICE_ID=price_xxx  # One-time payment price ID from Polar
```

**Setup in Polar Dashboard:**
1. Go to https://polar.sh/dashboard/products
2. Create a new product: "SuperTool Donation"
3. Set as "Pay what you want" or fixed amounts
4. Get the price ID
5. Add to environment variables

---

### Task 2.2: Pricing Page Component ⏳

**Priority:** 🟡 Medium  
**Estimated Time:** 6 hours  
**Dependencies:** Task 1.1, 1.2

**Implementation:**

```typescript
// app/pricing/page.tsx
'use client'

import { useState } from 'react'
import { css } from '@/styled-system/css'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  productPriceId: string
  popular?: boolean
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out SuperTool',
    price: 0,
    interval: 'month',
    features: [
      '5 tools per day',
      'Basic features',
      'Community support',
      'File size limit: 5MB',
    ],
    productPriceId: '', // No checkout for free
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Best for individuals and small teams',
    price: 9,
    interval: 'month',
    features: [
      'Unlimited tool usage',
      'All premium features',
      'Priority support',
      'File size limit: 100MB',
      'No ads',
      'Export to all formats',
    ],
    productPriceId: process.env.NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRICE_ID || '',
    popular: true,
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For teams that need collaboration',
    price: 29,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Shared workspaces',
      'API access',
      'Custom integrations',
      'Dedicated support',
    ],
    productPriceId: process.env.NEXT_PUBLIC_POLAR_TEAM_MONTHLY_PRICE_ID || '',
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleCheckout = async (plan: PricingPlan) => {
    if (!plan.productPriceId) {
      toast.error('This plan is not available for checkout')
      return
    }

    setLoading(plan.id)

    try {
      // Get auth token if user is logged in
      const token = localStorage.getItem('supabase.auth.token')

      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productPriceId: plan.productPriceId,
          successUrl: `${window.location.origin}/pricing?payment=success`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()

      // Redirect to Polar checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '8', sm: '12', md: '16' },
      })}
    >
      {/* Header */}
      <div className={css({ textAlign: 'center', mb: { base: '8', md: '12' } })}>
        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'bold',
            mb: '4',
          })}
        >
          Choose Your Plan
        </h1>
        <p
          className={css({
            fontSize: { base: 'lg', md: 'xl' },
            color: 'gray.600',
            maxW: '2xl',
            mx: 'auto',
          })}
        >
          Start free and upgrade as you grow. All plans include access to our core tools.
        </p>
      </div>

      {/* Pricing Cards */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', md: 'repeat(3, 1fr)' },
          gap: { base: '6', lg: '8' },
          maxW: '6xl',
          mx: 'auto',
        })}
      >
        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={css({
              position: 'relative',
              bg: 'white',
              borderRadius: 'xl',
              border: '1px solid',
              borderColor: plan.popular ? 'blue.500' : 'gray.200',
              p: { base: '6', lg: '8' },
              shadow: plan.popular ? 'xl' : 'md',
            })}
          >
            {plan.popular && (
              <div
                className={css({
                  position: 'absolute',
                  top: '-3',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bg: 'blue.500',
                  color: 'white',
                  px: '4',
                  py: '1',
                  borderRadius: 'full',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                })}
              >
                Most Popular
              </div>
            )}

            <div className={css({ mb: '6' })}>
              <h3 className={css({ fontSize: '2xl', fontWeight: 'bold', mb: '2' })}>
                {plan.name}
              </h3>
              <p className={css({ color: 'gray.600', fontSize: 'sm' })}>
                {plan.description}
              </p>
            </div>

            <div className={css({ mb: '6' })}>
              <span className={css({ fontSize: '4xl', fontWeight: 'bold' })}>
                ${plan.price}
              </span>
              <span className={css({ color: 'gray.600', ml: '2' })}>
                / {plan.interval}
              </span>
            </div>

            <ul className={css({ mb: '6', spaceY: '3' })}>
              {plan.features.map((feature) => (
                <li key={feature} className={css({ display: 'flex', gap: '2' })}>
                  <span className={css({ color: 'green.500' })}>✓</span>
                  <span className={css({ fontSize: 'sm' })}>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              disabled={loading === plan.id || !plan.productPriceId}
              onClick={() => handleCheckout(plan)}
              className={css({ w: 'full' })}
            >
              {loading === plan.id
                ? 'Loading...'
                : plan.price === 0
                  ? 'Get Started'
                  : 'Subscribe'}
            </Button>
          </div>
        ))}
      </div>
    </main>
  )
}
```

**Steps:**
1. Create pricing page component
2. Add plan configurations
3. Integrate with checkout API
4. Style with Panda CSS (mobile-first)
5. Add success/cancel redirects

---

### Task 2.2: Subscription Status Hook ⏳

**Priority:** 🟡 Medium  
**Estimated Time:** 2 hours  
**Dependencies:** Task 1.3

**Implementation:**

```typescript
// hooks/useSubscription.ts
'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Subscription } from '@/types/subscriptions'

interface SubscriptionStatus {
  hasActiveSubscription: boolean
  subscription: Subscription | null
}

export function useSubscription() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(localStorage.getItem('supabase.auth.token'))
  }, [])

  return useQuery<SubscriptionStatus>({
    queryKey: ['subscription', 'status'],
    queryFn: async () => {
      if (!token) {
        return { hasActiveSubscription: false, subscription: null }
      }

      const response = await fetch('/api/subscription/status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch subscription status')
      }

      return response.json()
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Usage in components:
// const { data, isLoading } = useSubscription()
// if (data?.hasActiveSubscription) { ... }
```

---

### Task 2.3: Paywall Component ⏳

**Priority:** 🟡 Medium  
**Estimated Time:** 2 hours  
**Dependencies:** Task 2.2

**Implementation:**

```typescript
// components/features/Paywall.tsx
'use client'

import { css } from '@/styled-system/css'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/hooks/useSubscription'
import { useRouter } from 'next/navigation'
import { LucideLock } from 'lucide-react'

interface PaywallProps {
  feature: string
  children: React.ReactNode
}

export function Paywall({ feature, children }: PaywallProps) {
  const { data, isLoading } = useSubscription()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className={css({ textAlign: 'center', py: '12' })}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!data?.hasActiveSubscription) {
    return (
      <div
        className={css({
          bg: 'gray.50',
          borderRadius: 'xl',
          p: { base: '6', md: '8' },
          textAlign: 'center',
        })}
      >
        <LucideLock className={css({ w: '12', h: '12', mx: 'auto', mb: '4', color: 'gray.400' })} />
        <h3 className={css({ fontSize: '2xl', fontWeight: 'bold', mb: '2' })}>
          Premium Feature
        </h3>
        <p className={css({ color: 'gray.600', mb: '6' })}>
          {feature} is available in Pro and Team plans
        </p>
        <Button onClick={() => router.push('/pricing')}>
          View Pricing
        </Button>
      </div>
    )
  }

  return <>{children}</>
}

// Usage:
// <Paywall feature="Export to PDF">
//   <PdfExportButton />
// </Paywall>
```

---

## Phase 3: Customer Portal & Email (Week 3)

### Task 3.1: Customer Portal Integration ⏳

**Priority:** 🟢 Low  
**Estimated Time:** 2 hours  
**Dependencies:** None

**Implementation:**

```typescript
// app/api/subscription/portal/route.ts
import { type NextRequest, NextResponse } from 'next/server'
import { polar } from '@/lib/services/polar'
import { supabase } from '@/lib/auth/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get Polar customer portal URL
    // Note: Check Polar docs for exact API method
    const portalUrl = await polar.customerPortal.createSession({
      customerId: user.email, // or polar_customer_id from DB
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
    })

    return NextResponse.json({ url: portalUrl })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
```

**Steps:**
1. Create portal endpoint
2. Add button in account settings
3. Style portal redirect flow

---

### Task 3.2: Email Notifications ⏳

**Priority:** 🟢 Low  
**Estimated Time:** 4 hours  
**Dependencies:** Task 1.1 (Webhooks)

**Implementation Options:**

1. **Resend** (Recommended)
   ```typescript
   // lib/services/email.ts
   import { Resend } from 'resend'

   const resend = new Resend(process.env.RESEND_API_KEY)

   export async function sendSubscriptionConfirmation(email: string, plan: string) {
     await resend.emails.send({
       from: 'SuperTool <noreply@supertool.com>',
       to: email,
       subject: 'Welcome to SuperTool Pro!',
       html: `
         <h1>Welcome to SuperTool ${plan}!</h1>
         <p>Your subscription is now active.</p>
         <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard">Get Started</a>
       `,
     })
   }
   ```

2. **Email Templates:**
   - Subscription confirmation
   - Payment receipt
   - Payment failed
   - Subscription canceled
   - Trial ending reminder

---

## Phase 4: Testing & Launch

### Task 4.1: Integration Testing ⏳

**Priority:** 🔴 Critical  
**Estimated Time:** 4 hours  
**Dependencies:** All previous tasks

**Test Scenarios:**

```typescript
// __tests__/integration/payment-flow.test.ts
import { describe, it, expect } from 'vitest'
import { supabase } from '@/lib/auth/supabaseClient'

describe('Payment Flow Integration', () => {
  it('should create checkout session', async () => {
    const response = await fetch('http://localhost:3000/api/payment/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productPriceId: 'test_price_id',
      }),
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.url).toBeDefined()
  })

  it('should handle webhook events', async () => {
    // Test webhook processing
    const mockPayload = {
      type: 'subscription.created',
      data: {
        id: 'sub_test123',
        attributes: {
          customer_email: 'test@example.com',
          status: 'active',
        },
      },
    }

    const response = await fetch('http://localhost:3000/api/webhooks/polar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'polar-signature': 'test_signature',
      },
      body: JSON.stringify(mockPayload),
    })

    expect(response.ok).toBe(true)

    // Verify database insert
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('polar_subscription_id', 'sub_test123')
      .single()

    expect(data).toBeDefined()
    expect(data.status).toBe('active')
  })
})
```

**Manual Testing Checklist:**

- [ ] Create checkout session
- [ ] Complete payment in Polar
- [ ] Verify webhook received
- [ ] Check database updated
- [ ] Confirm email sent
- [ ] Test subscription status check
- [ ] Cancel subscription
- [ ] Verify cancellation workflow
- [ ] Test customer portal access

---

### Task 4.2: Documentation ⏳

**Priority:** 🟢 Low  
**Estimated Time:** 2 hours  
**Dependencies:** None

**Documents to Create:**

1. **Environment Variables Guide:**
   ```bash
   # .env.example additions
   POLAR_ACCESS_TOKEN=your_token_here
   POLAR_ORGANIZATION_ID=your_org_id
   POLAR_WEBHOOK_SECRET=your_webhook_secret
   NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRICE_ID=price_xxx
   NEXT_PUBLIC_POLAR_TEAM_MONTHLY_PRICE_ID=price_xxx
   RESEND_API_KEY=your_resend_key
   ```

2. **API Documentation:**
   - Checkout endpoint usage
   - Webhook event types
   - Subscription management APIs

3. **User Guide:**
   - How to subscribe
   - How to cancel
   - How to access customer portal

---

## Implementation Checklist

### Week 1: Backend (16 hours)
- [ ] Create webhook endpoint (`app/api/webhooks/polar/route.ts`)
- [ ] Set up database schema (Supabase migration)
- [ ] Create TypeScript types
- [ ] Implement webhook handlers
- [ ] Create subscription status API
- [ ] Create subscription cancel API
- [ ] Test webhook locally with ngrok
- [ ] Deploy and test in production

### Week 2: Frontend (10 hours)
- [ ] Create pricing page component
- [ ] Implement checkout flow
- [ ] Create `useSubscription` hook
- [ ] Build Paywall component
- [ ] Add subscription status to navbar/account
- [ ] Test user flows
- [ ] Style with Panda CSS (mobile-first)
- [ ] Add loading states and error handling

### Week 3: Portal & Email (6 hours)
- [ ] Set up customer portal integration
- [ ] Configure email service (Resend)
- [ ] Create email templates
- [ ] Implement email notifications
- [ ] Test email delivery
- [ ] Add unsubscribe functionality

### Week 3: Testing & Launch (6 hours)
- [ ] Write integration tests
- [ ] Manual testing checklist
- [ ] Document environment variables
- [ ] Create user documentation
- [ ] Set up monitoring/alerts
- [ ] Deploy to production
- [ ] Announce launch

---

## Environment Variables Needed

```bash
# Polar Configuration (Required)
POLAR_ACCESS_TOKEN=        # Get from: https://polar.sh/dashboard/settings
POLAR_ORGANIZATION_ID=     # Your organization ID
POLAR_WEBHOOK_SECRET=      # Create at: https://polar.sh/dashboard/webhooks

# Polar Product Price IDs (Required for checkout)
NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRICE_ID=    # Pro plan monthly price ID
NEXT_PUBLIC_POLAR_TEAM_MONTHLY_PRICE_ID=   # Team plan monthly price ID

# Email Service (Optional but recommended)
RESEND_API_KEY=           # Get from: https://resend.com

# App Configuration
NEXT_PUBLIC_BASE_URL=     # https://supertool.com (production)
```

---

## Cost Estimates

### Development Costs (One-time)
- Backend development: 16 hours × $100/hr = $1,600
- Frontend development: 10 hours × $100/hr = $1,000
- Portal & Email: 6 hours × $100/hr = $600
- Testing & Launch: 6 hours × $100/hr = $600
- **Total Development: $3,800**

### Monthly Operating Costs
- Polar fees: 4% + $0.40 per transaction (variable)
- Resend (emails): $0-$20/month (1,000-100K emails)
- Supabase: $0-$25/month (included in current plan)
- **Total Monthly: $0-$45 (+ transaction fees)**

### Break-even Analysis
```
If development cost = $3,800
Average subscription = $9/month
Polar takes 4% + $0.40 = ~$0.76

Net per subscription: $9 - $0.76 = $8.24

Break-even subscribers: $3,800 / $8.24 ≈ 461 subscribers
or
Break-even months: 461 / (assumed 10 new/month) ≈ 46 months

Faster path: 50 subscribers × 10 months = $4,120 revenue
```

---

## Risk Mitigation

### Technical Risks

1. **Webhook Delivery Failure**
   - **Mitigation:** Implement retry logic with exponential backoff
   - **Monitoring:** Set up alerts for failed webhooks

2. **Database Race Conditions**
   - **Mitigation:** Use database transactions for webhook handlers
   - **Testing:** Simulate concurrent webhook deliveries

3. **Payment Fraud**
   - **Mitigation:** Use Polar's built-in fraud detection
   - **Monitoring:** Review suspicious transactions weekly

### Business Risks

1. **Low Conversion Rate**
   - **Mitigation:** Offer 14-day free trial
   - **Testing:** A/B test pricing tiers

2. **High Churn**
   - **Mitigation:** Implement usage analytics to identify at-risk customers
   - **Strategy:** Send retention emails before subscription ends

---

## Next Steps After Launch

### Phase 5: Optimization (Month 2-3)

1. **Analytics Implementation**
   - Track conversion funnel
   - Monitor subscription metrics
   - Analyze churn reasons

2. **Feature Gating**
   - Add premium tool badges
   - Implement usage limits for free tier
   - Track feature adoption

3. **Marketing Integration**
   - Add referral program
   - Implement discount codes
   - Create landing pages for campaigns

4. **User Feedback**
   - Add satisfaction surveys
   - Implement feedback widget
   - Analyze support tickets

---

## Resources & References

### Polar Documentation
- Quick Start: https://docs.polar.sh/quickstart
- API Reference: https://docs.polar.sh/api
- Webhooks: https://docs.polar.sh/webhooks
- TypeScript SDK: https://docs.polar.sh/sdk/typescript

### Supabase
- Database Migrations: https://supabase.com/docs/guides/database/migrations
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security

### Next.js
- API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Environment Variables: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

### Testing
- Vitest: https://vitest.dev
- Playwright: https://playwright.dev

---

## Support & Troubleshooting

### Common Issues

1. **Webhook signature validation failing**
   - Verify `POLAR_WEBHOOK_SECRET` is correct
   - Check request body is raw (not parsed)
   - Ensure signature header name matches

2. **Checkout redirect not working**
   - Verify product price ID is correct
   - Check success URL is whitelisted in Polar dashboard
   - Test with Polar test mode first

3. **Database insert failing**
   - Check RLS policies allow service role
   - Verify migration ran successfully
   - Test with Supabase SQL editor

### Getting Help
- Polar Discord: https://discord.gg/polar
- Supabase Discord: https://discord.supabase.com
- SuperTool Issues: https://github.com/ferryhinardi/supertool/issues

---

**Document Version:** 1.0  
**Last Updated:** December 23, 2025  
**Estimated Timeline:** 2-3 weeks (38 hours total)  
**Status:** Ready for Implementation
