import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Wand2 } from 'lucide-react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DesignToolHeader } from '@/components/features/tools/DesignToolHeader'
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

describe('DesignToolHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a single heading, back link, and highlights', () => {
    render(
      <DesignToolHeader
        icon={Wand2}
        eyebrow="Gradient studio"
        title="Gradient Generator"
        description="Create CSS gradients visually."
        highlights={['Beautiful CSS Gradients', 'Presets', 'Extra', 'Ignored']}
      />
    )

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Gradient Generator' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Design & Visual Tools' })).toHaveAttribute(
      'href',
      '/tools/design'
    )
    expect(screen.getByText('Gradient studio')).toBeInTheDocument()
    expect(screen.getByText('Beautiful CSS Gradients')).toBeInTheDocument()
    expect(screen.getByText('Presets')).toBeInTheDocument()
    expect(screen.getByText('Extra')).toBeInTheDocument()
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument()
  })

  it('tracks back navigation without user content', async () => {
    const user = userEvent.setup()
    render(
      <DesignToolHeader
        icon={Wand2}
        title="Gradient Generator"
        description="Create CSS gradients visually."
      />
    )

    await user.click(screen.getByRole('link', { name: 'Design & Visual Tools' }))

    expect(trackToolEvent).toHaveBeenCalledWith('feature_interaction', {
      feature: 'design_tool_back',
      destination: 'design_hub',
    })
    const payload = vi.mocked(trackToolEvent).mock.calls[0]?.[1]
    expect(JSON.stringify(payload)).not.toMatch(/https?:|@|#(?:[0-9a-f]{6})/i)
  })
})
