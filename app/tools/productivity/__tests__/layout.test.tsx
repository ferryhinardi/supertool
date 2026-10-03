import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductivityToolsLayout from '@/app/tools/productivity/layout'
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

const pathname = vi.fn(() => '/tools/productivity/case-converter')

vi.mock('next/navigation', () => ({
  usePathname: () => pathname(),
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('Productivity tools layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pathname.mockReturnValue('/tools/productivity/case-converter')
  })

  it('renders one family nav under the productivity workspace header', () => {
    render(
      <ProductivityToolsLayout>
        <main>
          <h1>Case Converter</h1>
        </main>
      </ProductivityToolsLayout>
    )

    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getByText('Productivity')).toBeInTheDocument()
    expect(screen.getAllByRole('navigation', { name: 'Productivity tools' })).toHaveLength(1)
    expect(
      screen.queryByRole('navigation', { name: 'Data processing tools' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Case Converter' })).toBeInTheDocument()

    const tools = getCategoryTools('productivity')
    expect(tools.length).toBeGreaterThan(0)
    for (const tool of tools) {
      const link = screen.getByRole('link', {
        name: new RegExp(`^${tool.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
      })
      expect(link).toHaveAttribute('href', tool.href)
    }
    expect(screen.getByRole('link', { name: /^Case Converter$/ })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('tracks productivity family navigation with a static destination', async () => {
    const user = userEvent.setup()
    render(
      <ProductivityToolsLayout>
        <main>
          <h1>Case Converter</h1>
        </main>
      </ProductivityToolsLayout>
    )

    await user.click(screen.getByRole('link', { name: 'Word Counter Pro' }))

    expect(trackToolEvent).toHaveBeenCalledWith('feature_interaction', {
      feature: 'tool_family_navigation',
      category: 'productivity',
      destination: 'word-counter',
    })
    const payload = vi.mocked(trackToolEvent).mock.calls[0]?.[1]
    expect(JSON.stringify(payload)).not.toMatch(/https?:|@|\.txt/i)
  })
})
