import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Progress } from '../progress'

describe('Progress Component', () => {
  it('renders progress bar', () => {
    const { container } = render(<Progress value={50} />)
    // Progress renders a wrapper div with nested structure
    expect(container.firstChild).toBeInTheDocument()
  })

  it('displays correct value', () => {
    render(<Progress value={75} />)
    // Ark UI Progress renders role="progressbar" with aria-valuenow
    const progressElement = screen.getByRole('progressbar')
    expect(progressElement).toBeInTheDocument()
    expect(progressElement).toHaveAttribute('aria-valuenow', '75')
  })

  it('handles 0 value', () => {
    render(<Progress value={0} />)
    const progressElement = screen.getByRole('progressbar')
    expect(progressElement).toBeInTheDocument()
    expect(progressElement).toHaveAttribute('aria-valuenow', '0')
  })

  it('handles 100 value', () => {
    render(<Progress value={100} />)
    const progressElement = screen.getByRole('progressbar')
    expect(progressElement).toBeInTheDocument()
    expect(progressElement).toHaveAttribute('aria-valuenow', '100')
  })

  it('applies custom className', () => {
    const { container } = render(<Progress value={50} className="custom-class" />)
    const track = container.querySelector('.custom-class')
    expect(track).toBeInTheDocument()
  })

  it('renders progress with value attribute', () => {
    render(<Progress value={50} />)
    const progressElement = screen.getByRole('progressbar')
    expect(progressElement).toBeInTheDocument()
    expect(progressElement).toHaveAttribute('aria-valuenow', '50')
  })

  it('renders without value prop', () => {
    render(<Progress />)
    // Default value is 0
    const progressElement = screen.getByRole('progressbar')
    expect(progressElement).toBeInTheDocument()
    expect(progressElement).toHaveAttribute('aria-valuenow', '0')
  })
})
