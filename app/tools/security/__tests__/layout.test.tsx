import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SecurityToolsLayout from '@/app/tools/security/layout'
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

const pathname = vi.fn(() => '/tools/security/password-generator')

vi.mock('next/navigation', () => ({
  usePathname: () => pathname(),
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('Security tools layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pathname.mockReturnValue('/tools/security/password-generator')
  })

  it('renders one family nav under the security workspace header', () => {
    render(
      <SecurityToolsLayout>
        <main>
          <h1>Password Generator</h1>
        </main>
      </SecurityToolsLayout>
    )

    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getByText('Security Tools')).toBeInTheDocument()
    expect(screen.getAllByRole('navigation', { name: 'Security tools' })).toHaveLength(1)
    expect(screen.queryByRole('navigation', { name: 'Media tools' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: 'Data processing tools' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Password Generator' })
    ).toBeInTheDocument()

    const tools = getCategoryTools('security')
    expect(tools.length).toBeGreaterThan(0)
    for (const tool of tools) {
      const link = screen.getByRole('link', {
        name: new RegExp(`^${tool.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
      })
      expect(link).toHaveAttribute('href', tool.href)
    }
    expect(screen.getByRole('link', { name: /^Password Generator$/ })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('tracks security family navigation without secrets', async () => {
    const user = userEvent.setup()
    render(
      <SecurityToolsLayout>
        <main>
          <h1>Password Generator</h1>
        </main>
      </SecurityToolsLayout>
    )

    await user.click(screen.getByRole('link', { name: /^Hash Generator & Verifier$/ }))

    expect(trackToolEvent).toHaveBeenCalledWith('feature_interaction', {
      feature: 'tool_family_navigation',
      category: 'security',
      destination: 'hash-generator',
    })
    const payload = vi.mocked(trackToolEvent).mock.calls[0]?.[1]
    expect(JSON.stringify(payload)).not.toMatch(/password|secret|token|https?:/i)
  })
})
