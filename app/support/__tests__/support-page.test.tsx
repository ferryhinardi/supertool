import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { metadata } from '../layout'
import SupportPage from '../page'

vi.mock('next/script', () => ({
  default: ({ children, ...props }: Record<string, unknown>) => (
    <script {...props}>{children as string}</script>
  ),
}))

vi.mock('@/styled-system/css', () => ({
  css: () => 'mock-css',
}))

vi.mock('@/components/features/support/DonationForm', () => ({
  default: () => <div>Donation Form</div>,
}))

vi.mock('@/components/features/support/RecentSupporters', () => ({
  default: () => <div>Recent Supporters</div>,
}))

describe('SupportPage', () => {
  it('renders FAQ schema for the visible support questions', () => {
    const { container } = render(<SupportPage />)

    const schemaScript = container.querySelector('script[type="application/ld+json"]')

    expect(schemaScript).not.toBeNull()
    expect(schemaScript?.textContent).toContain('FAQPage')
    expect(schemaScript?.textContent).toContain('Why donate?')
    expect(schemaScript?.textContent).toContain('Is payment secure?')
  })

  it('renders conversion-focused hero and benefit copy', () => {
    render(<SupportPage />)

    expect(
      screen.getByText(/keep supertool fast, private, and shipping weekly/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/fund hosting, ai credits, and new premium-ready tools/i)
    ).toBeInTheDocument()
  })
})

describe('support metadata', () => {
  it('uses conversion-oriented support metadata', () => {
    expect(metadata.title).toBe('Support SuperTool | Help Fund Free & Premium Tools')
    expect(metadata.description).toContain(
      'fund faster shipping for free tools and premium upgrades'
    )
    expect(metadata.openGraph?.title).toBe('Support SuperTool | Fund the Next Premium Upgrade')
  })
})
