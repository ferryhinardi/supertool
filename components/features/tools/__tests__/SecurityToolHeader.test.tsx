import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Key } from 'lucide-react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SecurityToolHeader } from '@/components/features/tools/SecurityToolHeader'
import { trackToolEvent } from '@/lib/services/analytics'

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

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('SecurityToolHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a single heading, back link, and highlights', () => {
    render(
      <SecurityToolHeader
        icon={Key}
        eyebrow="Credential security"
        title="Password Generator"
        description="Generate cryptographically secure passwords with advanced strength analysis."
        highlights={['Password Generator Pro', 'Breach-aware', 'Extra', 'Ignored']}
      />
    )

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Password Generator' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Security Tools' })).toHaveAttribute(
      'href',
      '/tools/security'
    )
    expect(screen.getByText('Credential security')).toBeInTheDocument()
    expect(screen.getByText('Password Generator Pro')).toBeInTheDocument()
    expect(screen.getByText('Breach-aware')).toBeInTheDocument()
    expect(screen.getByText('Extra')).toBeInTheDocument()
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument()
  })

  it('tracks back navigation without secrets', async () => {
    const user = userEvent.setup()
    render(
      <SecurityToolHeader
        icon={Key}
        title="Password Generator"
        description="Generate cryptographically secure passwords with advanced strength analysis."
      />
    )

    await user.click(screen.getByRole('link', { name: 'Security Tools' }))

    expect(trackToolEvent).toHaveBeenCalledWith('feature_interaction', {
      feature: 'security_tool_back',
      destination: 'security_hub',
    })
    const payload = vi.mocked(trackToolEvent).mock.calls[0]?.[1]
    expect(JSON.stringify(payload)).not.toMatch(/password|secret|token|https?:/i)
  })
})
