import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Image as ImageIcon } from 'lucide-react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MediaToolHeader } from '@/components/features/tools/MediaToolHeader'
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

describe('MediaToolHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a single heading, back link, and highlights', () => {
    render(
      <MediaToolHeader
        icon={ImageIcon}
        eyebrow="Image optimization workspace"
        title="Image Optimizer & Converter"
        description="Compress and optimize images up to 80% smaller without visible quality loss."
        highlights={['Professional Image Optimization', 'JPG, PNG, WebP, AVIF', 'Extra', 'Ignored']}
      />
    )

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Image Optimizer & Converter' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Media Tools' })).toHaveAttribute(
      'href',
      '/tools/media'
    )
    expect(screen.getByText('Image optimization workspace')).toBeInTheDocument()
    expect(screen.getByText('Professional Image Optimization')).toBeInTheDocument()
    expect(screen.getByText('JPG, PNG, WebP, AVIF')).toBeInTheDocument()
    expect(screen.getByText('Extra')).toBeInTheDocument()
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument()
    expect(screen.queryByText('Processed in your browser')).not.toBeInTheDocument()
    expect(screen.queryByText('Runs in your browser')).not.toBeInTheDocument()
  })

  it('tracks back navigation without user content', async () => {
    const user = userEvent.setup()
    render(
      <MediaToolHeader
        icon={ImageIcon}
        title="Image Optimizer & Converter"
        description="Compress and optimize images up to 80% smaller without visible quality loss."
      />
    )

    await user.click(screen.getByRole('link', { name: 'Media Tools' }))

    expect(trackToolEvent).toHaveBeenCalledWith('feature_interaction', {
      feature: 'media_tool_back',
      destination: 'media_hub',
    })
    const payload = vi.mocked(trackToolEvent).mock.calls[0]?.[1]
    expect(JSON.stringify(payload)).not.toMatch(/https?:|@|\.png|\.jpg|filename/i)
  })
})
