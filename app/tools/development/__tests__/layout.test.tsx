import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DevelopmentToolsLayout from '@/app/tools/development/layout'
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

const pathname = vi.fn(() => '/tools/development/regex-tester')

vi.mock('next/navigation', () => ({
  usePathname: () => pathname(),
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('Development tools layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pathname.mockReturnValue('/tools/development/regex-tester')
  })

  it('renders one family nav under the development workspace header', () => {
    render(
      <DevelopmentToolsLayout>
        <main>
          <h1>Regex Tester</h1>
        </main>
      </DevelopmentToolsLayout>
    )

    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getByText('Developer Tools')).toBeInTheDocument()
    expect(screen.getAllByRole('navigation', { name: 'Development tools' })).toHaveLength(1)
    expect(
      screen.queryByRole('navigation', { name: 'Data processing tools' })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Productivity tools' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Regex Tester' })).toBeInTheDocument()

    const tools = getCategoryTools('development')
    expect(tools.length).toBeGreaterThan(0)
    for (const tool of tools) {
      const link = screen.getByRole('link', {
        name: new RegExp(`^${tool.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
      })
      expect(link).toHaveAttribute('href', tool.href)
    }
    expect(screen.getByRole('link', { name: /^Regex Tester$/ })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('tracks development family navigation with a static destination', async () => {
    const user = userEvent.setup()
    render(
      <DevelopmentToolsLayout>
        <main>
          <h1>Regex Tester</h1>
        </main>
      </DevelopmentToolsLayout>
    )

    await user.click(screen.getByRole('link', { name: /^API Request Tester$/ }))

    expect(trackToolEvent).toHaveBeenCalledWith('feature_interaction', {
      feature: 'tool_family_navigation',
      category: 'development',
      destination: 'api-tester',
    })
    const payload = vi.mocked(trackToolEvent).mock.calls[0]?.[1]
    expect(JSON.stringify(payload)).not.toMatch(/https?:|@|bearer|token/i)
  })
})
