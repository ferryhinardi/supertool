import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReactQueryProvider } from '../ReactQueryProvider'

describe('ReactQueryProvider', () => {
  it('renders children correctly', () => {
    render(
      <ReactQueryProvider>
        <div>Test Child</div>
      </ReactQueryProvider>
    )

    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('passes through multiple children', () => {
    render(
      <ReactQueryProvider>
        <div>Child 1</div>
        <div>Child 2</div>
      </ReactQueryProvider>
    )

    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })

  it('provides QueryClientProvider context', () => {
    const { container } = render(
      <ReactQueryProvider>
        <div>Test</div>
      </ReactQueryProvider>
    )

    // Should render without errors if QueryClient is properly initialized
    expect(container).toBeTruthy()
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
