import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TreatMeDialog } from '../TreatMeDialog'

const { mockFetch } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
}))
const mockTrackToolEvent = vi.fn()

vi.mock('next/image', () => ({
  default: ({ alt, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img alt={alt} src={typeof src === 'string' ? src : ''} {...props} />
  ),
}))

vi.mock('lucide-react', () => {
  const makeIcon = (name: string) => (props: React.SVGProps<SVGSVGElement>) =>
    React.createElement('svg', { ...props, 'data-testid': name })

  return {
    ArrowLeft: makeIcon('arrow-left-icon'),
    Coffee: makeIcon('coffee-icon'),
    Coins: makeIcon('coins-icon'),
    CreditCard: makeIcon('credit-card-icon'),
    Heart: makeIcon('heart-icon'),
    QrCode: makeIcon('qr-icon'),
    Sparkles: makeIcon('sparkles-icon'),
    X: makeIcon('close-icon'),
  }
})

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: (...args: unknown[]) => mockTrackToolEvent(...args),
}))

describe('TreatMeDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
    vi.stubGlobal('fetch', mockFetch)
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: {
        origin: 'http://localhost:3000',
        href: 'http://localhost:3000',
      },
    })
  })

  async function openDialog() {
    const user = userEvent.setup()

    render(<TreatMeDialog />)
    await user.click(screen.getByRole('button', { name: /treat me/i }))

    return user
  }

  it('opens the payment selector and closes from the overlay', async () => {
    const user = await openDialog()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/support supertool/i)).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
    expect(mockTrackToolEvent).toHaveBeenCalledWith('support_cta_clicked', {
      tier: 'entry',
      source: 'treat_me_dialog_open',
    })

    await user.click(screen.getByRole('button', { name: /close dialog/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    expect(document.body.style.overflow).toBe('unset')
  })

  it('closes from the top-right close button and restores body overflow on unmount', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<TreatMeDialog />)

    await user.click(screen.getByRole('button', { name: /treat me/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')

    await user.click(screen.getByRole('button', { name: /^close$/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    expect(document.body.style.overflow).toBe('unset')

    await user.click(screen.getByRole('button', { name: /treat me/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('unset')
  })

  it('navigates to QRIS payment details and back', async () => {
    const user = await openDialog()

    await user.click(screen.getByRole('button', { name: /qris payment/i }))

    expect(screen.getByText(/scan qris to pay/i)).toBeInTheDocument()
    expect(screen.getByAltText(/qris payment code/i)).toBeInTheDocument()
    expect(screen.getByText(/how to pay/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /back to payment methods/i }))

    expect(screen.getByText(/support supertool/i)).toBeInTheDocument()
  })

  it('shows a coming soon flow for cryptocurrency and can close from there', async () => {
    const user = await openDialog()

    await user.click(screen.getByRole('button', { name: /cryptocurrency/i }))

    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
    expect(screen.getByText(/bitcoin, ethereum, and usdt support/i)).toBeInTheDocument()

    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getAllByRole('button', { name: /^close$/i })[1])
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('validates Polar amounts and redirects on successful checkout', async () => {
    const user = await openDialog()

    await user.click(screen.getByRole('button', { name: /international payment/i }))

    await user.type(screen.getByPlaceholderText('0.00'), '0.5')
    await user.click(screen.getByRole('button', { name: /continue to payment/i }))
    expect(screen.getByText(/please enter a valid amount/i)).toBeInTheDocument()

    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ url: 'https://polar.sh/checkout/session-1' }),
    })

    const amountInput = screen.getByPlaceholderText('0.00')
    await user.clear(amountInput)
    await user.click(screen.getByRole('button', { name: '$10' }))
    await user.click(screen.getByRole('button', { name: /continue to payment/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: process.env.NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID,
          amount: 1000,
          successUrl: 'http://localhost:3000?payment=success',
        }),
      })
    })

    expect(window.location.href).toBe('https://polar.sh/checkout/session-1')
    expect(mockTrackToolEvent).toHaveBeenCalledWith('support_cta_clicked', {
      tier: '10',
      source: 'treat_me_dialog_checkout',
    })
  })

  it('surfaces checkout failures and allows returning to payment methods', async () => {
    const user = await openDialog()

    await user.click(screen.getByRole('button', { name: /international payment/i }))

    mockFetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'Checkout unavailable' }),
    })

    await user.type(screen.getByPlaceholderText('0.00'), '25')
    await user.click(screen.getByRole('button', { name: /continue to payment/i }))

    expect(await screen.findByText('Checkout unavailable')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^back$/i }))
    expect(screen.getByText(/support supertool/i)).toBeInTheDocument()
  })

  it('shows the maximum amount validation message for oversized donations', async () => {
    const user = await openDialog()

    await user.click(screen.getByRole('button', { name: /international payment/i }))
    await user.type(screen.getByPlaceholderText('0.00'), '10001')
    await user.click(screen.getByRole('button', { name: /continue to payment/i }))

    expect(
      await screen.findByText(
        /maximum amount is \$10,000\. please contact us for larger donations\./i
      )
    ).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
