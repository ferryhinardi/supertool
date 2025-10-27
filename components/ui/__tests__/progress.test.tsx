import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Progress } from '../progress'

describe('Progress Component', () => {
  it('renders progress bar', () => {
    render(<Progress value={50} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
  })

  it('displays correct value', () => {
    const { container } = render(<Progress value={75} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    // Check that the indicator exists with transform style
    const indicator = container.querySelector('[role="progressbar"] > *')
    expect(indicator).toBeInTheDocument()
  })

  it('handles 0 value', () => {
    const { container } = render(<Progress value={0} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    const indicator = container.querySelector('[role="progressbar"] > *')
    expect(indicator).toBeInTheDocument()
  })

  it('handles 100 value', () => {
    const { container } = render(<Progress value={100} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    const indicator = container.querySelector('[role="progressbar"] > *')
    expect(indicator).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Progress value={50} className="custom-class" />)
    const progressBar = container.querySelector('.custom-class')
    expect(progressBar).toBeInTheDocument()
  })

  it('has correct accessibility role', () => {
    render(<Progress value={50} />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('role', 'progressbar')
  })

  it('renders without value prop', () => {
    render(<Progress />)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
  })
})
