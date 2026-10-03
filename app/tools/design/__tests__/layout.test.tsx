import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DesignToolsLayout from '@/app/tools/design/layout'
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

const pathname = vi.fn(() => '/tools/design/gradient-generator')

vi.mock('next/navigation', () => ({
  usePathname: () => pathname(),
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('Design tools layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pathname.mockReturnValue('/tools/design/gradient-generator')
  })

  it('renders one family nav under the design workspace header', () => {
    render(
      <DesignToolsLayout>
        <main>
          <h1>Gradient Generator</h1>
        </main>
      </DesignToolsLayout>
    )

    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getByText('Design & Visual Tools')).toBeInTheDocument()
    expect(screen.getAllByRole('navigation', { name: 'Design tools' })).toHaveLength(1)
    expect(
      screen.queryByRole('navigation', { name: 'Data processing tools' })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Productivity tools' })).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Development tools' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Gradient Generator' })
    ).toBeInTheDocument()

    const tools = getCategoryTools('design')
    expect(tools.length).toBeGreaterThan(0)
    for (const tool of tools) {
      const link = screen.getByRole('link', {
        name: new RegExp(`^${tool.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
      })
      expect(link).toHaveAttribute('href', tool.href)
    }
    expect(screen.getByRole('link', { name: /^Gradient Generator$/ })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('tracks design family navigation with a static destination', async () => {
    const user = userEvent.setup()
    render(
      <DesignToolsLayout>
        <main>
          <h1>Gradient Generator</h1>
        </main>
      </DesignToolsLayout>
    )

    await user.click(screen.getByRole('link', { name: /^Color Picker & Palette Generator$/ }))

    expect(trackToolEvent).toHaveBeenCalledWith('feature_interaction', {
      feature: 'tool_family_navigation',
      category: 'design',
      destination: 'color-picker',
    })
    const payload = vi.mocked(trackToolEvent).mock.calls[0]?.[1]
    expect(JSON.stringify(payload)).not.toMatch(/https?:|@|#(?:[0-9a-f]{6})/i)
  })
})
