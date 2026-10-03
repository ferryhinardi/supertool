import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FinanceToolsLayout from '@/app/tools/finance/layout'
import { getCategoryTools } from '@/lib/data/category-hubs'
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
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault()
        onClick?.()
      }}
      {...props}
    >
      {children}
    </a>
  ),
}))

const pathname = vi.fn(() => '/tools/finance/currency-converter')

vi.mock('next/navigation', () => ({
  usePathname: () => pathname(),
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('Finance tools layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pathname.mockReturnValue('/tools/finance/currency-converter')
  })

  it('renders one family nav under the finance workspace header', () => {
    render(
      <FinanceToolsLayout>
        <main>
          <h1>Currency Converter</h1>
        </main>
      </FinanceToolsLayout>
    )

    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getByText('Finance Tools')).toBeInTheDocument()
    expect(screen.getAllByRole('navigation', { name: 'Finance tools' })).toHaveLength(1)
    expect(
      screen.queryByRole('navigation', { name: 'Data processing tools' })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Productivity tools' })).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Development tools' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Currency Converter' })
    ).toBeInTheDocument()

    const tools = getCategoryTools('finance')
    expect(tools.length).toBeGreaterThan(0)
    for (const tool of tools) {
      const link = screen.getByRole('link', {
        name: new RegExp(`^${tool.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
      })
      expect(link).toHaveAttribute('href', tool.href)
    }
    expect(screen.getByRole('link', { name: /^Currency Converter$/ })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('tracks finance family navigation with a static destination', async () => {
    const user = userEvent.setup()
    render(
      <FinanceToolsLayout>
        <main>
          <h1>Currency Converter</h1>
        </main>
      </FinanceToolsLayout>
    )

    await user.click(screen.getByRole('link', { name: /^Tip Calculator$/ }))

    expect(trackToolEvent).toHaveBeenCalledWith('feature_interaction', {
      feature: 'tool_family_navigation',
      category: 'finance',
      destination: 'tip-calculator',
    })
    const payload = vi.mocked(trackToolEvent).mock.calls[0]?.[1]
    expect(JSON.stringify(payload)).not.toMatch(/https?:|@|password|secret/i)
  })
})
