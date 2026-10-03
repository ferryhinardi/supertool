import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Coins } from 'lucide-react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FinanceToolHeader } from '@/components/features/tools/FinanceToolHeader'
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

describe('FinanceToolHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a single heading, back link, and highlights', () => {
    render(
      <FinanceToolHeader
        icon={Coins}
        eyebrow="Currency conversion"
        title="Currency Converter"
        description="Convert between world currencies with real-time exchange rates."
        highlights={['150+ currencies', 'Real-time rates', 'Extra', 'Ignored']}
      />
    )

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Currency Converter' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Finance Tools' })).toHaveAttribute(
      'href',
      '/tools/finance'
    )
    expect(screen.getByText('Currency conversion')).toBeInTheDocument()
    expect(screen.getByText('150+ currencies')).toBeInTheDocument()
    expect(screen.getByText('Real-time rates')).toBeInTheDocument()
    expect(screen.getByText('Extra')).toBeInTheDocument()
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument()
  })

  it('tracks back navigation without user content', async () => {
    const user = userEvent.setup()
    render(
      <FinanceToolHeader
        icon={Coins}
        title="Currency Converter"
        description="Convert between world currencies with real-time exchange rates."
      />
    )

    await user.click(screen.getByRole('link', { name: 'Finance Tools' }))

    expect(trackToolEvent).toHaveBeenCalledWith('feature_interaction', {
      feature: 'finance_tool_back',
      destination: 'finance_hub',
    })
    const payload = vi.mocked(trackToolEvent).mock.calls[0]?.[1]
    expect(JSON.stringify(payload)).not.toMatch(/https?:|@|password|secret/i)
  })
})
