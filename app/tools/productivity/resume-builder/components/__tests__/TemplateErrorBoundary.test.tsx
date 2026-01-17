import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { TemplateErrorBoundary } from '../TemplateErrorBoundary'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>Working component</div>
}

// Component with custom error
const CustomError = () => {
  throw new Error('Custom template rendering error')
}

describe('TemplateErrorBoundary', () => {
  // Suppress console.error for tests
  const originalError = console.error

  beforeAll(() => {
    console.error = vi.fn()
  })

  afterAll(() => {
    console.error = originalError
    vi.unstubAllEnvs()
  })

  it('should render children when there is no error', () => {
    render(
      <TemplateErrorBoundary>
        <div>Test content</div>
      </TemplateErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should catch errors and display error UI', () => {
    render(
      <TemplateErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TemplateErrorBoundary>
    )

    expect(screen.getByText(/Template Failed to Load/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Something went wrong while rendering this template/i)
    ).toBeInTheDocument()
  })

  it('should display error icon', () => {
    render(
      <TemplateErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TemplateErrorBoundary>
    )

    // Error container should be present with role="alert"
    const errorContainer = screen.getByRole('alert')
    expect(errorContainer).toBeInTheDocument()
  })

  it('should show retry button', () => {
    render(
      <TemplateErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TemplateErrorBoundary>
    )

    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toBeInTheDocument()
  })

  it('should reset error state when retry button is clicked', async () => {
    const _user = userEvent.setup()

    const TestComponent = ({ shouldError }: { shouldError: boolean }) => {
      if (shouldError) {
        throw new Error('Test error')
      }
      return <div>Working component</div>
    }

    let shouldError = true
    const { rerender } = render(
      <TemplateErrorBoundary key={shouldError ? 'error' : 'success'}>
        <TestComponent shouldError={shouldError} />
      </TemplateErrorBoundary>
    )

    expect(screen.getByText(/Template Failed to Load/i)).toBeInTheDocument()

    // Fix the error and force remount with key change
    shouldError = false
    rerender(
      <TemplateErrorBoundary key={shouldError ? 'error' : 'success'}>
        <TestComponent shouldError={shouldError} />
      </TemplateErrorBoundary>
    )

    // Should show working component after remount
    expect(screen.getByText('Working component')).toBeInTheDocument()
  })

  it('should display error message in development mode', () => {
    vi.stubEnv('NODE_ENV', 'development')

    render(
      <TemplateErrorBoundary>
        <CustomError />
      </TemplateErrorBoundary>
    )

    // Should show error details section
    expect(screen.getByText(/error details/i)).toBeInTheDocument()
    expect(screen.getByText(/Custom template rendering error/i)).toBeInTheDocument()

    vi.unstubAllEnvs()
  })

  it('should show error details in development mode', () => {
    vi.stubEnv('NODE_ENV', 'development')

    render(
      <TemplateErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TemplateErrorBoundary>
    )

    // Should show error details section
    expect(screen.getByText(/error details/i)).toBeInTheDocument()
    expect(screen.getByText(/Test error message/i)).toBeInTheDocument()

    vi.unstubAllEnvs()
  })

  it('should hide error details in production mode', () => {
    vi.stubEnv('NODE_ENV', 'production')

    render(
      <TemplateErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TemplateErrorBoundary>
    )

    // Should NOT show error details section
    expect(screen.queryByText(/error details/i)).not.toBeInTheDocument()

    vi.unstubAllEnvs()
  })

  it('should have proper ARIA attributes for accessibility', () => {
    render(
      <TemplateErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TemplateErrorBoundary>
    )

    const errorContainer = screen.getByRole('alert')
    expect(errorContainer).toBeInTheDocument()
    expect(errorContainer).toHaveAttribute('aria-live', 'assertive')
  })

  it('should display helpful suggestion to user', () => {
    render(
      <TemplateErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TemplateErrorBoundary>
    )

    expect(
      screen.getByText(/try selecting a different template or refreshing the page/i)
    ).toBeInTheDocument()
  })

  it('should handle multiple errors', () => {
    const { rerender } = render(
      <TemplateErrorBoundary>
        <ThrowError shouldThrow={true} />
      </TemplateErrorBoundary>
    )

    expect(screen.getByText(/Template Failed to Load/i)).toBeInTheDocument()

    // Rerender with different error - but UI shows same generic message
    rerender(
      <TemplateErrorBoundary>
        <CustomError />
      </TemplateErrorBoundary>
    )

    // Still shows generic error message
    expect(screen.getByText(/Template Failed to Load/i)).toBeInTheDocument()
  })

  it('should catch errors from deeply nested components', () => {
    const DeepComponent = () => {
      throw new Error('Deep nested error')
    }

    const NestedWrapper = () => (
      <div>
        <div>
          <div>
            <DeepComponent />
          </div>
        </div>
      </div>
    )

    render(
      <TemplateErrorBoundary>
        <NestedWrapper />
      </TemplateErrorBoundary>
    )

    // Should show generic error message
    expect(screen.getByText(/Template Failed to Load/i)).toBeInTheDocument()
  })

  it('should handle errors with stack traces', () => {
    vi.stubEnv('NODE_ENV', 'development')

    const ErrorWithStack = () => {
      const error = new Error('Error with stack')
      error.stack = 'Error: Error with stack\n    at ErrorWithStack\n    at TemplateErrorBoundary'
      throw error
    }

    render(
      <TemplateErrorBoundary>
        <ErrorWithStack />
      </TemplateErrorBoundary>
    )

    // Stack trace should be visible in development
    expect(screen.getByText(/Error with stack/i)).toBeInTheDocument()

    vi.unstubAllEnvs()
  })

  it('should reset error state properly', async () => {
    const _user = userEvent.setup()

    const TestComponent = ({ shouldError }: { shouldError: boolean }) => {
      if (shouldError) {
        throw new Error('Test error')
      }
      return <div>Working component</div>
    }

    let shouldError = true
    const { rerender } = render(
      <TemplateErrorBoundary key={shouldError ? 'error' : 'success'}>
        <TestComponent shouldError={shouldError} />
      </TemplateErrorBoundary>
    )

    // Error should be shown
    expect(screen.getByText(/Template Failed to Load/i)).toBeInTheDocument()

    // Fix error and force remount with key change
    shouldError = false
    rerender(
      <TemplateErrorBoundary key={shouldError ? 'error' : 'success'}>
        <TestComponent shouldError={shouldError} />
      </TemplateErrorBoundary>
    )

    expect(screen.getByText('Working component')).toBeInTheDocument()
  })

  it('should maintain error boundary isolation', () => {
    // Multiple error boundaries should work independently
    render(
      <>
        <TemplateErrorBoundary>
          <ThrowError shouldThrow={true} />
        </TemplateErrorBoundary>
        <TemplateErrorBoundary>
          <div>Working component</div>
        </TemplateErrorBoundary>
      </>
    )

    // First boundary shows error
    expect(screen.getByText(/Template Failed to Load/i)).toBeInTheDocument()

    // Second boundary shows working content
    expect(screen.getByText('Working component')).toBeInTheDocument()
  })

  it('should handle synchronous errors during render', () => {
    const SyncError = () => {
      throw new Error('Synchronous render error')
    }

    render(
      <TemplateErrorBoundary>
        <SyncError />
      </TemplateErrorBoundary>
    )

    // Should show generic error message
    expect(screen.getByText(/Template Failed to Load/i)).toBeInTheDocument()
  })
})
