import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SSLCheckerPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
  trackEvent: vi.fn(),
}))

// Mock SEO components that use Next.js Link
vi.mock('@/components/ui/social-share', () => ({
  SocialShare: () => null,
}))

vi.mock('@/components/ui/related-tools', () => ({
  RelatedTools: () => null,
}))

vi.mock('@/components/ui/tool-rating', () => ({
  ToolRating: () => null,
}))

describe('SSL Checker Page - Component Tests', () => {
  it('should render SSL checker page', () => {
    render(<SSLCheckerPage />)

    expect(
      screen.getByRole('heading', { name: 'SSL/TLS Certificate Checker', level: 1 })
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Inspect SSL certificates, check expiration dates, and get security recommendations'
      )
    ).toBeInTheDocument()
  })

  it('should display domain input field', () => {
    render(<SSLCheckerPage />)

    const input = screen.getByPlaceholderText('example.com or https://example.com')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
  })

  it('should display Check SSL button', () => {
    render(<SSLCheckerPage />)

    const button = screen.getByRole('button', { name: /Check SSL/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled() // Button is disabled when URL is empty
  })

  it('should display tips section', () => {
    render(<SSLCheckerPage />)

    expect(screen.getByText('SSL/TLS Tips')).toBeInTheDocument()
  })

  it('should display tip about certificate validity', () => {
    render(<SSLCheckerPage />)

    expect(screen.getByText('Certificate Expiry')).toBeInTheDocument()
    expect(
      screen.getByText(/Renew certificates at least 30 days before expiry/i)
    ).toBeInTheDocument()
  })

  it('should display tip about modern TLS', () => {
    render(<SSLCheckerPage />)

    expect(screen.getByText('Modern Protocols')).toBeInTheDocument()
    expect(screen.getByText(/Use TLS 1.2 or higher/i)).toBeInTheDocument()
  })

  it('should display tip about strong encryption', () => {
    render(<SSLCheckerPage />)

    expect(screen.getByText('Strong Encryption')).toBeInTheDocument()
    expect(screen.getByText(/Use 2048-bit or higher key sizes/i)).toBeInTheDocument()
  })

  it('should display tip about trusted CAs', () => {
    render(<SSLCheckerPage />)

    expect(screen.getByText('Trusted CA')).toBeInTheDocument()
    expect(
      screen.getByText(/Always use certificates from trusted Certificate Authorities/i)
    ).toBeInTheDocument()
  })

  it('should display tip about monitoring', () => {
    render(<SSLCheckerPage />)

    expect(screen.getByText('Certificate Monitoring')).toBeInTheDocument()
    expect(screen.getByText(/Set up automated monitoring and alerts/i)).toBeInTheDocument()
  })

  it('should have proper page structure', () => {
    render(<SSLCheckerPage />)

    // Check for main content areas
    expect(screen.getByText('Check SSL Certificate')).toBeInTheDocument()
    expect(screen.getByText('SSL/TLS Tips')).toBeInTheDocument()
  })

  it('should display input field with correct attributes', () => {
    render(<SSLCheckerPage />)

    const input = screen.getByPlaceholderText('example.com or https://example.com')
    expect(input).toHaveAttribute('placeholder', 'example.com or https://example.com')
  })

  it('should not show certificate details results initially', () => {
    render(<SSLCheckerPage />)

    // Check that certificate result fields are not shown (not the badge, which is always visible)
    expect(screen.queryByText('Valid From')).not.toBeInTheDocument()
    expect(screen.queryByText('Valid Until')).not.toBeInTheDocument()
  })

  it('should not show security score initially', () => {
    render(<SSLCheckerPage />)

    expect(screen.queryByText('Security Score')).not.toBeInTheDocument()
  })

  it('should not show copy report button initially', () => {
    render(<SSLCheckerPage />)

    expect(screen.queryByRole('button', { name: /Copy Full Report/i })).not.toBeInTheDocument()
  })
})
