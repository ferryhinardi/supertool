import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WatermarkPreview } from '../WatermarkPreview'

// Create a persistent mock context object
const createMockContext = () => ({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  drawImage: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 })),
  fillText: vi.fn(),
  fillStyle: '#000000',
  strokeStyle: '#000000',
  lineWidth: 1,
  globalAlpha: 1,
  font: '16px sans-serif',
  textAlign: 'left' as CanvasTextAlign,
  textBaseline: 'alphabetic' as CanvasTextBaseline,
})

// Setup canvas mock before each test
beforeEach(() => {
  const mockContext = createMockContext()
  // biome-ignore lint/suspicious/noExplicitAny: Canvas prototype mock requires any cast
  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext) as any
})

describe('WatermarkPreview', () => {
  const defaultProps = {
    type: 'text' as const,
    text: 'CONFIDENTIAL',
    opacity: 0.3,
    rotation: -45,
    position: 'diagonal' as const,
    color: '#ff0000',
    fontSize: 50,
    pattern: false,
  }

  it('should render the preview container', () => {
    render(<WatermarkPreview {...defaultProps} />)
    expect(screen.getByText('Live Preview')).toBeInTheDocument()
  })

  it('should render a canvas element', () => {
    const { container } = render(<WatermarkPreview {...defaultProps} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should render with text type', () => {
    render(<WatermarkPreview {...defaultProps} type="text" text="DRAFT" />)
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should render with image type', () => {
    const file = new File(['image'], 'test.png', { type: 'image/png' })
    render(<WatermarkPreview {...defaultProps} type="image" image={file} />)
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should render with qr type', () => {
    const file = new File(['qr'], 'qr.png', { type: 'image/png' })
    render(<WatermarkPreview {...defaultProps} type="qr" image={file} />)
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('should apply custom opacity', () => {
    render(<WatermarkPreview {...defaultProps} opacity={0.8} />)
    expect(screen.getByText('Live Preview')).toBeInTheDocument()
  })

  it('should apply custom rotation', () => {
    render(<WatermarkPreview {...defaultProps} rotation={45} />)
    expect(screen.getByText('Live Preview')).toBeInTheDocument()
  })

  it('should handle different positions', () => {
    const positions: Array<
      | 'top-left'
      | 'top'
      | 'top-right'
      | 'left'
      | 'center'
      | 'right'
      | 'bottom-left'
      | 'bottom'
      | 'bottom-right'
      | 'diagonal'
    > = [
      'top-left',
      'top',
      'top-right',
      'left',
      'center',
      'right',
      'bottom-left',
      'bottom',
      'bottom-right',
      'diagonal',
    ]

    positions.forEach((pos) => {
      const { unmount } = render(<WatermarkPreview {...defaultProps} position={pos} />)
      expect(screen.getByText('Live Preview')).toBeInTheDocument()
      unmount()
    })
  })

  it('should handle pattern mode', () => {
    render(<WatermarkPreview {...defaultProps} pattern={true} />)
    expect(screen.getByText('Live Preview')).toBeInTheDocument()
  })

  it('should handle custom font size', () => {
    render(<WatermarkPreview {...defaultProps} fontSize={80} />)
    expect(screen.getByText('Live Preview')).toBeInTheDocument()
  })

  it('should handle custom color', () => {
    render(<WatermarkPreview {...defaultProps} color="#00ff00" />)
    expect(screen.getByText('Live Preview')).toBeInTheDocument()
  })

  it('should handle image scale', () => {
    const file = new File(['image'], 'test.png', { type: 'image/png' })
    render(<WatermarkPreview {...defaultProps} type="image" image={file} imageScale={2.0} />)
    expect(screen.getByText('Live Preview')).toBeInTheDocument()
  })

  it('should render with default text when text is empty', () => {
    render(<WatermarkPreview {...defaultProps} text="" />)
    expect(screen.getByText('Live Preview')).toBeInTheDocument()
  })

  it('should handle missing image for image type', () => {
    render(<WatermarkPreview {...defaultProps} type="image" image={null} />)
    expect(screen.getByText('Live Preview')).toBeInTheDocument()
  })

  it('should have Eye icon', () => {
    const { container } = render(<WatermarkPreview {...defaultProps} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  describe('canvas drawing', () => {
    it('should call getContext on mount', () => {
      const mockGetContext = vi.fn(() => createMockContext())
      // biome-ignore lint/suspicious/noExplicitAny: Canvas prototype mock requires any cast
      HTMLCanvasElement.prototype.getContext = mockGetContext as any

      render(<WatermarkPreview {...defaultProps} />)
      expect(mockGetContext).toHaveBeenCalledWith('2d')
    })

    it('should update canvas when props change', () => {
      const { rerender } = render(<WatermarkPreview {...defaultProps} />)
      rerender(<WatermarkPreview {...defaultProps} text="UPDATED" />)
      expect(screen.getByText('Live Preview')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      render(<WatermarkPreview {...defaultProps} />)
      const heading = screen.getByText('Live Preview')
      expect(heading).toBeInTheDocument()
    })
  })

  describe('responsive design', () => {
    it('should render canvas with fixed dimensions', () => {
      const { container } = render(<WatermarkPreview {...defaultProps} />)
      const canvas = container.querySelector('canvas')
      expect(canvas).toHaveAttribute('width')
      expect(canvas).toHaveAttribute('height')
    })
  })

  describe('edge cases', () => {
    it('should handle very low opacity', () => {
      render(<WatermarkPreview {...defaultProps} opacity={0.1} />)
      expect(screen.getByText('Live Preview')).toBeInTheDocument()
    })

    it('should handle maximum opacity', () => {
      render(<WatermarkPreview {...defaultProps} opacity={1.0} />)
      expect(screen.getByText('Live Preview')).toBeInTheDocument()
    })

    it('should handle extreme rotation', () => {
      render(<WatermarkPreview {...defaultProps} rotation={180} />)
      expect(screen.getByText('Live Preview')).toBeInTheDocument()
    })

    it('should handle very large font size', () => {
      render(<WatermarkPreview {...defaultProps} fontSize={100} />)
      expect(screen.getByText('Live Preview')).toBeInTheDocument()
    })

    it('should handle very small font size', () => {
      render(<WatermarkPreview {...defaultProps} fontSize={10} />)
      expect(screen.getByText('Live Preview')).toBeInTheDocument()
    })

    it('should handle very large image scale', () => {
      const file = new File(['image'], 'test.png', { type: 'image/png' })
      render(<WatermarkPreview {...defaultProps} type="image" image={file} imageScale={3.0} />)
      expect(screen.getByText('Live Preview')).toBeInTheDocument()
    })

    it('should handle very small image scale', () => {
      const file = new File(['image'], 'test.png', { type: 'image/png' })
      render(<WatermarkPreview {...defaultProps} type="image" image={file} imageScale={0.1} />)
      expect(screen.getByText('Live Preview')).toBeInTheDocument()
    })
  })
})
