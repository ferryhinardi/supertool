/**
 * Polar Checkout API Route
 * Creates a checkout session for subscription or one-time payments
 *
 * POST /api/payment/checkout
 * Body: { productId: string, successUrl?: string, customerEmail?: string, amount?: number }
 */

import { type NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/auth/supabaseClient'
import { POLAR_CONFIG, polar } from '@/lib/services/polar'

export const runtime = 'nodejs'

interface CheckoutRequest {
  productId: string
  successUrl?: string
  customerEmail?: string
  amount?: number
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckoutRequest
    const { productId, successUrl, customerEmail, amount } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Validate donation product is configured
    if (!POLAR_CONFIG.donationProductId) {
      return NextResponse.json(
        { error: 'Donation product not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Validate product ID matches configured donation product
    if (productId !== POLAR_CONFIG.donationProductId) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    // Validate amount if provided (must be between $1 and $10,000 in cents)
    if (amount !== undefined && (amount < 100 || amount > 1000000)) {
      return NextResponse.json(
        { error: 'Amount must be between $1.00 and $10,000.00' },
        { status: 400 }
      )
    }

    // Get authenticated user from Supabase (optional - Polar works without auth too)
    const authHeader = request.headers.get('authorization')
    let userId: string | undefined
    let userEmail: string | undefined

    if (authHeader) {
      const {
        data: { user },
      } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      userId = user?.id
      userEmail = user?.email
    }

    // Create checkout session with Polar
    // https://docs.polar.sh/api/checkouts/create
    // Note: Amount must be in cents (e.g., $5.00 = 500 cents)
    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?payment=success`,
      ...(amount ? { amount } : {}), // Amount in cents
      ...(customerEmail || userEmail ? { customerEmail: customerEmail || userEmail } : {}),
      ...(userId
        ? {
            metadata: {
              userId,
              userEmail: userEmail || '',
            },
          }
        : {}),
    })

    // Return checkout URL for redirect
    return NextResponse.json({
      checkoutId: checkout.id,
      url: checkout.url,
    })
  } catch (error) {
    console.error('Polar checkout error:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
