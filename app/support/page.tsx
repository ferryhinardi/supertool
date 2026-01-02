'use client'

import { useState } from 'react'

import type { DonationTier } from '@/lib/data/donation-tiers'
import { DONATION_TIERS, formatAmount, isValidAmount, parseAmount } from '@/lib/data/donation-tiers'
import { css } from '@/styled-system/css'

export default function SupportPage() {
  const [selectedTier, setSelectedTier] = useState<DonationTier | null>(DONATION_TIERS[1]) // Default to Pizza
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTierSelect = (tier: DonationTier) => {
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

    setIsLoading(true)

    try {
      // Call checkout API
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: process.env.NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID,
          amount: amountCents,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout')
      }

      const data = await response.json()

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
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '8', sm: '10', md: '12' },
      })}
    >
      {/* Hero Section */}
      <div className={css({ textAlign: 'center', spaceY: '4' })}>
        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'bold',
            color: 'white',
          })}
        >
          Support SuperTool
        </h1>
        <p
          className={css({
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
            maxW: '2xl',
            mx: 'auto',
          })}
        >
          Help us keep SuperTool free and ad-free for everyone. Your donation fuels development and
          hosting costs.
        </p>
      </div>

      {/* Stats Section */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', sm: 'repeat(3, 1fr)' },
          gap: { base: '4', sm: '6' },
          maxW: '4xl',
          mx: 'auto',
        })}
      >
        <div
          className={css({
            bg: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'xl',
            p: '6',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          })}
        >
          <div className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'blue.400' })}>60+</div>
          <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>Free Tools</div>
        </div>
        <div
          className={css({
            bg: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'xl',
            p: '6',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          })}
        >
          <div className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'green.400' })}>
            100%
          </div>
          <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>Open Source</div>
        </div>
        <div
          className={css({
            bg: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'xl',
            p: '6',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          })}
        >
          <div className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'purple.400' })}>0</div>
          <div className={css({ fontSize: 'sm', color: 'gray.400', mt: '1' })}>Ads or Trackers</div>
        </div>
      </div>

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
          disabled={isLoading || (!selectedTier && !customAmount)}
          className={css({
            w: 'full',
            bg: 'blue.500',
            color: 'white',
            fontSize: 'lg',
            fontWeight: 'semibold',
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

      {/* FAQ Section */}
      <div className={css({ maxW: '3xl', mx: 'auto', spaceY: '6' })}>
        <h2
          className={css({
            fontSize: { base: '2xl', sm: '3xl' },
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'white',
          })}
        >
          Frequently Asked Questions
        </h2>

        <div className={css({ spaceY: '4' })}>
          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'lg',
              p: '6',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            })}
          >
            <h3
              className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white', mb: '2' })}
            >
              Why donate?
            </h3>
            <p className={css({ color: 'gray.400' })}>
              SuperTool is completely free with no ads. Your donations help cover hosting costs, API
              fees, and allow us to develop new features.
            </p>
          </div>

          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'lg',
              p: '6',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            })}
          >
            <h3
              className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white', mb: '2' })}
            >
              Is payment secure?
            </h3>
            <p className={css({ color: 'gray.400' })}>
              Yes! Payments are processed securely by Polar.sh using Stripe. We never see or store
              your payment information.
            </p>
          </div>

          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'lg',
              p: '6',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            })}
          >
            <h3
              className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white', mb: '2' })}
            >
              What do I get?
            </h3>
            <p className={css({ color: 'gray.400' })}>
              All tools remain free for everyone! Your donation supports the project and shows your
              appreciation. You'll receive a receipt and our gratitude.
            </p>
          </div>

          <div
            className={css({
              bg: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'lg',
              p: '6',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            })}
          >
            <h3
              className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white', mb: '2' })}
            >
              Can I get a refund?
            </h3>
            <p className={css({ color: 'gray.400' })}>
              Donations are non-refundable, but we honor refund requests within 14 days. Contact us
              if you have any concerns.
            </p>
          </div>
        </div>
      </div>

      {/* Thank You Message */}
      <div
        className={css({
          textAlign: 'center',
          maxW: '2xl',
          mx: 'auto',
          p: '8',
          bg: 'rgba(59, 130, 246, 0.1)',
          borderRadius: 'xl',
          border: '1px solid rgba(59, 130, 246, 0.2)',
        })}
      >
        <p className={css({ fontSize: 'lg', color: 'gray.300', mb: '4' })}>
          Thank you for supporting SuperTool! Every donation, no matter the size, helps us continue
          building amazing free tools for everyone.
        </p>
        <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
          Questions? Contact us at{' '}
          <a href="mailto:support@supertool.id" className={css({ color: 'blue.400' })}>
            support@supertool.id
          </a>
        </p>
      </div>
    </main>
  )
}
