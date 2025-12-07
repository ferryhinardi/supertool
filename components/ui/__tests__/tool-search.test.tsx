import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ToolSearch } from '../tool-search'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('ToolSearch', () => {
  it('renders search dialog when open', () => {
    render(<ToolSearch open={true} onOpenChange={vi.fn()} />)

    expect(screen.getByPlaceholderText(/search tools/i)).toBeInTheDocument()
  })

  it('renders controlled component', () => {
    const handleChange = vi.fn()
    render(<ToolSearch open={false} onOpenChange={handleChange} />)

    // Component should render (Dialog root always renders)
    // The visibility is controlled by CSS/aria attributes
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('shows search input field', () => {
    render(<ToolSearch open={true} onOpenChange={vi.fn()} />)

    const input = screen.getByPlaceholderText(/search tools/i)
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
  })

  it('allows typing in search field', async () => {
    const user = userEvent.setup()
    render(<ToolSearch open={true} onOpenChange={vi.fn()} />)

    const input = screen.getByPlaceholderText(/search tools/i)
    await user.type(input, 'json')

    expect(input).toHaveValue('json')
  })

  it('displays keyboard shortcut hint', () => {
    render(<ToolSearch open={true} onOpenChange={vi.fn()} />)

    // Should show Cmd+K hint (visible on desktop)
    const kbdElements = screen.getAllByText(/k/i)
    expect(kbdElements.length).toBeGreaterThan(0)
  })

  it('has close button', () => {
    render(<ToolSearch open={true} onOpenChange={vi.fn()} />)

    // X icon button should be present
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
