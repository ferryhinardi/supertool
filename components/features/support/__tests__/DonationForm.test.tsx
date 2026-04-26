import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import DonationForm from '../DonationForm'

const mockFetch = vi.fn()
const mockTrackToolEvent = vi.fn()
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
const originalLocation = window.location

vi.mock('@/styled-system/css', () => ({
  css: () => 'mock-css',
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: (...args: unknown[]) => mockTrackToolEvent(...args),
}))

describe('DonationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID = 'donation-product'
    global.fetch = mockFetch as typeof fetch

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: 'http://localhost/' },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('submits the default donation tier successfully', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: 'https://polar.sh/checkout/session' }),
    })

    render(<DonationForm />)

    await user.click(screen.getByRole('button', { name: 'Continue to Checkout →' }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'donation-product',
          amount: 1500,
        }),
      })
    })

    expect(window.location.href).toBe('https://polar.sh/checkout/session')
    expect(mockTrackToolEvent).toHaveBeenCalledWith('support_cta_clicked', {
      tier: 'pizza',
      source: 'support_page_checkout',
    })
  })

  it('tracks tier selection CTA clicks before checkout', async () => {
    const user = userEvent.setup()

    render(<DonationForm />)

    await user.click(screen.getByRole('button', { name: /Coffee/i }))

    expect(mockTrackToolEvent).toHaveBeenCalledWith('support_cta_clicked', {
      tier: 'coffee',
      source: 'support_page_tier',
    })
  })

  it('switches to custom mode and validates the amount range', async () => {
    const user = userEvent.setup()

    render(<DonationForm />)

    const customAmountInput = screen.getByLabelText('Or enter a custom amount')
    await user.type(customAmountInput, '0.5')
    await user.click(screen.getByRole('button', { name: 'Continue to Checkout →' }))

    expect(screen.getByText('Amount must be between $1.00 and $10,000.00')).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('keeps checkout enabled when custom mode is active without an amount', async () => {
    const user = userEvent.setup()

    render(<DonationForm />)

    const customAmountInput = screen.getByLabelText('Or enter a custom amount')
    await user.type(customAmountInput, '25')
    await user.clear(customAmountInput)

    expect(screen.getByRole('button', { name: 'Continue to Checkout →' })).toBeEnabled()
  })

  it('shows the custom amount required message when custom mode is active without a value', async () => {
    const user = userEvent.setup()

    render(<DonationForm />)

    const customAmountInput = screen.getByLabelText('Or enter a custom amount')
    const submitButton = screen.getByRole('button', { name: 'Continue to Checkout →' })

    await user.type(customAmountInput, '25')
    await user.clear(customAmountInput)

    expect(submitButton).toBeEnabled()

    fireEvent.click(submitButton)

    expect(await screen.findByText('Please enter an amount')).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('clears the custom amount when a tier is selected again', async () => {
    const user = userEvent.setup()

    render(<DonationForm />)

    const customAmountInput = screen.getByLabelText('Or enter a custom amount')
    await user.type(customAmountInput, '25')
    await user.click(screen.getByRole('button', { name: /Coffee/i }))

    expect(customAmountInput).toHaveValue('')
  })

  it('surfaces checkout failures and restores the submit button state', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Checkout unavailable' }),
    })

    render(<DonationForm />)

    await user.click(screen.getByRole('button', { name: 'Continue to Checkout →' }))

    expect(await screen.findByText('Checkout unavailable')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue to Checkout →' })).toBeEnabled()
    expect(mockConsoleError).toHaveBeenCalled()
  })

  it('surfaces a missing checkout URL response', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    render(<DonationForm />)

    await user.click(screen.getByRole('button', { name: 'Continue to Checkout →' }))

    expect(await screen.findByText('No checkout URL returned')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue to Checkout →' })).toBeEnabled()
    expect(mockConsoleError).toHaveBeenCalled()
  })
})
