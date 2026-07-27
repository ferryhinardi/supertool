import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { LucideIcon } from 'lucide-react'
import { forwardRef, type SVGProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { ToolOperation } from '@/lib/data/tool-components-types'
import { ToolOperationGrid } from '../ToolOperationGrid'

const mockTrackEvent = vi.fn()

vi.mock('@/lib/services/analytics', () => ({
  trackEvent: (payload: unknown) => mockTrackEvent(payload),
}))

const MockIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => {
  return <svg ref={ref} data-testid="mock-icon" {...props} />
}) as LucideIcon

MockIcon.displayName = 'MockIcon'

const operations: ToolOperation[] = [
  {
    id: 'format',
    label: 'Format',
    description: 'Format the current input',
    icon: MockIcon,
    color: '#3b82f6',
  },
  {
    id: 'minify',
    label: 'Minify',
    description: 'Compress the current input',
    icon: MockIcon,
    color: '#10b981',
    badge: 'Fast',
    shortcut: 'M',
  },
]

describe('ToolOperationGrid', () => {
  it('renders flat operations and tracks selection changes', async () => {
    const user = userEvent.setup()
    const onOperationChange = vi.fn()

    render(
      <ToolOperationGrid
        operations={[...operations]}
        selectedOperation="format"
        onOperationChange={onOperationChange}
        analyticsCategory="json-tool"
      />
    )

    expect(
      screen.getByRole('button', { name: /format: format the current input/i })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Fast')).toBeInTheDocument()
    expect(screen.getByText('M')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /minify: compress the current input/i }))

    expect(onOperationChange).toHaveBeenCalledWith('minify')
    expect(mockTrackEvent).toHaveBeenCalledWith({
      action: 'operation_changed',
      category: 'json-tool',
      label: 'minify',
    })
  })

  it('renders categorized operations and respects disabled state', async () => {
    const user = userEvent.setup()
    const onOperationChange = vi.fn()

    render(
      <ToolOperationGrid
        categories={[
          {
            id: 'transform',
            label: 'Transform',
            operations: [...operations],
          },
        ]}
        selectedOperation="format"
        onOperationChange={onOperationChange}
        disabled
      />
    )

    expect(screen.getByText('Transform')).toBeInTheDocument()

    const minifyButton = screen.getByRole('button', { name: /minify: compress the current input/i })
    expect(minifyButton).toBeDisabled()

    await user.click(minifyButton)

    expect(onOperationChange).not.toHaveBeenCalled()
    expect(mockTrackEvent).not.toHaveBeenCalled()
  })
})
