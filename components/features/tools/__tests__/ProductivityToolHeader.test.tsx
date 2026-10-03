import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Type } from 'lucide-react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProductivityToolHeader } from '@/components/features/tools/ProductivityToolHeader'
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

describe('ProductivityToolHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a single heading, back link, and highlights', () => {
    render(
      <ProductivityToolHeader
        icon={Type}
        eyebrow="Text productivity"
        title="Case Converter"
        description="Convert text between camelCase, PascalCase, snake_case, kebab-case, and more."
        highlights={['11 case formats', 'Instant preview']}
      />
    )

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: 'Case Converter' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Productivity Tools' })).toHaveAttribute(
      'href',
      '/tools/productivity'
    )
    expect(screen.getByText('Text productivity')).toBeInTheDocument()
    expect(screen.getByText('Processed in your browser')).toBeInTheDocument()
    expect(screen.getByText('11 case formats')).toBeInTheDocument()
    expect(screen.getByText('Instant preview')).toBeInTheDocument()
  })

  it('tracks back navigation without a user URL', async () => {
    const user = userEvent.setup()
    render(
      <ProductivityToolHeader
        icon={Type}
        title="Case Converter"
        description="Convert text between camelCase, PascalCase, snake_case, kebab-case, and more."
      />
    )

    await user.click(screen.getByRole('link', { name: 'Productivity Tools' }))

    expect(trackToolEvent).toHaveBeenCalledWith('feature_interaction', {
      feature: 'productivity_tool_back',
      destination: 'productivity_hub',
    })
    const payload = vi.mocked(trackToolEvent).mock.calls[0]?.[1]
    expect(JSON.stringify(payload)).not.toMatch(/https?:|@/)
  })
})
