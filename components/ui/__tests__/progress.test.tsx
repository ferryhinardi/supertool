import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Progress } from '../progress'

describe('Progress Component', () => {
  it('renders progress bar', () => {
    const { container } = render(<Progress value={50} />)
    // Progress renders a wrapper div with nested structure
    expect(container.firstChild).toBeInTheDocument()
  })

  it('displays correct value', () => {
    const { container } = render(<Progress value={75} />)
    // Ark UI Progress has a div with value attribute
    const progressElement = container.querySelector('[value="75"]')
    expect(progressElement).toBeInTheDocument()
  })

  it('handles 0 value', () => {
    const { container } = render(<Progress value={0} />)
    const progressElement = container.querySelector('[value="0"]')
    expect(progressElement).toBeInTheDocument()
  })

  it('handles 100 value', () => {
    const { container } = render(<Progress value={100} />)
    const progressElement = container.querySelector('[value="100"]')
    expect(progressElement).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Progress value={50} className="custom-class" />)
    const track = container.querySelector('.custom-class')
    expect(track).toBeInTheDocument()
  })

  it('renders progress with value attribute', () => {
    const { container } = render(<Progress value={50} />)
    const progressElement = container.querySelector('[value="50"]')
    expect(progressElement).toBeInTheDocument()
    expect(progressElement).toHaveAttribute('value', '50')
  })

  it('renders without value prop', () => {
    const { container } = render(<Progress />)
    // Default value is 0
    const progressElement = container.querySelector('[value="0"]')
    expect(progressElement).toBeInTheDocument()
  })
})
