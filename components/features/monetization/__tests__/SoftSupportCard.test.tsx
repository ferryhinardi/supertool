import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SoftSupportCard } from '@/components/features/monetization/SoftSupportCard'

const trackToolEvent = vi.fn()

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: (...args: unknown[]) => trackToolEvent(...args),
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: {
    children: React.ReactNode
    href: string
    onClick?: () => void
    [key: string]: unknown
  }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}))

describe('SoftSupportCard', () => {
  beforeEach(() => {
    trackToolEvent.mockClear()
  })

  it('renders support CTA and tracks view', () => {
    render(<SoftSupportCard toolId="resume-builder" />)

    expect(screen.getByRole('link', { name: /Support Us/i })).toHaveAttribute('href', '/support')
    expect(trackToolEvent).toHaveBeenCalledWith('support_cta_view', {
      tool_id: 'resume-builder',
      placement: 'soft_support_card',
    })
  })

  it('tracks click when Support Us is pressed', async () => {
    const user = userEvent.setup()
    render(<SoftSupportCard toolId="json-beautify" />)

    await user.click(screen.getByRole('link', { name: /Support Us/i }))

    expect(trackToolEvent).toHaveBeenCalledWith('support_cta_click', {
      tool_id: 'json-beautify',
      placement: 'soft_support_card',
    })
  })
})
