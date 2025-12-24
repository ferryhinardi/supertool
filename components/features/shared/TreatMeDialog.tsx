'use client'

import { ArrowLeft, Coffee, Coins, CreditCard, Heart, QrCode, Sparkles, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'

type PaymentStep = 'select' | 'qris' | 'crypto' | 'international' | 'polar'

export function TreatMeDialog() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<PaymentStep>('select')

  // Client-side mount detection for portal safety - removed useEffect
  const mounted = typeof document !== 'undefined'

  const qrisImageUrl =
    'https://mkzyuyvgrqjrhnbtagyh.supabase.co/storage/v1/object/public/uploads/1761388275197-24fee453-215c-4b30-a41b-3756cfd68019.JPG'

  // Reset to select step when dialog closes
  const handleClose = () => {
    setOpen(false)
    setTimeout(() => setStep('select'), 200)
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'linear-gradient(to right, rgb(245, 158, 11), rgb(249, 115, 22))',
          color: 'white',
          fontWeight: '600',
          fontSize: '1rem',
          boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.5)',
          transition: 'all 0.3s',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          paddingTop: '0.625rem',
          paddingBottom: '0.625rem',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(245, 158, 11, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(245, 158, 11, 0.5)'
        }}
      >
        <Coffee style={{ width: '1.25rem', height: '1.25rem' }} />
        <span>Treat Me</span>
      </button>

      {mounted &&
        open &&
        createPortal(
          <button
            type="button"
            onClick={handleClose}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleClose()
              }
            }}
            aria-label="Close dialog"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              backgroundColor: 'rgba(0, 0, 0, 0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="treat-me-dialog-title"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '28rem',
                borderRadius: '1rem',
                border: '2px solid rgba(251, 191, 36, 0.3)',
                padding: '1.5rem',
                backgroundColor: '#0a0a0a',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                maxHeight: '90vh',
                overflowY: 'auto',
                cursor: 'default',
              }}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  color: 'rgb(156, 163, 175)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgb(31, 41, 55)'
                  e.currentTarget.style.color = 'rgb(229, 231, 235)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'rgb(156, 163, 175)'
                }}
                aria-label="Close"
                type="button"
              >
                <X style={{ height: '1.25rem', width: '1.25rem' }} />
              </button>

              {step === 'select' ? (
                <SelectPaymentMethod onSelectMethod={(method) => setStep(method)} />
              ) : step === 'qris' ? (
                <QRISPayment qrisImageUrl={qrisImageUrl} onBack={() => setStep('select')} />
              ) : step === 'polar' ? (
                <PolarPayment onBack={() => setStep('select')} />
              ) : (
                <ComingSoonPayment
                  method={step}
                  onBack={() => setStep('select')}
                  onClose={handleClose}
                />
              )}
            </div>
          </button>,
          document.body
        )}
    </>
  )
}

// Payment Method Selection Component
function SelectPaymentMethod({
  onSelectMethod,
}: {
  onSelectMethod: (method: PaymentStep) => void
}) {
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
          }}
        >
          <Heart
            style={{
              width: '1.5rem',
              height: '1.5rem',
              fill: 'rgb(251, 191, 36)',
              color: 'rgb(251, 191, 36)',
            }}
          />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>Support SuperTool</h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'white' }}>
          Your support keeps this tool free and ad-free! 💖
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Info Box */}
        <div
          style={{
            borderRadius: '0.5rem',
            padding: '1rem',
            borderWidth: '1px',
            borderColor: 'rgba(251, 191, 36, 0.2)',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
          }}
        >
          <div
            style={{
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'rgb(252, 211, 77)',
            }}
          >
            <Sparkles style={{ width: '1rem', height: '1rem' }} />
            Love using these tools?
          </div>
          <div style={{ fontSize: '0.875rem', lineHeight: '1.625', color: 'white' }}>
            Treat me to a coffee and help keep SuperTool running! Every contribution matters. ☕
          </div>
        </div>

        {/* Payment Method Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* QRIS Payment - Available */}
          <button
            onClick={() => onSelectMethod('qris')}
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
              borderColor: 'rgba(34, 197, 94, 0.4)',
              background:
                'linear-gradient(to right, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))',
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
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  }}
                >
                  <QrCode
                    style={{ width: '1.5rem', height: '1.5rem', color: 'rgb(74, 222, 128)' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>
                    QRIS Payment
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgb(209, 213, 219)' }}>
                    GoPay • OVO • Dana • ShopeePay • LinkAja
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
                    color: 'rgb(134, 239, 172)',
                    backgroundColor: 'rgba(34, 197, 94, 0.3)',
                  }}
                >
                  Available
                </span>
                <ArrowLeft
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    transform: 'rotate(180deg)',
                    color: 'rgb(74, 222, 128)',
                    transition: 'transform 0.3s',
                  }}
                />
              </div>
            </div>
          </button>

          {/* International Payment - Available via Polar */}
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
              borderColor: 'rgba(96, 165, 250, 0.4)',
              background:
                'linear-gradient(to right, rgba(96, 165, 250, 0.15), rgba(59, 130, 246, 0.15))',
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
                    backgroundColor: 'rgba(96, 165, 250, 0.2)',
                  }}
                >
                  <CreditCard
                    style={{ width: '1.5rem', height: '1.5rem', color: 'rgb(96, 165, 250)' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>
                    International Payment
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgb(209, 213, 219)' }}>
                    PayPal • Stripe • Credit Card
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
                    backgroundColor: 'rgba(96, 165, 250, 0.3)',
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

          {/* Cryptocurrency - Coming Soon */}
          <button
            onClick={() => onSelectMethod('crypto')}
            style={{
              position: 'relative',
              width: '100%',
              overflow: 'hidden',
              borderRadius: '0.75rem',
              padding: '1rem',
              textAlign: 'left',
              opacity: 0.6,
              transition: 'all 0.3s',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: '#374151',
              backgroundColor: 'rgba(31, 41, 55, 0.5)',
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
                    backgroundColor: 'rgba(55, 65, 81, 0.5)',
                  }}
                >
                  <Coins
                    style={{ width: '1.5rem', height: '1.5rem', color: 'rgb(156, 163, 175)' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>
                    Cryptocurrency
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgb(209, 213, 219)' }}>
                    Bitcoin • Ethereum • USDT
                  </div>
                </div>
              </div>
              <span
                style={{
                  borderRadius: '9999px',
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.25rem',
                  paddingBottom: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'rgb(156, 163, 175)',
                  backgroundColor: '#374151',
                }}
              >
                Coming Soon
              </span>
            </div>
          </button>
        </div>

        {/* Thank You Message */}
        <div
          style={{
            borderRadius: '0.5rem',
            padding: '1rem',
            textAlign: 'center',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(236, 72, 153, 0.2)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgb(249, 168, 212)' }}>
            💖 Every contribution helps keep SuperTool free!
          </div>
          <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'white' }}>
            Thank you for your support!
          </div>
        </div>
      </div>
    </div>
  )
}

// QRIS Payment Component
function QRISPayment({ qrisImageUrl, onBack }: { qrisImageUrl: string; onBack: () => void }) {
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
          <QrCode style={{ width: '1.5rem', height: '1.5rem', color: 'rgb(74, 222, 128)' }} />
          <h2>Scan QRIS to Pay</h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'white' }}>Use any Indonesian e-wallet app</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* QRIS QR Code */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '0.75rem',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            backgroundColor: 'white',
            padding: '1rem',
          }}
        >
          <div style={{ position: 'relative', aspectRatio: '1', width: '100%' }}>
            <Image
              src={qrisImageUrl}
              alt="QRIS Payment Code"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </div>

        {/* Instructions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            padding: '1rem',
          }}
        >
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgb(134, 239, 172)' }}>
            How to Pay:
          </div>
          <ol
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              textAlign: 'left',
              fontSize: '0.75rem',
              color: 'white',
              paddingLeft: 0,
              margin: 0,
              listStyle: 'none',
            }}
          >
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'rgb(74, 222, 128)' }}>1.</span>
              <span>Open any Indonesian e-wallet app (GoPay, OVO, Dana, etc.)</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'rgb(74, 222, 128)' }}>2.</span>
              <span>Select &quot;Scan QR&quot; or &quot;QRIS&quot;</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'rgb(74, 222, 128)' }}>3.</span>
              <span>Scan the QR code above</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'rgb(74, 222, 128)' }}>4.</span>
              <span>Enter your desired amount and confirm</span>
            </li>
          </ol>
        </div>

        {/* Thank You */}
        <div
          style={{
            borderRadius: '0.5rem',
            border: '1px solid rgba(236, 72, 153, 0.2)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            padding: '0.75rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgb(249, 168, 212)' }}>
            💖 Thank you for your support!
          </div>
        </div>

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

// Polar Payment Component
function PolarPayment({ onBack }: { onBack: () => void }) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const predefinedAmounts = [5, 10, 25, 50, 100]

  const handleCheckout = async () => {
    const amount = selectedAmount || Number.parseFloat(customAmount)

    // Explicit validation: check for NaN, negative, and minimum amount
    if (Number.isNaN(amount) || amount < 1) {
      setError('Please enter a valid amount (minimum $1.00)')
      return
    }

    // Prevent amounts over $10,000 to avoid accidental large donations
    if (amount > 10000) {
      setError('Maximum amount is $10,000. Please contact us for larger donations.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: process.env.NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID,
          amount: Math.round(amount * 100), // Convert dollars to cents (e.g., $5.00 -> 500)
          successUrl: `${window.location.origin}?payment=success`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()

      // Redirect to Polar checkout
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const handleCustomAmountChange = (value: string) => {
    // Strict validation: only allow numbers with up to 2 decimal places
    // Regex explanation: ^ = start, \d* = zero or more digits, \.? = optional decimal, \d{0,2} = 0-2 decimal digits, $ = end
    const isValidFormat = value === '' || /^\d*\.?\d{0,2}$/.test(value)

    if (isValidFormat) {
      setCustomAmount(value)
      setSelectedAmount(null)
      setError('') // Clear error when user starts typing valid input
    }
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
          <h2>Support with Card</h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'white' }}>
          Pay securely with PayPal, Credit Card, or Stripe
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Predefined amounts */}
        <div>
          <div
            style={{
              marginBottom: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'white',
            }}
          >
            Select Amount (USD):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {predefinedAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setSelectedAmount(amount)
                  setCustomAmount('')
                  setError('')
                }}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  border: '2px solid',
                  borderColor: selectedAmount === amount ? 'rgb(96, 165, 250)' : 'rgb(55, 65, 81)',
                  backgroundColor:
                    selectedAmount === amount ? 'rgba(96, 165, 250, 0.1)' : 'rgb(31, 41, 55)',
                  color: selectedAmount === amount ? 'rgb(96, 165, 250)' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div>
          <div
            style={{
              marginBottom: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'white',
            }}
          >
            Or Enter Custom Amount:
          </div>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '1rem',
                color: 'rgb(156, 163, 175)',
              }}
            >
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              onFocus={() => setSelectedAmount(null)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2rem',
                borderRadius: '0.5rem',
                border: '2px solid',
                borderColor: customAmount ? 'rgb(96, 165, 250)' : 'rgb(55, 65, 81)',
                backgroundColor: 'rgb(31, 41, 55)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'rgb(252, 165, 165)',
              fontSize: '0.875rem',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Info box */}
        <div
          style={{
            borderRadius: '0.5rem',
            padding: '0.75rem',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            backgroundColor: 'rgba(96, 165, 250, 0.1)',
          }}
        >
          <div style={{ fontSize: '0.75rem', lineHeight: '1.5', color: 'rgb(191, 219, 254)' }}>
            🔒 Secure payment powered by Polar. Supports PayPal, Credit/Debit Cards, and Stripe.
          </div>
        </div>

        {/* Thank you message */}
        <div
          style={{
            borderRadius: '0.5rem',
            border: '1px solid rgba(236, 72, 153, 0.2)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            padding: '0.75rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgb(249, 168, 212)' }}>
            💖 Thank you for your support!
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            onClick={onBack}
            disabled={loading}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderColor: 'rgb(64, 64, 64)',
            }}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            Back
          </Button>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading || (!selectedAmount && !customAmount)}
            style={{
              flex: 1,
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              border: 'none',
              backgroundColor:
                loading || (!selectedAmount && !customAmount)
                  ? 'rgb(55, 65, 81)'
                  : 'rgb(96, 165, 250)',
              color: 'white',
              cursor: loading || (!selectedAmount && !customAmount) ? 'not-allowed' : 'pointer',
              opacity: loading || (!selectedAmount && !customAmount) ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Processing...' : 'Continue to Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Coming Soon Payment Component
function ComingSoonPayment({
  method,
  onBack,
  onClose,
}: {
  method: PaymentStep
  onBack: () => void
  onClose: () => void
}) {
  const methodInfo = {
    international: {
      title: 'International Payment',
      icon: CreditCard,
      description: 'PayPal, Stripe, and Credit Card support',
    },
    crypto: {
      title: 'Cryptocurrency',
      icon: Coins,
      description: 'Bitcoin, Ethereum, and USDT support',
    },
  }

  const info = methodInfo[method as 'international' | 'crypto']
  const Icon = info.icon

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
          <Icon style={{ width: '1.5rem', height: '1.5rem', color: 'rgb(156, 163, 175)' }} />
          <h2>{info.title}</h2>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'white' }}>Feature in development</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '2rem',
            paddingBottom: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              marginBottom: '1rem',
              display: 'flex',
              width: '5rem',
              height: '5rem',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '9999px',
              backgroundColor: 'rgb(31, 41, 55)',
            }}
          >
            <Icon style={{ width: '2.5rem', height: '2.5rem', color: 'rgb(75, 85, 99)' }} />
          </div>
          <div
            style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'white' }}
          >
            Coming Soon!
          </div>
          <div style={{ fontSize: '0.875rem', color: 'white' }}>{info.description}</div>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'rgb(209, 213, 219)' }}>
            We&apos;re working hard to add more payment options.
            <br />
            Stay tuned for updates!
          </div>
        </div>

        <div
          style={{
            borderRadius: '0.5rem',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            padding: '1rem',
          }}
        >
          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgb(252, 211, 77)' }}>
            <Sparkles style={{ width: '1.25rem', height: '1.25rem', margin: '0 auto 0.5rem' }} />
            For now, you can use QRIS to support us!
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="outline"
            onClick={onBack}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderColor: 'rgb(64, 64, 64)',
            }}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            style={{
              flex: 1,
              borderColor: 'rgb(64, 64, 64)',
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
