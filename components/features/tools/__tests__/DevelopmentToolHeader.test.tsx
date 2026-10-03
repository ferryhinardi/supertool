import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Search } from 'lucide-react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DevelopmentToolHeader } from '@/components/features/tools/DevelopmentToolHeader'
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

describe('DevelopmentToolHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a single heading, back link, and highlights', () => {
    render(
      <DevelopmentToolHeader
        icon={Search}
        eyebrow="Developer workspace"
        title="Regex Tester"
        description="Test and validate regular expressions with live matching, syntax highlighting, and ready-to-use code."
        highlights={['Live matching', 'Multi-language code', 'Extra', 'Ignored']}
      />
    )

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: 'Regex Tester' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Developer Tools' })).toHaveAttribute(
      'href',
      '/tools/development'
    )
    expect(screen.getByText('Developer workspace')).toBeInTheDocument()
    expect(screen.getByText('Live matching')).toBeInTheDocument()
    expect(screen.getByText('Multi-language code')).toBeInTheDocument()
    expect(screen.getByText('Extra')).toBeInTheDocument()
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument()
    expect(screen.queryByText('Processed in your browser')).not.toBeInTheDocument()
  })

  it('tracks back navigation without user content', async () => {
    const user = userEvent.setup()
    render(
      <DevelopmentToolHeader
        icon={Search}
        title="Regex Tester"
        description="Test and validate regular expressions with live matching, syntax highlighting, and ready-to-use code."
      />
    )

    await user.click(screen.getByRole('link', { name: 'Developer Tools' }))

    expect(trackToolEvent).toHaveBeenCalledWith('feature_interaction', {
      feature: 'development_tool_back',
      destination: 'development_hub',
    })
    const payload = vi.mocked(trackToolEvent).mock.calls[0]?.[1]
    expect(JSON.stringify(payload)).not.toMatch(/https?:|@|pattern|token/i)
  })
})
