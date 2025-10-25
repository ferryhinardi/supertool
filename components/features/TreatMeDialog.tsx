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
      <Button
        size="lg"
        onClick={() => setOpen(true)}
        className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/60"
      >
        <Coffee className="h-5 w-5" />
        Treat Me
      </Button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed z-[10000] flex items-center justify-center p-[1rem]"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            onClick={handleClose}
          >
            <div
              className="relative w-full max-w-[28rem] rounded-[1rem] border-[2px] p-[1.5rem] shadow-2xl"
              style={{
                backgroundColor: '#0a0a0a',
                borderColor: 'rgba(251, 191, 36, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-[1rem] right-[1rem] rounded-lg p-[0.5rem] text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
                aria-label="Close"
                type="button"
              >
                <X className="h-5 w-5" />
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
    <div className="space-y-[1.5rem]">
      <div className="text-center">
        <div className="mb-[0.75rem] flex items-center justify-center gap-[0.5rem]">
          <Heart className="h-[1.5rem] w-[1.5rem] fill-amber-400 text-amber-400" />
          <h2 className="text-[1.5rem] font-bold text-white">Support SuperTool</h2>
        </div>
        <p className="text-[0.875rem] text-white">
          Your support keeps this tool free and ad-free! 💖
        </p>
      </div>

      <div className="space-y-[1rem]">
        {/* Info Box */}
        <div
          className="rounded-lg p-[1rem]"
          style={{
            borderWidth: '1px',
            borderColor: 'rgba(251, 191, 36, 0.2)',
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
          }}
        >
          <div className="mb-[0.5rem] flex items-center gap-[0.5rem] text-[0.875rem] font-semibold text-amber-300">
            <Sparkles className="h-[1rem] w-[1rem]" />
            Love using these tools?
          </div>
          <div className="text-[0.875rem] leading-relaxed text-white">
            Treat me to a coffee and help keep SuperTool running! Every contribution matters. ☕
          </div>
        </div>

        {/* Payment Method Options */}
        <div className="space-y-[0.75rem]">
          {/* QRIS Payment - Available */}
          <button
            onClick={() => onSelectMethod('qris')}
            className="group relative w-full overflow-hidden rounded-xl p-[1rem] text-left transition-all hover:scale-[1.02]"
            style={{
              borderWidth: '2px',
              borderColor: 'rgba(34, 197, 94, 0.4)',
              background:
                'linear-gradient(to right, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))',
            }}
            type="button"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[0.75rem]">
                <div
                  className="flex h-[3rem] w-[3rem] items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
                >
                  <QrCode className="h-[1.5rem] w-[1.5rem] text-green-400" />
                </div>
                <div>
                  <div className="text-[1rem] font-semibold text-white">QRIS Payment</div>
                  <div className="text-[0.75rem] text-gray-300">
                    GoPay • OVO • Dana • ShopeePay • LinkAja
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-[0.5rem]">
                <span
                  className="rounded-full px-[0.75rem] py-[0.25rem] text-[0.75rem] font-bold text-green-300"
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.3)' }}
                >
                  Available
                </span>
                <ArrowLeft className="h-[1.25rem] w-[1.25rem] rotate-180 text-green-400 transition-transform group-hover:translate-x-[0.25rem]" />
              </div>
            </div>
          </button>

          {/* International Payment - Coming Soon */}
          <button
            onClick={() => onSelectMethod('international')}
            className="group relative w-full overflow-hidden rounded-xl p-[1rem] text-left opacity-60 transition-all hover:opacity-80"
            style={{
              borderWidth: '2px',
              borderColor: '#374151',
              backgroundColor: 'rgba(31, 41, 55, 0.5)',
            }}
            type="button"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[0.75rem]">
                <div
                  className="flex h-[3rem] w-[3rem] items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
                >
                  <CreditCard className="h-[1.5rem] w-[1.5rem] text-gray-400" />
                </div>
                <div>
                  <div className="text-[1rem] font-semibold text-white">International Payment</div>
                  <div className="text-[0.75rem] text-gray-300">PayPal • Stripe • Credit Card</div>
                </div>
              </div>
              <span
                className="rounded-full px-[0.75rem] py-[0.25rem] text-[0.75rem] font-bold text-gray-400"
                style={{ backgroundColor: '#374151' }}
              >
                Coming Soon
              </span>
            </div>
          </button>

          {/* Cryptocurrency - Coming Soon */}
          <button
            onClick={() => onSelectMethod('crypto')}
            className="group relative w-full overflow-hidden rounded-xl p-[1rem] text-left opacity-60 transition-all hover:opacity-80"
            style={{
              borderWidth: '2px',
              borderColor: '#374151',
              backgroundColor: 'rgba(31, 41, 55, 0.5)',
            }}
            type="button"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[0.75rem]">
                <div
                  className="flex h-[3rem] w-[3rem] items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
                >
                  <Coins className="h-[1.5rem] w-[1.5rem] text-gray-400" />
                </div>
                <div>
                  <div className="text-[1rem] font-semibold text-white">Cryptocurrency</div>
                  <div className="text-[0.75rem] text-gray-300">Bitcoin • Ethereum • USDT</div>
                </div>
              </div>
              <span
                className="rounded-full px-[0.75rem] py-[0.25rem] text-[0.75rem] font-bold text-gray-400"
                style={{ backgroundColor: '#374151' }}
              >
                Coming Soon
              </span>
            </div>
          </button>
        </div>

        {/* Thank You Message */}
        <div
          className="rounded-lg p-[1rem] text-center"
          style={{
            borderWidth: '1px',
            borderColor: 'rgba(236, 72, 153, 0.2)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
          }}
        >
          <div className="text-[0.875rem] font-medium text-pink-300">
            💖 Every contribution helps keep SuperTool free!
          </div>
          <div className="mt-[0.25rem] text-[0.75rem] text-white">Thank you for your support!</div>
        </div>
      </div>
    </div>
  )
}

// QRIS Payment Component
function QRISPayment({ qrisImageUrl, onBack }: { qrisImageUrl: string; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-2xl font-bold text-white">
          <QrCode className="h-6 w-6 text-green-400" />
          <h2>Scan QRIS to Pay</h2>
        </div>
        <p className="text-sm text-white">Use any Indonesian e-wallet app</p>
      </div>

      <div className="space-y-4">
        {/* QRIS QR Code */}
        <div className="relative overflow-hidden rounded-xl border-2 border-green-500/30 bg-white p-4">
          <div className="relative aspect-square w-full">
            <Image
              src={qrisImageUrl}
              alt="QRIS Payment Code"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
          <div className="text-sm font-medium text-green-300">How to Pay:</div>
          <ol className="space-y-1 text-left text-xs text-white">
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-400">1.</span>
              <span>Open any Indonesian e-wallet app (GoPay, OVO, Dana, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-400">2.</span>
              <span>Select &quot;Scan QR&quot; or &quot;QRIS&quot;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-400">3.</span>
              <span>Scan the QR code above</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-400">4.</span>
              <span>Enter your desired amount and confirm</span>
            </li>
          </ol>
        </div>

        {/* Thank You */}
        <div className="rounded-lg border border-pink-500/20 bg-pink-500/10 p-3 text-center">
          <div className="text-sm font-medium text-pink-300">💖 Thank you for your support!</div>
        </div>

        <Button
          variant="outline"
          onClick={onBack}
          className="w-full gap-2 border-gray-700 hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
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
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-2xl font-bold text-white">
          <Icon className="h-6 w-6 text-gray-400" />
          <h2>{info.title}</h2>
        </div>
        <p className="text-sm text-white">Feature in development</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-800">
            <Icon className="h-10 w-10 text-gray-600" />
          </div>
          <div className="mb-2 text-xl font-bold text-white">Coming Soon!</div>
          <div className="text-sm text-white">{info.description}</div>
          <div className="mt-4 text-xs text-gray-300">
            We&apos;re working hard to add more payment options.
            <br />
            Stay tuned for updates!
          </div>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
          <div className="text-center text-sm text-amber-300">
            <Sparkles className="mx-auto mb-2 h-5 w-5" />
            For now, you can use QRIS to support us!
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 gap-2 border-gray-700 hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-700 hover:bg-gray-800"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
