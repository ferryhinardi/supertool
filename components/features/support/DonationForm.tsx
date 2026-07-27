'use client'

import { useState } from 'react'

import type { DonationTier } from '@/lib/data/donation-tiers'
import { DONATION_TIERS, formatAmount, isValidAmount, parseAmount } from '@/lib/data/donation-tiers'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

/**
 * Donation Form Component (Client Component)
 * Handles user interaction for selecting tiers and processing donations
 */
export default function DonationForm() {
  const [selectedTier, setSelectedTier] = useState<DonationTier | null>(DONATION_TIERS[1]) // Default to Pizza
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTierSelect = (tier: DonationTier) => {
    trackToolEvent('support_cta_clicked', {
      tier: tier.id,
      source: 'support_page_tier',
    })
    setSelectedTier(tier)
    setIsCustom(false)
    setCustomAmount('')
    setError('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setIsCustom(true)
    setSelectedTier(null)
    setError('')
  }

  const handleDonate = async () => {
    setError('')

    // Determine amount
    let amountCents: number

    if (isCustom) {
      if (!customAmount) {
        setError('Please enter an amount')
        return
      }
      amountCents = parseAmount(customAmount)
    } else if (selectedTier) {
      amountCents = selectedTier.amount
    } else {
      setError('Please select a donation tier or enter a custom amount')
      return
    }

    // Validate amount
    if (!isValidAmount(amountCents)) {
      setError('Amount must be between $1.00 and $10,000.00')
      return
    }

    const donationProductId = process.env.NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID

    if (!donationProductId) {
      setError('Donation checkout is not configured right now. Please contact support.')
      return
    }

    trackToolEvent('support_cta_clicked', {
      tier: selectedTier?.id ?? 'custom',
      source: 'support_page_checkout',
    })

    setIsLoading(true)

    try {
      // Call checkout API
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: donationProductId,
          amount: amountCents,
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to create checkout'

        try {
          const data = (await response.json()) as { error?: string }
          errorMessage = data.error || errorMessage
        } catch {
          // Fall back to the default checkout error message when the response is malformed.
        }

        throw new Error(errorMessage)
      }

      let data: { url?: string }

      try {
        data = (await response.json()) as { url?: string }
      } catch {
        throw new Error('Failed to read checkout response')
      }

      // Redirect to Polar checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error('Donation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process donation')
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Donation Tiers */}
      <div className={css({ maxW: '5xl', mx: 'auto', spaceY: '6' })}>
        <h2
          className={css({
            fontSize: { base: '2xl', sm: '3xl' },
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'white',
          })}
        >
          Choose Your Support Level
        </h2>

        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: '4',
          })}
        >
          {DONATION_TIERS.map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => handleTierSelect(tier)}
              className={css({
                position: 'relative',
                bg: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'xl',
                p: '6',
                border: '2px solid',
                borderColor:
                  selectedTier?.id === tier.id && !isCustom
                    ? 'blue.500'
                    : 'rgba(255, 255, 255, 0.1)',
                minH: '11',
                cursor: 'pointer',
                transition: 'all 0.2s',
                _hover: {
                  borderColor: 'blue.500',
                  transform: 'translateY(-2px)',
                },
                textAlign: 'center',
              })}
            >
              {tier.popular && (
                <div
                  className={css({
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bg: 'blue.500',
                    color: 'white',
                    fontSize: 'xs',
                    fontWeight: 'bold',
                    px: '3',
                    py: '1',
                    borderRadius: 'full',
                  })}
                >
                  POPULAR
                </div>
              )}
              <div className={css({ fontSize: '4xl', mb: '2' })}>{tier.icon}</div>
              <div className={css({ fontSize: 'xl', fontWeight: 'bold', color: 'white', mb: '1' })}>
                {tier.name}
              </div>
              <div
                className={css({ fontSize: '2xl', fontWeight: 'bold', color: 'blue.400', mb: '2' })}
              >
                {formatAmount(tier.amount)}
              </div>
              <div className={css({ fontSize: 'sm', color: 'gray.400' })}>{tier.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div className={css({ maxW: 'xl', mx: 'auto', spaceY: '4' })}>
        <div
          className={css({
            bg: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'xl',
            p: '6',
            border: '2px solid',
            borderColor: isCustom ? 'blue.500' : 'rgba(255, 255, 255, 0.1)',
          })}
        >
          <label
            htmlFor="custom-amount"
            className={css({
              display: 'block',
              fontSize: 'lg',
              fontWeight: 'semibold',
              color: 'white',
              mb: '3',
            })}
          >
            Or enter a custom amount
          </label>
          <div className={css({ position: 'relative' })}>
            <span
              className={css({
                position: 'absolute',
                left: '4',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 'xl',
                color: 'gray.400',
              })}
            >
              $
            </span>
            <input
              id="custom-amount"
              type="text"
              placeholder="25.00"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              className={css({
                w: 'full',
                bg: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'lg',
                px: '4',
                py: '3',
                pl: '8',
                fontSize: 'xl',
                minH: '11',
                color: 'white',
                _placeholder: { color: 'gray.500' },
                _focus: {
                  outline: 'none',
                  borderColor: 'blue.500',
                  ring: '2px',
                  ringColor: 'blue.500/30',
                },
              })}
            />
          </div>
          <p className={css({ fontSize: 'sm', color: 'gray.400', mt: '2' })}>
            Enter any amount between $1.00 and $10,000.00
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className={css({
              bg: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'lg',
              p: '4',
              color: 'red.400',
              textAlign: 'center',
            })}
          >
            {error}
          </div>
        )}

        {/* Donate Button */}
        <button
          type="button"
          onClick={handleDonate}
          disabled={isLoading || (!selectedTier && !customAmount && !isCustom)}
          className={css({
            w: 'full',
            bg: 'blue.500',
            color: 'white',
            fontSize: 'lg',
            fontWeight: 'semibold',
            minH: '11',
            py: '4',
            borderRadius: 'lg',
            cursor: 'pointer',
            transition: 'all 0.2s',
            _hover: {
              bg: 'blue.600',
            },
            _disabled: {
              opacity: 0.5,
              cursor: 'not-allowed',
            },
          })}
        >
          {isLoading ? 'Processing...' : 'Continue to Checkout →'}
        </button>
      </div>
    </>
  )
}
