import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import CronExpressionPage from '../page'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

// Mock analytics tracking
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock clipboard API once before all tests
beforeAll(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn(() => Promise.resolve()),
    },
    writable: true,
    configurable: true,
  })
})

describe('CronExpressionPage', () => {
  it('should render the page title', () => {
    render(<CronExpressionPage />)
    expect(screen.getByText('Cron Expression Builder')).toBeInTheDocument()
  })

  it('should render the main expression input', () => {
    render(<CronExpressionPage />)
    const input = screen.getByDisplayValue('0 9 * * 1-5')
    expect(input).toBeInTheDocument()
  })

  it('should show human-readable description', () => {
    render(<CronExpressionPage />)
    expect(screen.getByText(/Runs at 09:00 Monday through Friday/i)).toBeInTheDocument()
  })

  it('should render visual builder section', () => {
    render(<CronExpressionPage />)
    expect(screen.getByText('Visual Builder')).toBeInTheDocument()
  })

  it('should render common patterns', () => {
    render(<CronExpressionPage />)
    // Check for common patterns - at least one should be visible
    const patterns = screen.queryAllByText(/Every|Daily|Weekly|Monthly/)
    expect(patterns.length).toBeGreaterThan(0)
  })

  it('should render next executions section', () => {
    render(<CronExpressionPage />)
    expect(screen.getByText('Next 10 Executions')).toBeInTheDocument()
  })

  it('should render export section', () => {
    render(<CronExpressionPage />)
    expect(screen.getByText('Export Configuration')).toBeInTheDocument()
  })

  it('should have copy button', () => {
    render(<CronExpressionPage />)
    const copyButtons = screen.getAllByRole('button', { name: /copy/i })
    expect(copyButtons.length).toBeGreaterThan(0)
  })
})
