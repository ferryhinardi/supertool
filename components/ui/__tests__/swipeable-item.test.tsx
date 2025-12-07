import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SwipeableItem, SwipeHint } from '../swipeable-item'

// Mock the useSwipeToDelete hook
vi.mock('@/hooks/useSwipeGesture', () => ({
  useSwipeToDelete: vi.fn(() => ({
    handlers: {
      onTouchStart: vi.fn(),
      onTouchMove: vi.fn(),
      onTouchEnd: vi.fn(),
      onMouseDown: vi.fn(),
      onMouseMove: vi.fn(),
      onMouseUp: vi.fn(),
    },
    isDeleting: false,
    deleteProgress: 0,
    isSwiping: false,
    swipeDirection: null,
  })),
}))

describe('SwipeableItem', () => {
  it('renders children correctly', () => {
    render(
      <SwipeableItem onDelete={vi.fn()}>
        <div>Test content</div>
      </SwipeableItem>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders without swipe functionality when disabled', () => {
    const { container } = render(
      <SwipeableItem onDelete={vi.fn()} disabled={true} className="test-class">
        <div>Test content</div>
      </SwipeableItem>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
    // Should render simple div when disabled
    expect(container.querySelector('.test-class')).toBeInTheDocument()
  })

  it('displays delete label in background indicator', () => {
    render(
      <SwipeableItem onDelete={vi.fn()} deleteLabel="Remove Item">
        <div>Test content</div>
      </SwipeableItem>
    )

    expect(screen.getByText('Remove Item')).toBeInTheDocument()
  })

  it('uses default delete label when not provided', () => {
    render(
      <SwipeableItem onDelete={vi.fn()}>
        <div>Test content</div>
      </SwipeableItem>
    )

    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('applies custom className to content wrapper', () => {
    const { container } = render(
      <SwipeableItem onDelete={vi.fn()} className="custom-class">
        <div>Test content</div>
      </SwipeableItem>
    )

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('renders delete icon', () => {
    const { container } = render(
      <SwipeableItem onDelete={vi.fn()}>
        <div>Test content</div>
      </SwipeableItem>
    )

    // Check for Trash2 icon - it should be in the DOM
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})

describe('SwipeHint', () => {
  it('renders swipe hint message', () => {
    render(<SwipeHint />)

    expect(screen.getByText('Swipe left to delete')).toBeInTheDocument()
  })

  it('renders swipe hint emoji', () => {
    render(<SwipeHint />)

    expect(screen.getByText('👈')).toBeInTheDocument()
  })
})
