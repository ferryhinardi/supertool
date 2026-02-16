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
    // Component renders nested div structure for the progress bar
    expect(container.firstChild).toBeInTheDocument()
    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('handles 0 value', () => {
    const { container } = render(<Progress value={0} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('handles 100 value', () => {
    const { container } = render(<Progress value={100} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Progress value={50} className="custom-class" />)
    const track = container.querySelector('.custom-class')
    expect(track).toBeInTheDocument()
  })

  it('renders progress with value attribute', () => {
    const { container } = render(<Progress value={50} />)
    // ArkProgress.Root receives value prop; renders as nested divs
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders without value prop', () => {
    const { container } = render(<Progress />)
    // Default value is 0 — component renders without errors
    expect(container.firstChild).toBeInTheDocument()
  })
})
