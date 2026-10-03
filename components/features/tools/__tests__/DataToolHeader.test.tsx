import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileJson } from 'lucide-react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DataToolHeader } from '@/components/features/tools/DataToolHeader'
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

describe('DataToolHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a single heading, back link, and browser indicator', () => {
    render(
      <DataToolHeader
        icon={FileJson}
        eyebrow="Data Processing"
        title="JSON Beautifier & Formatter"
        description="Format JSON in the browser"
        highlights={['Validation', 'Minify']}
      />
    )

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      screen.getByRole('heading', { level: 1, name: 'JSON Beautifier & Formatter' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Data Processing' })).toHaveAttribute(
      'href',
      '/tools/data'
    )
    expect(screen.getByText('Processed in your browser')).toBeInTheDocument()
    expect(screen.getByText('Validation')).toBeInTheDocument()
    expect(screen.getByText('Minify')).toBeInTheDocument()
  })

  it('tracks back navigation without a user URL', async () => {
    const user = userEvent.setup()
    render(
      <DataToolHeader
        icon={FileJson}
        title="JSON to CSV Converter"
        description="Convert JSON data to CSV with nested object support"
      />
    )

    await user.click(screen.getByRole('link', { name: 'Data Processing' }))

    expect(trackToolEvent).toHaveBeenCalledWith('feature_interaction', {
      feature: 'data_tool_back',
      destination: 'data_hub',
    })
  })
})
