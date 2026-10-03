import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ToolFamilyNav } from '@/components/features/tools/ToolFamilyNav'
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
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/tools/data/json-to-csv'),
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('ToolFamilyNav', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists data tools from the catalog and marks the active route', () => {
    render(<ToolFamilyNav />)

    const tools = getCategoryTools('data')
    expect(tools.length).toBeGreaterThan(0)

    for (const tool of tools) {
      const link = screen.getByRole('link', { name: tool.title })
      expect(link).toHaveAttribute('href', tool.href)
    }

    expect(screen.getByRole('link', { name: 'JSON to CSV Converter' })).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getByRole('link', { name: 'UUID Generator & Validator' })).not.toHaveAttribute(
      'aria-current'
    )
  })

  it('tracks family navigation with a static tool slug', async () => {
    const user = userEvent.setup()
    render(<ToolFamilyNav />)

    await user.click(screen.getByRole('link', { name: 'JSON Beautifier & Formatter' }))

    expect(trackToolEvent).toHaveBeenCalledWith('feature_interaction', {
      feature: 'data_family_nav',
      target: 'json-beautify',
    })
    const payload = vi.mocked(trackToolEvent).mock.calls[0]?.[1]
    expect(JSON.stringify(payload)).not.toMatch(/https?:|@|\.csv|\.json/i)
  })
})
