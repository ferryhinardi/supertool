import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MediaToolsLayout from '@/app/tools/media/layout'
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

const pathname = vi.fn(() => '/tools/media/image-optimizer')

vi.mock('next/navigation', () => ({
  usePathname: () => pathname(),
}))

vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('Media tools layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pathname.mockReturnValue('/tools/media/image-optimizer')
  })

  it('renders one family nav under the media workspace header', () => {
    render(
      <MediaToolsLayout>
        <main>
          <h1>Image Optimizer & Converter</h1>
        </main>
      </MediaToolsLayout>
    )

    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getByText('Media Tools')).toBeInTheDocument()
    expect(screen.getAllByRole('navigation', { name: 'Media tools' })).toHaveLength(1)
    expect(
      screen.queryByRole('navigation', { name: 'Data processing tools' })
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Productivity tools' })).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Development tools' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Image Optimizer & Converter' })
    ).toBeInTheDocument()

    const tools = getCategoryTools('media')
    expect(tools.length).toBeGreaterThan(0)
    for (const tool of tools) {
      const link = screen.getByRole('link', {
        name: new RegExp(`^${tool.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
      })
      expect(link).toHaveAttribute('href', tool.href)
    }
    expect(screen.getByRole('link', { name: /^Image Optimizer & Converter$/ })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('tracks media family navigation with a static destination', async () => {
    const user = userEvent.setup()
    render(
      <MediaToolsLayout>
        <main>
          <h1>Image Optimizer & Converter</h1>
        </main>
      </MediaToolsLayout>
    )

    await user.click(screen.getByRole('link', { name: /^Video Converter & Compressor$/ }))

    expect(trackToolEvent).toHaveBeenCalledWith('feature_interaction', {
      feature: 'tool_family_navigation',
      category: 'media',
      destination: 'video-converter',
    })
    const payload = vi.mocked(trackToolEvent).mock.calls[0]?.[1]
    expect(JSON.stringify(payload)).not.toMatch(/https?:|@|\.mp4|\.png|filename/i)
  })
})
