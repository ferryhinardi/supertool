'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Coffee, Heart, Sparkles, QrCode, CreditCard, Coins, ArrowLeft, X } from 'lucide-react'
import Image from 'next/image'
import { createPortal } from 'react-dom'

type PaymentStep = 'select' | 'qris' | 'crypto' | 'international'

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
          <div
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
            }}
            onClick={handleClose}
          >
            <div
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
              }}
              onClick={(e) => e.stopPropagation()}
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
              ) : (
                <ComingSoonPayment
                  method={step}
                  onBack={() => setStep('select')}
                  onClose={handleClose}
                />
              )}
            </div>
          </div>,
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

          {/* International Payment - Coming Soon */}
          <button
            onClick={() => onSelectMethod('international')}
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
                  <CreditCard
                    style={{ width: '1.5rem', height: '1.5rem', color: 'rgb(156, 163, 175)' }}
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
