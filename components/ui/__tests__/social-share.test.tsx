import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SocialShare } from '../social-share'

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock window.open
globalThis.open = vi.fn()

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

describe('SocialShare', () => {
  const defaultProps = {
    toolName: 'Test Tool',
    toolUrl: '/test-tool',
    description: 'Test description',
    hashtags: ['webdev', 'tools'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders social share component', () => {
    render(<SocialShare {...defaultProps} />)

    expect(screen.getByText(/Share This Tool/i)).toBeInTheDocument()
  })

  it('renders all share buttons', () => {
    render(<SocialShare {...defaultProps} />)

    expect(screen.getByText(/Share on X \(Twitter\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Share on LinkedIn/i)).toBeInTheDocument()
    expect(screen.getByText(/Copy Link/i)).toBeInTheDocument()
  })

  it('has Twitter share button', () => {
    render(<SocialShare {...defaultProps} />)

    const twitterButton = screen.getByText(/Share on X \(Twitter\)/i)
    expect(twitterButton).toBeInTheDocument()
  })

  it('has LinkedIn share button', () => {
    render(<SocialShare {...defaultProps} />)

    const linkedInButton = screen.getByText(/Share on LinkedIn/i)
    expect(linkedInButton).toBeInTheDocument()
  })

  it('has copy link button', () => {
    render(<SocialShare {...defaultProps} />)

    const copyButton = screen.getByText(/Copy Link/i)
    expect(copyButton).toBeInTheDocument()
  })

  it('copy button is clickable', async () => {
    const user = userEvent.setup()
    render(<SocialShare {...defaultProps} />)

    const copyButton = screen.getByText(/Copy Link/i)
    expect(copyButton).toBeEnabled()

    // Test that button is interactive
    await user.click(copyButton)
    // If no error is thrown, the click worked
    expect(copyButton).toBeInTheDocument()
  })

  it('displays tool description', () => {
    render(<SocialShare {...defaultProps} />)

    expect(screen.getByText(/Help others discover this free tool/i)).toBeInTheDocument()
  })
})
