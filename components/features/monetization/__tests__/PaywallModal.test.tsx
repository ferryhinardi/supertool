'use client'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PaywallModal } from '../PaywallModal'

const mockTrackToolEvent = vi.fn()
const mockPush = vi.fn()

vi.mock('@/lib/analytics', () => ({
  trackToolEvent: (...args: unknown[]) => mockTrackToolEvent(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    type = 'button',
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type={type} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: { open?: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="dialog-root">{children}</div> : null,
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div role="dialog" aria-modal="true" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}))

vi.mock('@/styled-system/css', () => ({
  css: () => 'mock-css',
}))

function getEvidenceLines(name: string) {
  return [`Scenario: ${name}`, 'Result: PASS']
}

describe('PaywallModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not render when closed', () => {
    render(
      <PaywallModal
        open={false}
        onOpenChange={vi.fn()}
        reason="quota-exceeded"
        toolSlug="ai-code-converter"
        remaining={0}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mockTrackToolEvent).not.toHaveBeenCalled()
  })

  it('renders quota exceeded copy and tracks paywall_shown when opened', () => {
    render(
      <PaywallModal
        open
        onOpenChange={vi.fn()}
        reason="quota-exceeded"
        toolSlug="ai-code-converter"
        remaining={0}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Upgrade / Support')).toBeInTheDocument()
    expect(screen.getByText(/you've used today's free quota/i)).toBeInTheDocument()
    expect(mockTrackToolEvent).toHaveBeenCalledWith('paywall_shown', {
      reason: 'quota-exceeded',
      remaining: 0,
      tool_slug: 'ai-code-converter',
    })

    expect(getEvidenceLines('paywall_shown')).toEqual(['Scenario: paywall_shown', 'Result: PASS'])
  })

  it('renders anonymous blocked copy and omits remaining when not provided', () => {
    render(
      <PaywallModal
        open
        onOpenChange={vi.fn()}
        reason="anonymous-blocked"
        toolSlug="grammar-checker"
      />
    )

    expect(screen.getByText(/anonymous usage is limited/i)).toBeInTheDocument()
    expect(mockTrackToolEvent).toHaveBeenCalledWith('paywall_shown', {
      reason: 'anonymous-blocked',
      tool_slug: 'grammar-checker',
    })
  })

  it('tracks dismissal and closes when maybe later is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <PaywallModal
        open
        onOpenChange={onOpenChange}
        reason="quota-exceeded"
        toolSlug="json-formatter"
        remaining={1}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Maybe later' }))

    expect(mockTrackToolEvent).toHaveBeenCalledWith('paywall_dismissed', {
      reason: 'quota-exceeded',
      tool_slug: 'json-formatter',
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('tracks upgrade click and navigates to support', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <PaywallModal
        open
        onOpenChange={onOpenChange}
        reason="anonymous-blocked"
        toolSlug="ai-snippet"
      />
    )

    await user.click(screen.getByRole('button', { name: 'Upgrade / Support' }))

    expect(mockTrackToolEvent).toHaveBeenCalledWith('upgrade_clicked', {
      reason: 'anonymous-blocked',
      tool_slug: 'ai-snippet',
    })
    expect(mockPush).toHaveBeenCalledWith('/support')
    expect(onOpenChange).toHaveBeenCalledWith(false)

    expect(getEvidenceLines('upgrade_clicked')).toEqual([
      'Scenario: upgrade_clicked',
      'Result: PASS',
    ])
  })

  it('enforces minimum 44px touch targets on both actions', () => {
    render(
      <PaywallModal
        open
        onOpenChange={vi.fn()}
        reason="quota-exceeded"
        toolSlug="base64"
        remaining={2}
      />
    )

    const maybeLaterButton = screen.getByRole('button', { name: 'Maybe later' })
    const upgradeButton = screen.getByRole('button', { name: 'Upgrade / Support' })
    const maybeLaterStyles = window.getComputedStyle(maybeLaterButton)
    const upgradeStyles = window.getComputedStyle(upgradeButton)

    expect(maybeLaterStyles.minHeight).toBe('44px')
    expect(maybeLaterStyles.minWidth).toBe('44px')
    expect(upgradeStyles.minHeight).toBe('44px')
    expect(upgradeStyles.minWidth).toBe('44px')
  })
})
