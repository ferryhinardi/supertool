import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ExportButton } from '../export-button'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ExportButton', () => {
  const mockData = { name: 'Test', value: 123 }

  it('renders export button with default text', () => {
    render(
      <ExportButton
        config={{
          data: mockData,
          filename: 'test',
          format: 'json',
        }}
      />
    )

    expect(screen.getByText(/Export JSON/i)).toBeInTheDocument()
  })

  it('renders with custom button text', () => {
    render(
      <ExportButton
        config={{
          data: mockData,
          filename: 'test',
          format: 'json',
        }}
        buttonText="Download Now"
      />
    )

    expect(screen.getByText('Download Now')).toBeInTheDocument()
  })

  it('renders download icon by default', () => {
    const { container } = render(
      <ExportButton
        config={{
          data: mockData,
          filename: 'test',
          format: 'json',
        }}
      />
    )

    // Check for Download icon (svg)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('hides icon when showIcon is false', () => {
    const { container } = render(
      <ExportButton
        config={{
          data: mockData,
          filename: 'test',
          format: 'json',
        }}
        showIcon={false}
      />
    )

    const svg = container.querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })

  it('button is clickable', async () => {
    const user = userEvent.setup()

    render(
      <ExportButton
        config={{
          data: mockData,
          filename: 'test',
          format: 'json',
        }}
      />
    )

    const button = screen.getByText(/Export JSON/i)
    await user.click(button)

    // Button should still be in document after click
    expect(button).toBeInTheDocument()
  })

  it('supports CSV format', () => {
    render(
      <ExportButton
        config={{
          data: [mockData],
          filename: 'test',
          format: 'csv',
        }}
      />
    )

    expect(screen.getByText(/Export CSV/i)).toBeInTheDocument()
  })

  it('supports TXT format', () => {
    render(
      <ExportButton
        config={{
          data: 'test content',
          filename: 'test',
          format: 'txt',
        }}
      />
    )

    expect(screen.getByText(/Export TXT/i)).toBeInTheDocument()
  })

  it('renders with custom children', () => {
    render(
      <ExportButton
        config={{
          data: mockData,
          filename: 'test',
          format: 'json',
        }}
      >
        Custom Export Text
      </ExportButton>
    )

    expect(screen.getByText('Custom Export Text')).toBeInTheDocument()
  })
})
